/**
 * Translation Proxy Worker (Cloudflare Workers)
 * Features: CORS whitelist + Free Google Translate Fallback + Baidu API
 *
 * Deployment Instructions:
 * 1. Create a new Cloudflare Worker.
 * 2. Paste this code into the editor.
 * 3. Set Environment Variables: BAIDU_APP_ID, BAIDU_KEY
 * 4. Deploy and update PROXY_URL in your extension.
 */

// Helper to map Baidu language codes to Google Translate language codes
function mapBaiduToGoogleLang(baiduLang) {
  const map = {
    'zh': 'zh-CN',
    'jp': 'ja',
    'kor': 'ko',
    'spa': 'es',
    'fra': 'fr',
    'ara': 'ar'
    // others like en, de, th, ru, pt, it, el, nl are identical
  };
  return map[baiduLang] || baiduLang;
}

export default {
  async fetch(request, env, ctx) {
    const ALLOWED_ORIGINS = [
      "chrome-extension://gjlcjkmjkddibjhihgkpimgfjopnmidb", // Production ID
      "chrome-extension://mkhhddnpjijppnjhgomceoccpepiljmb"  // Local Development ID
    ];
    
    const origin = request.headers.get("origin") || "";
    const isAllowed = ALLOWED_ORIGINS.includes(origin);
    const corsOrigin = isAllowed ? origin : ALLOWED_ORIGINS[0]; // Fallback to first for preflight if origin is empty

    // 1. CORS Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": corsOrigin,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // 🔒 Origin Security Check
    if (request.method !== "POST" || !isAllowed) {
      return new Response(JSON.stringify({ error: "Access denied. Unauthorized origin." }), {
        status: 403,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": corsOrigin
        }
      });
    }

    try {
      const { text, lang } = await request.json();

      if (!text || !lang) {
        return new Response(JSON.stringify({ error: "Missing parameters" }), { 
          status: 400,
          headers: { "Access-Control-Allow-Origin": corsOrigin }
        });
      }

      const commonHeaders = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": corsOrigin,
      };

      // --- 🚀 Channel 1: Free Google Translate API (With 1000ms Timeout) ---
      try {
        const googleLang = mapBaiduToGoogleLang(lang);
        const googleUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${googleLang}&dt=t&q=${encodeURIComponent(text)}`;
        
        // 1000ms hard timeout for Google API
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1000);

        const googleRes = await fetch(googleUrl, { signal: controller.signal });
        clearTimeout(timeoutId); // Clear timeout if fetch succeeds early

        if (googleRes.ok) {
          const googleData = await googleRes.json();
          let translatedText = '';
          
          if (googleData && googleData[0]) {
            googleData[0].forEach(item => {
              if (item[0]) translatedText += item[0];
            });
          }

          if (translatedText) {
            // Mock Baidu's response structure so the extension doesn't need to change
            const mockBaiduResponse = {
              from: 'auto',
              to: lang,
              trans_result: [{
                src: text,
                dst: translatedText
              }]
            };
            return new Response(JSON.stringify(mockBaiduResponse), { headers: commonHeaders });
          }
        }
      } catch (googleError) {
        // Silently catch Google API errors (e.g., rate limits) and fallback to Baidu
        console.warn("Google Translate failed, falling back to Baidu:", googleError);
      }

      // --- 💰 Channel 2: Fallback to Paid Baidu API ---
      const appid = env.BAIDU_APP_ID;
      const key = env.BAIDU_KEY;
      
      if (!appid || !key) {
        return new Response(JSON.stringify({ error: "Server missing Baidu configuration" }), { status: 500, headers: commonHeaders });
      }

      const salt = Date.now().toString();
      const sign = await md5(appid + text + salt + key);

      const params = new URLSearchParams({
        q: text,
        appid: appid,
        salt: salt,
        from: 'auto',
        to: lang,
        sign: sign
      });

      const baiduResponse = await fetch('https://api.fanyi.baidu.com/api/trans/vip/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
      });

      const baiduData = await baiduResponse.json();

      return new Response(JSON.stringify(baiduData), { headers: commonHeaders });
      
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          "Access-Control-Allow-Origin": corsOrigin 
        },
      });
    }
  }
};

/**
 * Minimal MD5 implementation for Cloudflare Workers
 */
async function md5(message) {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("MD5", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}
