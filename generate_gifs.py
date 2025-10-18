#!/usr/bin/env python3
import os
from PIL import Image, ImageDraw, ImageFont
import numpy as np
import re

# Color palettes with character sets
palettes = {
    'sunset': {
        'bg': 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 50%, #ff6b9d 100%)',
        'color': '#fff8f0',
        'shadow': '0 0 20px rgba(255, 248, 240, 0.6), 0 0 40px rgba(255, 215, 0, 0.3)',
        'chars': '☀☁☂☃☄★☆☎☏☐☑☒☓☔☕☖☗☘☙☚☛'
    },
    'lavender': {
        'bg': 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #ec4899 100%)',
        'color': '#f3e8ff',
        'shadow': '0 0 20px rgba(243, 232, 255, 0.6), 0 0 40px rgba(196, 181, 253, 0.3)',
        'chars': '♠♣♥♦♤♧♡♢♩♪♫♬♭♮♯♰♱♲♳♴♵'
    },
    'forest': {
        'bg': 'linear-gradient(135deg, #059669 0%, #10b981 50%, #84cc16 100%)',
        'color': '#f0fdf4',
        'shadow': '0 0 20px rgba(240, 253, 244, 0.6), 0 0 40px rgba(134, 204, 22, 0.3)',
        'chars': 'αβγδεζηθικλμνξοπρστυφχψωΑΒΓΔΕΖ'
    },
    'ocean': {
        'bg': 'linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #06b6d4 100%)',
        'color': '#f0fdfa',
        'shadow': '0 0 20px rgba(240, 253, 250, 0.6), 0 0 40px rgba(6, 182, 212, 0.3)',
        'chars': '∀∁∂∃∄∅∆∇∈∉∊∋∌∍∎∏∐∑−∓∔∕∖∗∘'
    },
    'cosmic': {
        'bg': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
        'color': '#f8fafc',
        'shadow': '0 0 20px rgba(248, 250, 252, 0.6), 0 0 40px rgba(99, 102, 241, 0.3)',
        'chars': '✦✧✩✪✫✬✭✮✯✰✱✲✳✴✵✶✷✸✹✺'
    },
    'cyberpunk': {
        'bg': 'linear-gradient(135deg, #000000 0%, #1a1a2e 30%, #16213e 60%, #0f3460 100%)',
        'color': '#00ff41',
        'shadow': '0 0 20px rgba(0, 255, 65, 0.8), 0 0 40px rgba(0, 255, 65, 0.4), 0 0 60px rgba(0, 255, 65, 0.2)',
        'chars': '¥€£$₿₽₹₩αβγδεζηθικλμνξοπρστ'
    },
    'neon': {
        'bg': 'linear-gradient(135deg, #ff0080 0%, #ff4081 25%, #e91e63 50%, #c2185b 75%, #ad1457 100%)',
        'color': '#ffffff',
        'shadow': '0 0 20px rgba(255, 255, 255, 0.9), 0 0 40px rgba(255, 0, 128, 0.6), 0 0 60px rgba(255, 0, 128, 0.4)',
        'chars': '◉◊○◌◍◎●◐◑◒◓◔◕◖◗◘◙◚◛◜◝'
    },
    'gothic': {
        'bg': 'linear-gradient(135deg, #2c1810 0%, #3d2817 25%, #4a2c2a 50%, #5d4037 75%, #6d4c41 100%)',
        'color': '#d4af37',
        'shadow': '0 0 20px rgba(212, 175, 55, 0.7), 0 0 40px rgba(212, 175, 55, 0.4), 0 0 60px rgba(139, 69, 19, 0.3)',
        'chars': '⚔⚕⚖⚗⚘⚙⚚⚛⚜⚝⚞⚟⚠⚡⚢⚣⚤⚥⚦⚧'
    },
    'matrix': {
        'bg': 'linear-gradient(135deg, #000000 0%, #001100 25%, #003300 50%, #004400 75%, #005500 100%)',
        'color': '#00ff00',
        'shadow': '0 0 20px rgba(0, 255, 0, 0.8), 0 0 40px rgba(0, 255, 0, 0.5), 0 0 60px rgba(0, 255, 0, 0.3)',
        'chars': '∀∁∂∃∄∅∆∇∈∉∊∋∌∍∎∏∐∑−∓∔∕∖∗∘∙√∛∜∝∞∟'
    }
}

def hex_to_rgb(hex_color):
    """Convert hex color to RGB tuple"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def parse_gradient(gradient_str):
    """Parse CSS gradient and return dominant color"""
    colors = re.findall(r'#([0-9a-fA-F]{6})', gradient_str)
    if colors:
        mid_idx = len(colors) // 2
        return hex_to_rgb(f'#{colors[mid_idx]}')
    return (45, 45, 55)

def parse_text_color(color_str):
    """Parse text color from hex or rgba"""
    if color_str.startswith('#'):
        return hex_to_rgb(color_str)
    return (255, 255, 255)

# Load the image
img_path = 'Stylized Azalea Logo Design.png'
img = Image.open(img_path).convert('L')
width, height = img.size

# Resize to ASCII resolution - 16:9 aspect ratio
ascii_width = 80
ascii_height = int(ascii_width * 9 / 16)  # 16:9 aspect ratio
img = img.resize((ascii_width, ascii_height))

# Get pixel data
pixels = np.array(img)

# Font settings - larger font for better resolution
font_size = 18
try:
    font = ImageFont.truetype("/System/Library/Fonts/Menlo.ttc", font_size)
except:
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Consolas.ttf", font_size)
    except:
        font = ImageFont.load_default()

# Calculate actual character dimensions
test_img = Image.new('RGB', (100, 100), (0, 0, 0))
test_draw = ImageDraw.Draw(test_img)
bbox = test_draw.textbbox((0, 0), 'M', font=font)
char_width = bbox[2] - bbox[0]
char_height = bbox[3] - bbox[1]

# Calculate image dimensions - using exact character width to avoid padding
img_width = ascii_width * char_width
img_height = ascii_height * char_height

print(f"Character dimensions: {char_width}x{char_height}px")
print(f"Image dimensions: {img_width}x{img_height}px")

# Generate GIF for each palette
for palette_name, palette in palettes.items():
    print(f"\n🎨 Generating {palette_name} GIF...")
    print(f"   Characters: {palette['chars']}")
    
    # Parse colors
    bg_color = parse_gradient(palette['bg'])
    text_color = parse_text_color(palette['color'])
    cycling_chars = palette['chars']
    
    num_frames = len(cycling_chars)
    frames = []
    
    for frame in range(num_frames):
        # Create image with background
        img_frame = Image.new('RGB', (img_width, img_height), bg_color)
        draw = ImageDraw.Draw(img_frame)
        
        # Generate ASCII art
        ascii_art = []
        for y in range(ascii_height):
            row = ''
            for x in range(ascii_width):
                pixel = pixels[y][x]
                char_idx = int((pixel / 255) * (len(cycling_chars) - 1))
                char_idx = (char_idx + frame) % len(cycling_chars)
                row += cycling_chars[char_idx]
            ascii_art.append(row)
        
        # Draw ASCII text
        y_offset = 0
        for line in ascii_art:
            draw.text((0, y_offset), line, fill=text_color, font=font)
            y_offset += char_height
        
        frames.append(img_frame)
    
    # Save as GIF
    output_path = f'azalea_ascii_{palette_name}.gif'
    frames[0].save(
        output_path,
        save_all=True,
        append_images=frames[1:],
        duration=100,
        loop=0
    )
    
    print(f"✅ Created: {output_path}")

print(f"\n🎉 All {len(palettes)} GIFs generated successfully!")
print(f"📊 Each: 20 frames, {img_width}x{img_height}px, seamless loop")

