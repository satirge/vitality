#!/usr/bin/env python3
"""
Render UGC Meta Ads video - Fête des mères
Format: 9:16 (1080x1920), 30fps, 21 seconds
"""

import math
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import imageio

W, H = 1080, 1920
FPS = 30
TOTAL_FRAMES = 630

# Colors
WA_BG = (229, 221, 213)
WA_HEADER = (18, 140, 126)
WA_OUTGOING = (220, 248, 198)
WA_INCOMING = (255, 255, 255)
WA_INPUT_BG = (240, 240, 240)
WA_TEXT = (17, 17, 17)
WA_TIME = (142, 142, 142)
WA_READ = (52, 183, 241)
DARK_GREEN = (26, 58, 42)
BEIGE_BG = (253, 246, 239)

# Message appears at frame
MESSAGES = [
    {"text": "Tu prends quoi pour\nla fête des mères ?", "time": "09:41", "out": False, "read": False, "frame": 20},
    {"text": "Aucune idée 😅",    "time": "09:42", "out": True,  "read": True,  "frame": 90},
    {"text": "Regarde ça 👉",      "time": "09:42", "out": False, "read": False, "frame": 160},
    {"text": "__LINK__",           "time": "09:42", "out": False, "read": False, "frame": 200},
    {"text": "Un abonnement ? 🤔", "time": "09:43", "out": True,  "read": True,  "frame": 300},
    {"text": "Oui, elle reçoit un magazine\ntoute l'année 🙂", "time": "09:43", "out": False, "read": False, "frame": 370},
    {"text": "Ah ok... j'avoue\nc'est pas mal 😏",  "time": "09:44", "out": True,  "read": True,  "frame": 440},
    {"text": "Je prends ça direct 🙌", "time": "09:44", "out": True, "read": True, "frame": 510},
]

CHAT_END = 570
FINAL_START = 555


def spring(frame, stiffness=120, damping=15, mass=0.8):
    """Simplified spring animation, returns 0→1"""
    if frame <= 0:
        return 0.0
    w = math.sqrt(stiffness / mass)
    zeta = damping / (2 * math.sqrt(stiffness * mass))
    if zeta < 1:
        wd = w * math.sqrt(1 - zeta**2)
        val = 1 - math.exp(-zeta * w * frame / FPS) * (
            math.cos(wd * frame / FPS) + (zeta * w / wd) * math.sin(wd * frame / FPS)
        )
    else:
        val = 1 - math.exp(-w * frame / FPS) * (1 + w * frame / FPS)
    return max(0.0, min(1.0, val))


def lerp(a, b, t):
    return a + (b - a) * max(0.0, min(1.0, t))


def clamp(v, lo=0.0, hi=1.0):
    return max(lo, min(hi, v))


def load_font(size, bold=False):
    paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf" if bold else "/usr/share/fonts/truetype/freefont/FreeSans.ttf",
    ]
    for p in paths:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


# Pre-load fonts
F_BODY   = load_font(34)
F_BOLD   = load_font(34, bold=True)
F_SMALL  = load_font(22)
F_TIME   = load_font(20)
F_HEADER = load_font(32, bold=True)
F_SUB    = load_font(26)
F_HUGE   = load_font(130, bold=True)
F_PRICE  = load_font(80, bold=True)
F_CODE   = load_font(72, bold=True)
F_MED    = load_font(48, bold=True)
F_NORMAL = load_font(44)
F_ZNAME  = load_font(52, bold=True)


def draw_rounded_rect(draw, xy, radius, fill, outline=None, outline_width=2):
    x0, y0, x1, y1 = xy
    draw.rounded_rectangle([x0, y0, x1, y1], radius=radius, fill=fill,
                            outline=outline, width=outline_width)


def text_size(draw, text, font):
    bbox = draw.textbbox((0, 0), text, font=font)
    return bbox[2] - bbox[0], bbox[3] - bbox[1]


def draw_bubble(draw, msg, x, y, alpha=1.0, scale=1.0):
    """Draw a single chat bubble, returns bottom y"""
    if msg["text"] == "__LINK__":
        return draw_link_preview(draw, x, y, alpha, scale)

    text = msg["text"]
    is_out = msg["out"]
    time_str = msg["time"]
    is_read = msg["read"]

    padding_x = 24
    padding_y = 16
    max_w = 620

    # Measure lines
    lines = text.split("\n")
    line_h = 40
    text_w = max(text_size(draw, l, F_BODY)[0] for l in lines)
    text_w = min(text_w, max_w - padding_x * 2)
    text_h = len(lines) * line_h

    # Time + ticks width
    time_w = text_size(draw, time_str, F_TIME)[0] + (40 if is_out else 4)
    content_w = max(text_w, time_w) + padding_x * 2
    content_h = text_h + padding_y * 2 + 28  # 28 for time row

    # Scale around anchor
    if is_out:
        bx0 = W - 60 - content_w
        bx1 = W - 60
    else:
        bx0 = 60
        bx1 = 60 + content_w

    # Apply scale
    cx = bx1 if is_out else bx0
    bx0 = cx + (bx0 - cx) * scale
    bx1 = cx + (bx1 - cx) * scale
    by0 = y
    by1 = y + content_h * scale

    color = WA_OUTGOING if is_out else WA_INCOMING

    # Apply alpha by blending with bg
    r = int(radius := 28 * scale)

    # Draw bubble
    draw_rounded_rect(draw,
                      [int(bx0), int(by0), int(bx1), int(by1)],
                      radius=max(4, int(28 * scale)),
                      fill=tuple(int(c + (255 - c) * (1 - alpha)) for c in color))

    # Draw text lines
    ty = by0 + padding_y * scale
    for line in lines:
        tx = bx0 + padding_x * scale
        draw.text((int(tx), int(ty)), line, font=F_BODY,
                  fill=tuple(int(c + (255 - c) * (1 - alpha)) for c in WA_TEXT))
        ty += line_h * scale

    # Draw time
    time_x = bx1 - padding_x * scale - text_size(draw, time_str, F_TIME)[0] - (36 if is_out else 0)
    time_y = by1 - padding_y * scale - 22
    draw.text((int(time_x), int(time_y)), time_str, font=F_TIME,
              fill=tuple(int(c + (255 - c) * (1 - alpha)) for c in WA_TIME))

    if is_out:
        tick_color = WA_READ if is_read else WA_TIME
        tx = time_x + text_size(draw, time_str, F_TIME)[0] + 6
        draw.text((int(tx), int(time_y)), "✓✓", font=F_TIME,
                  fill=tuple(int(c + (255 - c) * (1 - alpha)) for c in tick_color))

    return int(by1)


def draw_link_preview(draw, x, y, alpha=1.0, scale=1.0):
    """Draw the Flow magazine link preview card"""
    card_w = int(560 * scale)
    card_h = int(340 * scale)
    bx0 = 60
    bx1 = bx0 + card_w
    by0 = y
    by1 = y + card_h

    # Card background
    a_fill = lambda c: tuple(int(c_i + (255 - c_i) * (1 - alpha)) for c_i in c)

    draw_rounded_rect(draw, [bx0, by0, bx1, by1], radius=16, fill=a_fill((255, 255, 255)),
                      outline=a_fill((220, 220, 220)), outline_width=2)

    # Image section (gradient simulation)
    img_h = int(160 * scale)
    img_rect = [bx0, by0, bx1, by0 + img_h]

    # Gradient via horizontal strips
    for i in range(img_h):
        t = i / img_h
        r_c = int(lerp(244, 232, t))
        g_c = int(lerp(132, 67, t))
        b_c = int(lerp(95, 147, t))
        strip_color = a_fill((r_c, g_c, b_c))
        draw.line([(bx0, by0 + i), (bx1, by0 + i)], fill=strip_color)

    # "flow" text on image
    draw.text((bx0 + int(30 * scale), by0 + int(img_h - 50 * scale)),
              "flow", font=F_BOLD, fill=a_fill((44, 85, 48)))

    # Magazine cover rectangle
    mx = bx1 - int(110 * scale)
    my = by0 + int(20 * scale)
    mw, mh = int(80 * scale), int(110 * scale)
    draw_rounded_rect(draw, [mx, my, mx + mw, my + mh], radius=6,
                      fill=a_fill((255, 245, 230)))

    # Text content area
    ty = by0 + img_h + int(12 * scale)
    tx = bx0 + int(14 * scale)
    draw.text((tx, ty), "Un abonnement magazine qui dure toute l'année",
              font=load_font(int(26 * scale), bold=True), fill=a_fill((17, 17, 17)))
    ty += int(40 * scale)

    for item in ["✓ 12 numéros", "✓ Reçu à la maison", "✓ Bon cadeau à imprimer"]:
        draw.text((tx, ty), item, font=load_font(int(22 * scale)),
                  fill=a_fill((68, 68, 68)))
        ty += int(28 * scale)

    # Footer
    fy = by1 - int(36 * scale)
    draw.line([(bx0 + 10, fy), (bx1 - 10, fy)], fill=a_fill((220, 220, 220)), width=1)
    draw.text((bx0 + int(14 * scale), fy + int(8 * scale)), "edigroup.ch",
              font=F_TIME, fill=a_fill((136, 136, 136)))
    tw = text_size(draw, "Abonnement magazine", F_TIME)[0]
    draw.text((bx1 - int(14 * scale) - tw, fy + int(8 * scale)), "Abonnement magazine",
              font=F_TIME, fill=a_fill((136, 136, 136)))

    return int(by1)


def render_chat(frame):
    img = Image.new("RGB", (W, H), WA_BG)
    draw = ImageDraw.Draw(img)

    # Background pattern (subtle dots)
    for row in range(0, H, 60):
        for col in range(0, W, 60):
            draw.ellipse([col - 1, row - 1, col + 1, row + 1],
                         fill=(200, 192, 178))

    # Header
    draw.rectangle([0, 0, W, 170], fill=WA_HEADER)

    # Status bar area
    draw.rectangle([0, 0, W, 50], fill=(10, 100, 90))
    draw.text((40, 14), "10:27", font=F_SMALL, fill=(255, 255, 255))

    # Back arrow
    draw.text((30, 70), "‹", font=load_font(60), fill=(255, 255, 255))

    # Avatar circle
    draw.ellipse([90, 75, 160, 145], fill=(240, 147, 251))
    draw.text((108, 90), "👩", font=load_font(40))

    # Name + status
    draw.text((175, 80), "Ma soeur ❤️", font=F_HEADER, fill=(255, 255, 255))
    draw.text((175, 122), "en ligne", font=F_SUB, fill=(210, 240, 210))

    # Video/phone icons
    draw.text((870, 85), "🎥", font=load_font(40))
    draw.text((960, 85), "📞", font=load_font(40))

    # Date label
    date_w, date_h = text_size(draw, "Aujourd'hui", F_SMALL)
    dw = date_w + 40
    dx = (W - dw) // 2
    dy = 190
    draw_rounded_rect(draw, [dx, dy, dx + dw, dy + date_h + 16], radius=8,
                      fill=(225, 219, 208))
    draw.text((dx + 20, dy + 8), "Aujourd'hui", font=F_SMALL, fill=(85, 85, 85))

    # Messages
    y = 245
    for msg in MESSAGES:
        if frame < msg["frame"]:
            break
        elapsed = frame - msg["frame"]
        sp = spring(elapsed, stiffness=120, damping=15, mass=0.8)
        alpha = clamp(elapsed / 8.0)
        scale = lerp(0.88, 1.0, sp)
        ty_offset = lerp(20, 0, sp)
        bottom = draw_bubble(draw, msg, 0, int(y + ty_offset), alpha, scale)
        y = bottom + 8

    # Input bar
    draw.rectangle([0, H - 110, W, H], fill=WA_INPUT_BG)
    draw.rectangle([0, H - 110, W, H - 109], fill=(200, 200, 200))
    draw_rounded_rect(draw, [70, H - 90, W - 80, H - 20], radius=28,
                      fill=(255, 255, 255))
    draw.text((100, H - 74), "Message", font=F_BODY, fill=(170, 170, 170))
    draw.text((W - 65, H - 85), "🎤", font=load_font(44))

    return img


def render_final(frame):
    img = Image.new("RGB", (W, H), BEIGE_BG)
    draw = ImageDraw.Draw(img)

    cx = W // 2

    # Spring animations (frame 0 = start of final sequence)
    sp_gift  = spring(frame,      stiffness=100, damping=12, mass=1.0)
    sp_price = spring(max(0, frame - 15), stiffness=90, damping=14)
    sp_code  = spring(max(0, frame - 25), stiffness=90, damping=14)
    sp_cta   = spring(max(0, frame - 35), stiffness=90, damping=14)
    sp_zal   = spring(max(0, frame - 50), stiffness=90, damping=14)

    fade = clamp(frame / 20.0)

    # Gift icon
    gift_scale = lerp(0.5, 1.0, sp_gift)
    gift_size = int(110 * gift_scale)
    draw.text((cx - gift_size // 2, 180), "🎁",
              font=load_font(int(110 * gift_scale)))

    # -10 CHF
    price_y_offset = lerp(40, 0, sp_price)
    price_txt = "-10 CHF"
    pw, ph = text_size(draw, price_txt, F_HUGE)
    draw.text((cx - pw // 2, int(340 + price_y_offset)),
              price_txt, font=F_HUGE,
              fill=tuple(int(c + (255 - c) * (1 - sp_price)) for c in DARK_GREEN))

    # "avec le code"
    avec_txt = "avec le code"
    aw, ah = text_size(draw, avec_txt, F_NORMAL)
    avec_y = int(490 + lerp(30, 0, sp_price))
    draw.text((cx - aw // 2, avec_y), avec_txt, font=F_NORMAL,
              fill=tuple(int(c + (255 - c) * (1 - sp_price)) for c in (85, 85, 85)))

    # MAMAN26 box
    code_txt = "MAMAN26"
    cw, ch = text_size(draw, code_txt, F_CODE)
    pulse = math.sin(frame * 0.08) * 0.015 + 1.0
    box_pad_x = int(60 * sp_code * pulse)
    box_pad_y = int(24 * sp_code * pulse)
    bx = cx - (cw + box_pad_x * 2) // 2
    by = 580
    bx2 = bx + cw + box_pad_x * 2
    by2 = by + ch + box_pad_y * 2
    draw_rounded_rect(draw, [bx, by, bx2, by2], radius=18,
                      fill=tuple(int(c + (0 - c) * (1 - sp_code)) for c in DARK_GREEN))
    draw.text((bx + box_pad_x, by + box_pad_y), code_txt, font=F_CODE,
              fill=tuple(int(0 + (255 - 0) * sp_code) for _ in range(3)))

    # "Cadeau prêt en 2 min ⚡"
    cta_txt = "Cadeau prêt en 2 min ⚡"
    ctw, cth = text_size(draw, cta_txt, F_MED)
    cta_y = int(760 + lerp(30, 0, sp_cta))
    draw.text((cx - ctw // 2, cta_y), cta_txt, font=F_MED,
              fill=tuple(int(c + (255 - c) * (1 - sp_cta)) for c in DARK_GREEN))

    # Divider
    div_y = 860
    div_alpha = sp_zal
    div_color = tuple(int(190 + (255 - 190) * (1 - div_alpha)) for _ in range(3))
    draw.line([(cx - 200, div_y), (cx + 200, div_y)], fill=div_color, width=2)

    # "+ 30 CHF Zalando"
    zal_y = int(890 + lerp(30, 0, sp_zal))
    z1_txt = "+ 30 CHF Zalando"
    z1w, _ = text_size(draw, z1_txt, F_MED)
    draw.text((cx - z1w // 2, zal_y), z1_txt, font=F_MED,
              fill=tuple(int(c + (255 - c) * (1 - sp_zal)) for c in (68, 68, 68)))

    z2_txt = "pour les 20 premières commandes"
    z2w, _ = text_size(draw, z2_txt, F_NORMAL)
    draw.text((cx - z2w // 2, zal_y + 62), z2_txt, font=F_NORMAL,
              fill=tuple(int(c + (255 - c) * (1 - sp_zal)) for c in (100, 100, 100)))

    # Zalando logo card
    logo_y = int(1040 + lerp(30, 0, sp_zal))
    logo_w, logo_h = 380, 100
    lx = cx - logo_w // 2
    logo_alpha = sp_zal
    draw_rounded_rect(draw, [lx, logo_y, lx + logo_w, logo_y + logo_h],
                      radius=16, fill=(255, 255, 255),
                      outline=(220, 220, 220))

    # Triangle (Zalando logo)
    tri_x, tri_y = lx + 30, logo_y + 18
    tri_size = 64
    tri_points = [
        (tri_x + tri_size // 2, tri_y),
        (tri_x, tri_y + tri_size),
        (tri_x + tri_size, tri_y + tri_size),
    ]
    orange = tuple(int(255 * logo_alpha) if i == 0 else int(105 * logo_alpha) if i == 1 else 0 for i in range(3))
    draw.polygon(tri_points, fill=(255, 105, 0))

    # "zalando" text
    zname_w, _ = text_size(draw, "zalando", F_ZNAME)
    draw.text((lx + 110, logo_y + 22), "zalando", font=F_ZNAME,
              fill=tuple(int(c + (255 - c) * (1 - logo_alpha)) for c in (26, 26, 26)))

    # Fade in overlay
    if fade < 1.0:
        overlay = Image.new("RGB", (W, H), BEIGE_BG)
        img = Image.blend(overlay, img, fade)

    return img


def render_frame(frame):
    if frame >= FINAL_START:
        chat_alpha = clamp(1.0 - (frame - FINAL_START) / (CHAT_END - FINAL_START))
        final_alpha = clamp((frame - FINAL_START) / (CHAT_END - FINAL_START))
        final_frame = frame - FINAL_START

        chat_img = render_chat(frame)
        final_img = render_final(final_frame)

        if final_alpha <= 0:
            return chat_img
        if chat_alpha <= 0:
            return final_img

        return Image.blend(chat_img, final_img, final_alpha)
    else:
        return render_chat(frame)


def main():
    os.makedirs("out", exist_ok=True)
    output_path = "out/ugc-fete-des-meres.mp4"

    print(f"Rendering {TOTAL_FRAMES} frames at {FPS}fps ({TOTAL_FRAMES / FPS:.1f}s)...")
    print(f"Output: {output_path}")

    writer = imageio.get_writer(
        output_path,
        fps=FPS,
        codec="libx264",
        quality=9,
        pixelformat="yuv420p",
        macro_block_size=1,
        output_params=["-crf", "16", "-preset", "fast"],
    )

    for f in range(TOTAL_FRAMES):
        if f % 30 == 0:
            print(f"  Frame {f}/{TOTAL_FRAMES} ({f * 100 // TOTAL_FRAMES}%)")
        img = render_frame(f)
        writer.append_data(np.array(img))

    writer.close()
    size_mb = os.path.getsize(output_path) / 1024 / 1024
    print(f"\nDone! {output_path} ({size_mb:.1f} MB)")


if __name__ == "__main__":
    main()
