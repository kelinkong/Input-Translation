/**
 * Translation Proxy Worker (Cloudflare Workers)
 * Features: CORS whitelist + IP Rate Limiting + Hard Length Limit + Baidu API
 *
 * Deployment Instructions:
 * 1. Create a new Cloudflare Worker.
 * 2. Paste this code into the editor.
 * 3. Set Environment Variables: BAIDU_APP_ID, BAIDU_KEY
 * 4. Deploy!
 */

// Simple In-Memory Rate Limiter (Per Cloudflare Isolate)
const ipRequests = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_MIN = 20; // Max 20 translations per minute per IP

function checkRateLimit(ip) {
  if (!ip) return true; // Pass if IP is missing for some reason
  const now = Date.now();
  const record = ipRequests.get(ip) || { count: 0, startTime: now };
  
  if (now - record.startTime > RATE_LIMIT_WINDOW) {
    record.count = 1;
    record.startTime = now;
  } else {
    record.count++;
  }
  
  ipRequests.set(ip, record);
  
  // Optional: Clean up old entries occasionally to prevent memory leaks in the isolate
  if (ipRequests.size > 1000) {
     const oldestKey = ipRequests.keys().next().value;
     ipRequests.delete(oldestKey);
  }
  
  return record.count <= MAX_REQUESTS_PER_MIN;
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

    // 🔒 IP Rate Limiting Check
    const clientIP = request.headers.get("cf-connecting-ip") || "";
    if (!checkRateLimit(clientIP)) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
        status: 429,
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

      // 🔒 Hard Text Length Limit Check (2000 characters)
      if (text.length > 2000) {
        return new Response(JSON.stringify({ error: "Text too long. Maximum 2000 characters allowed per request." }), { 
          status: 413, // Payload Too Large
          headers: { "Access-Control-Allow-Origin": corsOrigin }
        });
      }

      const commonHeaders = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": corsOrigin,
      };

      // --- 💰 Paid Baidu API ---
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

      if (!baiduResponse.ok) {
        throw new Error(`Baidu API HTTP Error: ${baiduResponse.status}`);
      }

      let baiduData;
      try {
        baiduData = await baiduResponse.json();
      } catch (parseError) {
         throw new Error("Failed to parse Baidu API response.");
      }

      return new Response(JSON.stringify(baiduData), { headers: commonHeaders });
      
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message || "Internal Proxy Error" }), {
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
