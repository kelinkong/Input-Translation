import os
from PIL import Image, ImageDraw, ImageFont

def get_font(font_name, size):
    paths = [
        f"/System/Library/Fonts/Supplemental/{font_name}.ttf",
        f"/System/Library/Fonts/{font_name}.ttc",
        f"/System/Library/Fonts/Supplemental/{font_name}.ttc",
        f"/System/Library/Fonts/{font_name}.ttf",
    ]
    for path in paths:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                pass
    return ImageFont.load_default()

def create_promo_small():
    # 440 x 280
    width, height = 440, 280
    img = Image.new("RGBA", (width, height))
    draw = ImageDraw.Draw(img)
    
    # 1. Gradient Background (Teal/Dark Blue gradient)
    # Average color: (26, 86, 108) -> #1a566c
    # End color: #0d1e2d
    for y in range(height):
        # Linear interpolation
        r = int(26 + (13 - 26) * (y / height))
        g = int(86 + (30 - 86) * (y / height))
        b = int(108 + (45 - 108) * (y / height))
        draw.line([(0, y), (width, y)], fill=(r, g, b, 255))
        
    # 2. Add subtle grid pattern for modern developer look
    grid_size = 20
    for x in range(0, width, grid_size):
        draw.line([(x, 0), (x, height)], fill=(255, 255, 255, 10))
    for y in range(0, height, grid_size):
        draw.line([(0, y), (width, y)], fill=(255, 255, 255, 10))
        
    # 3. Load icon.png (296x296) and resize to 96x96
    icon_path = "images/icon.png"
    if os.path.exists(icon_path):
        icon = Image.open(icon_path).convert("RGBA")
        icon = icon.resize((96, 96), Image.Resampling.LANCZOS)
        # Paste icon with transparency
        img.paste(icon, (35, 92), icon)
    else:
        # Fallback circle if icon is missing
        draw.ellipse([35, 92, 131, 188], fill=(59, 130, 246, 255))
        
    # 4. Draw text
    font_bold = get_font("Helvetica", 28)
    font_regular = get_font("Helvetica", 14)
    font_mono = get_font("Courier New", 12)
    
    # Title
    draw.text((150, 105), "Input Translation", fill=(255, 255, 255, 255), font=font_bold)
    
    # Subtitle
    draw.text((150, 145), "Seamless Input & Web Translator", fill=(200, 230, 245, 255), font=font_regular)
    
    # Feature tag / Badge
    draw.rounded_rectangle([150, 175, 290, 198], radius=4, fill=(59, 130, 246, 60), outline=(59, 130, 246, 120))
    draw.text((160, 180), "Keyboard Magic /zh", fill=(147, 197, 253, 255), font=font_mono)
    
    # Save image
    os.makedirs("store_assets", exist_ok=True)
    img.save("store_assets/promo_small.png", "PNG")
    print("Generated promo_small.png")

def create_screenshot_1():
    # 1280 x 800
    width, height = 1280, 800
    img = Image.new("RGBA", (width, height))
    draw = ImageDraw.Draw(img)
    
    # 1. Dark Slate modern background
    for y in range(height):
        r = int(15 + (30 - 15) * (y / height))
        g = int(23 + (41 - 23) * (y / height))
        b = int(42 + (59 - 42) * (y / height))
        draw.line([(0, y), (width, y)], fill=(r, g, b, 255))
        
    # Subtle background pattern
    grid_size = 40
    for x in range(0, width, grid_size):
        draw.line([(x, 0), (x, height)], fill=(255, 255, 255, 4))
    for y in range(0, height, grid_size):
        draw.line([(0, y), (width, y)], fill=(255, 255, 255, 4))
        
    # 2. Draw mock browser window
    bx, by, bw, bh = 140, 100, 1000, 600
    # Browser border & background
    draw.rounded_rectangle([bx, by, bx + bw, by + bh], radius=12, fill=(30, 41, 59, 255), outline=(51, 65, 85, 255), width=2)
    
    # Browser window controls (Traffic lights)
    draw.ellipse([bx + 20, by + 16, bx + 32, by + 28], fill=(239, 68, 68, 255))  # Red
    draw.ellipse([bx + 40, by + 16, bx + 52, by + 28], fill=(245, 158, 11, 255)) # Yellow
    draw.ellipse([bx + 60, by + 16, bx + 72, by + 28], fill=(16, 185, 129, 255))  # Green
    
    # Browser Address Bar (Omnibox Mockup)
    ax, ay, aw, ah = bx + 120, by + 10, 600, 32
    draw.rounded_rectangle([ax, ay, ax + aw, ay + ah], radius=6, fill=(15, 23, 42, 255), outline=(51, 65, 85, 255))
    
    font_address = get_font("Courier New", 13)
    draw.text((ax + 15, ay + 8), "tr hello world/zh", fill=(148, 163, 184, 255), font=font_address)
    
    # Omnibox dropdown result mockup
    dx, dy, dw, dh = ax, ay + ah + 2, aw, 45
    draw.rounded_rectangle([dx, dy, dx + dw, dy + dh], radius=6, fill=(30, 41, 59, 255), outline=(59, 130, 246, 255), width=1)
    draw.text((dx + 15, dy + 15), "👉 Translation: 你好世界", fill=(56, 189, 248, 255), font=font_address)
    
    # Browser Page Content Area
    cx, cy, cw, ch = bx + 8, by + 90, bw - 16, bh - 98
    draw.rounded_rectangle([cx, cy, cx + cw, cy + ch], radius=8, fill=(15, 23, 42, 255))
    
    # Mock text editor or ChatGPT interface
    font_bold = get_font("Helvetica", 24)
    font_text = get_font("Helvetica", 16)
    
    # Page Title
    draw.text((cx + 40, cy + 35), "Instant Input Box Translation", fill=(255, 255, 255, 255), font=font_bold)
    
    # Description
    draw.text((cx + 40, cy + 80), "Type a slash (/) and a language code in any input field, then press Space or Enter to translate instantly.", fill=(148, 163, 184, 255), font=font_text)
    
    # Mock Chatbot input field
    ix, iy, iw, ih = cx + 40, cy + 140, cw - 80, 120
    draw.rounded_rectangle([ix, iy, ix + iw, iy + ih], radius=8, fill=(30, 41, 59, 255), outline=(51, 65, 85, 255))
    
    # Icon overlay
    icon_path = "images/icon-128.png"
    if os.path.exists(icon_path):
        icon = Image.open(icon_path).convert("RGBA").resize((24, 24), Image.Resampling.LANCZOS)
        img.paste(icon, (ix + 15, iy + 15), icon)
        
    draw.text((ix + 50, iy + 18), "Input Field Translator", fill=(255, 255, 255, 255), font=get_font("Helvetica", 14))
    
    # Underline divider
    draw.line([(ix, iy + 45), (ix + iw, iy + 45)], fill=(51, 65, 85, 255))
    
    # Input typing text
    draw.text((ix + 20, iy + 65), "I love writing code/zh", fill=(148, 163, 184, 255), font=font_text)
    
    # Active blinker cursor
    draw.line([(ix + 175, iy + 63), (ix + 175, iy + 83)], fill=(59, 130, 246, 255), width=2)
    
    # Floating Instant result tooltip
    rx, ry, rw, rh = ix + 180, iy + 55, 180, 40
    draw.rounded_rectangle([rx, ry, rx + rw, ry + rh], radius=6, fill=(59, 130, 246, 255))
    draw.text((rx + 15, ry + 12), "Press Space to translate", fill=(255, 255, 255, 255), font=get_font("Helvetica", 12))
    
    # Triggered state simulation below
    draw.text((cx + 40, cy + 280), "Result in text box:", fill=(148, 163, 184, 255), font=get_font("Helvetica", 14))
    
    ix2, iy2, iw2, ih2 = cx + 40, cy + 310, cw - 80, 60
    draw.rounded_rectangle([ix2, iy2, ix2 + iw2, iy2 + ih2], radius=8, fill=(30, 41, 59, 255), outline=(16, 185, 129, 255), width=1)
    draw.text((ix2 + 20, iy2 + 20), "我喜欢编写代码", fill=(16, 185, 129, 255), font=font_text)
    
    # Success badge
    draw.rounded_rectangle([ix2 + iw2 - 120, iy2 + 15, ix2 + iw2 - 20, iy2 + 45], radius=15, fill=(16, 185, 129, 40), outline=(16, 185, 129, 120))
    draw.text((ix2 + iw2 - 95, iy2 + 23), "Translated", fill=(52, 211, 153, 255), font=get_font("Helvetica", 11))
    
    # Save screenshot
    img.save("store_assets/screenshot_1.png", "PNG")
    print("Generated screenshot_1.png")

def create_screenshot_2():
    # 1280 x 800 - Selection & Hover Translation Mockup
    width, height = 1280, 800
    img = Image.new("RGBA", (width, height))
    draw = ImageDraw.Draw(img)
    
    # 1. Slate modern background
    for y in range(height):
        r = int(15 + (30 - 15) * (y / height))
        g = int(23 + (41 - 23) * (y / height))
        b = int(42 + (59 - 42) * (y / height))
        draw.line([(0, y), (width, y)], fill=(r, g, b, 255))
        
    # Grid pattern
    grid_size = 40
    for x in range(0, width, grid_size):
        draw.line([(x, 0), (x, height)], fill=(255, 255, 255, 4))
    for y in range(0, height, grid_size):
        draw.line([(0, y), (width, y)], fill=(255, 255, 255, 4))
        
    # 2. Draw mock browser window
    bx, by, bw, bh = 140, 100, 1000, 600
    draw.rounded_rectangle([bx, by, bx + bw, by + bh], radius=12, fill=(30, 41, 59, 255), outline=(51, 65, 85, 255), width=2)
    
    # Browser Traffic lights
    draw.ellipse([bx + 20, by + 16, bx + 32, by + 28], fill=(239, 68, 68, 255))
    draw.ellipse([bx + 40, by + 16, bx + 52, by + 28], fill=(245, 158, 11, 255))
    draw.ellipse([bx + 60, by + 16, bx + 72, by + 28], fill=(16, 185, 129, 255))
    
    # Browser Address Bar
    ax, ay, aw, ah = bx + 120, by + 10, 600, 32
    draw.rounded_rectangle([ax, ay, ax + aw, ay + ah], radius=6, fill=(15, 23, 42, 255), outline=(51, 65, 85, 255))
    draw.text((ax + 15, ay + 8), "https://en.wikipedia.org/wiki/Translation", fill=(148, 163, 184, 255), font=get_font("Helvetica", 12))
    
    # Browser Content Area (Light mode Wikipedia mockup for contrast!)
    cx, cy, cw, ch = bx + 8, by + 55, bw - 16, bh - 63
    draw.rounded_rectangle([cx, cy, cx + cw, cy + ch], radius=8, fill=(255, 255, 255, 255))
    
    font_title = get_font("Helvetica", 28)
    font_para = get_font("Helvetica", 16)
    
    # Article Title
    draw.text((cx + 50, cy + 50), "Translation Technology", fill=(15, 23, 42, 255), font=font_title)
    
    # Article divider
    draw.line([(cx + 50, cy + 95), (cx + cw - 50, cy + 95)], fill=(226, 232, 240, 255), width=1)
    
    # Paragraphs
    para_y = cy + 115
    draw.text((cx + 50, para_y), "Translation is the communication of the meaning of a source-language text", fill=(71, 85, 105, 255), font=font_para)
    draw.text((cx + 50, para_y + 30), "by means of an equivalent target-language text. The browser extension", fill=(71, 85, 105, 255), font=font_para)
    
    # Highlighting text "provides a zero-latency dual-channel fallback"
    highlight_text = "provides a zero-latency dual-channel fallback"
    hx, hy = cx + 50, para_y + 60
    # Highlight rect
    draw.rectangle([hx, hy - 4, hx + 360, hy + 22], fill=(191, 219, 254, 255)) # Light blue selection
    draw.text((hx, hy), highlight_text, fill=(30, 41, 59, 255), font=font_para)
    
    # Remaining sentence
    draw.text((hx + 365, hy), "architecture.", fill=(71, 85, 105, 255), font=font_para)
    draw.text((cx + 50, para_y + 90), "It seamlessly routes queries locally to reduce network overhead.", fill=(71, 85, 105, 255), font=font_para)
    
    # 3. Floating Hover Translation UI (Bubble)
    bx_bubble, by_bubble = hx + 180, hy + 25
    # Tiny trigger button
    draw.rounded_rectangle([bx_bubble - 10, by_bubble - 5, bx_bubble + 15, by_bubble + 15], radius=4, fill=(59, 130, 246, 255))
    # Draw tiny 'T' on trigger
    draw.text((bx_bubble - 3, by_bubble - 2), "T", fill=(255, 255, 255, 255), font=get_font("Helvetica", 11))
    
    # Translation popup box
    px, py, pw, ph = bx_bubble - 50, by_bubble + 20, 320, 110
    draw.rounded_rectangle([px, py, px + pw, py + ph], radius=8, fill=(15, 23, 42, 255), outline=(59, 130, 246, 255), width=2)
    
    # Popup Title
    draw.text((px + 15, py + 12), "Input Translation", fill=(255, 255, 255, 255), font=get_font("Helvetica", 12))
    # Language badge
    draw.rounded_rectangle([px + 230, py + 10, px + 300, py + 26], radius=4, fill=(51, 65, 85, 255))
    draw.text((px + 242, py + 13), "EN ➜ ZH", fill=(147, 197, 253, 255), font=get_font("Helvetica", 10))
    
    draw.line([(px, py + 32), (px + pw, py + 32)], fill=(51, 65, 85, 255))
    
    # Translated content
    draw.text((px + 15, py + 42), "“提供零延迟双通道回退”", fill=(56, 189, 248, 255), font=get_font("Helvetica", 14))
    
    # Footer info
    draw.text((px + 15, py + 85), "Powered by Baidu API Proxy • Open Source", fill=(100, 116, 139, 255), font=get_font("Helvetica", 10))
    
    # Save screenshot_2
    img.save("store_assets/screenshot_2.png", "PNG")
    print("Generated screenshot_2.png")

def create_promo_large():
    # 1400 x 560
    width, height = 1400, 560
    img = Image.new("RGBA", (width, height))
    draw = ImageDraw.Draw(img)
    
    # 1. Wide Gradient Background
    for y in range(height):
        r = int(26 + (13 - 26) * (y / height))
        g = int(86 + (30 - 86) * (y / height))
        b = int(108 + (45 - 108) * (y / height))
        draw.line([(0, y), (width, y)], fill=(r, g, b, 255))
        
    # Grid pattern
    grid_size = 40
    for x in range(0, width, grid_size):
        draw.line([(x, 0), (x, height)], fill=(255, 255, 255, 8))
    for y in range(0, height, grid_size):
        draw.line([(0, y), (width, y)], fill=(255, 255, 255, 8))
        
    # 2. Load and paste icon
    icon_path = "images/icon.png"
    if os.path.exists(icon_path):
        icon = Image.open(icon_path).convert("RGBA")
        icon = icon.resize((180, 180), Image.Resampling.LANCZOS)
        img.paste(icon, (100, 190), icon)
    else:
        draw.ellipse([100, 190, 280, 370], fill=(59, 130, 246, 255))
        
    # 3. Typography
    font_bold = get_font("Helvetica", 64)
    font_regular = get_font("Helvetica", 24)
    font_badge = get_font("Helvetica", 16)
    
    # Title
    draw.text((320, 180), "Input Translation", fill=(255, 255, 255, 255), font=font_bold)
    
    # Subtitle
    draw.text((320, 275), "Seamless Input Box & Web Page Translation Extension", fill=(200, 230, 245, 255), font=font_regular)
    
    # Showcase badges/features
    badges = [
        ("⌨️ Inline Trigger (/zh)", 320),
        ("🖱️ Highlight & Hover Translate", 600),
        ("🌐 Address Bar Omnibox (tr)", 920)
    ]
    
    for text, bx in badges:
        bw = len(text) * 10 + 40
        draw.rounded_rectangle([bx, 335, bx + bw, 375], radius=6, fill=(59, 130, 246, 50), outline=(59, 130, 246, 150), width=1)
        draw.text((bx + 20, 345), text, fill=(219, 234, 254, 255), font=font_badge)
        
    # Footer info
    draw.text((320, 420), "100% Free & Open-Source • Secure & Zero-Latency Fallback Architecture", fill=(148, 163, 184, 255), font=get_font("Helvetica", 14))
    
    img.save("store_assets/promo_large.png", "PNG")
    print("Generated promo_large.png")

if __name__ == "__main__":
    create_promo_small()
    create_screenshot_1()
    create_screenshot_2()
    create_promo_large()
    print("All assets generated successfully in store_assets/ directory!")
