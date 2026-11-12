import json
import os
import math
from PIL import Image, ImageDraw, ImageFilter

BASE_DIR = r"C:\Users\Parth\.gemini\antigravity\scratch\cyberpro"
DATA_DIR = os.path.join(BASE_DIR, "data")
PUBLIC_ASSETS = os.path.join(BASE_DIR, "public", "assets")
os.makedirs(PUBLIC_ASSETS, exist_ok=True)

geojson_path = os.path.join(DATA_DIR, "countries.geo.json")
with open(geojson_path, "r", encoding="utf-8") as f:
    world_data = json.load(f)

WIDTH = 2048
HEIGHT = 1024

def lonlat_to_xy(lon, lat):
    x = (lon + 180.0) / 360.0 * WIDTH
    y = (90.0 - lat) / 180.0 * HEIGHT
    return (x, y)

print(f"Creating ultra-vibrant cyber world map texture {WIDTH}x{HEIGHT}...")
# Base ocean: Deep cyberpunk void
img = Image.new("RGBA", (WIDTH, HEIGHT), (3, 9, 22, 255))

# 1. Subtle Lat/Lon Cyber Grid
grid_img = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
grid_draw = ImageDraw.Draw(grid_img)

for lat in range(-80, 85, 20):
    _, y = lonlat_to_xy(0, lat)
    color = (0, 217, 245, 60) if lat == 0 else (0, 180, 240, 25)
    grid_draw.line([(0, y), (WIDTH, y)], fill=color, width=1)

for lon in range(-180, 181, 20):
    x, _ = lonlat_to_xy(lon, 0)
    color = (0, 217, 245, 60) if lon == 0 else (0, 180, 240, 25)
    grid_draw.line([(x, 0), (x, HEIGHT)], fill=color, width=1)

# Tropic lines (Cancer & Capricorn)
for t_lat in [23.436, -23.436]:
    _, ty = lonlat_to_xy(0, t_lat)
    for seg_x in range(0, WIDTH, 16):
        grid_draw.line([(seg_x, ty), (seg_x + 8, ty)], fill=(0, 245, 160, 45), width=1)

img = Image.alpha_composite(img, grid_img)

# 2. Landmass Masks
land_mask = Image.new("L", (WIDTH, HEIGHT), 0)
mask_draw = ImageDraw.Draw(land_mask)

india_mask = Image.new("L", (WIDTH, HEIGHT), 0)
india_mask_draw = ImageDraw.Draw(india_mask)

india_feature = None
all_polys = []

for f in world_data["features"]:
    name = f["properties"].get("name", "")
    geom = f["geometry"]
    gtype = geom["type"]
    coords = geom["coordinates"]
    
    is_india = (name == "India")
    if is_india:
        india_feature = f

    polys_to_draw = []
    if gtype == "Polygon":
        polys_to_draw.append(coords)
    elif gtype == "MultiPolygon":
        polys_to_draw.extend(coords)

    for poly in polys_to_draw:
        for ring_idx, ring in enumerate(poly):
            pts = [lonlat_to_xy(pt[0], pt[1]) for pt in ring]
            if len(pts) > 2:
                val = 255 if ring_idx == 0 else 0
                mask_draw.polygon(pts, fill=val)
                if is_india:
                    india_mask_draw.polygon(pts, fill=val)
                all_polys.append((pts, is_india, ring_idx == 0))

# 3. Fill Landmasses
# General continents: High-tech deep cyber navy
land_fill_img = Image.new("RGBA", (WIDTH, HEIGHT), (8, 28, 48, 240))
img.paste(land_fill_img, (0, 0), land_mask)

# India: Distinct deep emerald cyber green
india_fill_img = Image.new("RGBA", (WIDTH, HEIGHT), (12, 54, 32, 250))
img.paste(india_fill_img, (0, 0), india_mask)

# 4. Dense Holographic Matrix Dots on Continents
print("Generating dense holographic matrix dots...")
dot_img = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
dot_draw = ImageDraw.Draw(dot_img)

step = 5  # 5-pixel grid for sharper high-density holographic dots
land_pixels = land_mask.load()
india_pixels = india_mask.load()

for y in range(0, HEIGHT, step):
    for x in range(0, WIDTH, step):
        if india_pixels[x, y] > 128:
            # India dot: Brilliant electric laser green
            dot_draw.ellipse([x - 1, y - 1, x + 1, y + 1], fill=(57, 255, 20, 255))
        elif land_pixels[x, y] > 128:
            # Continental dots: Crisp glowing cyan & emerald
            is_emerald = ((x + y) % (step * 3) == 0)
            col = (0, 245, 160, 220) if is_emerald else (0, 217, 245, 200)
            dot_draw.ellipse([x - 1, y - 1, x + 1, y + 1], fill=col)

img = Image.alpha_composite(img, dot_img)

# 5. Glowing Outlines & Borders
print("Drawing high-contrast glowing country borders...")
border_glow = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
glow_draw = ImageDraw.Draw(border_glow)

border_crisp = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
crisp_draw = ImageDraw.Draw(border_crisp)

india_border_glow = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
india_glow_draw = ImageDraw.Draw(india_border_glow)

for pts, is_india, is_exterior in all_polys:
    if not is_exterior or len(pts) < 2:
        continue
    if is_india:
        # India multi-layer laser glow
        india_glow_draw.line(pts, fill=(57, 255, 20, 240), width=6)
        crisp_draw.line(pts, fill=(230, 255, 210, 255), width=2)
    else:
        # Global borders
        glow_draw.line(pts, fill=(0, 217, 245, 140), width=3)
        crisp_draw.line(pts, fill=(0, 245, 160, 220), width=1)

border_glow = border_glow.filter(ImageFilter.GaussianBlur(radius=2))
india_border_glow = india_border_glow.filter(ImageFilter.GaussianBlur(radius=3))

img = Image.alpha_composite(img, border_glow)
img = Image.alpha_composite(img, india_border_glow)
img = Image.alpha_composite(img, border_crisp)

# 6. Strategic India Defense Hubs
print("Rendering India defense telemetry hubs...")
telemetry_img = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
t_draw = ImageDraw.Draw(telemetry_img)

india_nodes = [
    ("NEW DELHI [CYBERPRO HQ]", 77.2090, 28.6139, True),
    ("MUMBAI [GATEWAY-01]", 72.8777, 19.0760, False),
    ("BENGALURU [QUANTUM LAB]", 77.5946, 12.9716, False),
    ("HYDERABAD [DEFENSE MESH]", 78.4867, 17.3850, False),
    ("CHENNAI [COASTAL NODE]", 80.2707, 13.0827, False),
    ("KOLKATA [EAST SENTINEL]", 88.3639, 22.5726, False),
    ("AHMEDABAD [SECURITY OPS]", 72.5714, 23.0225, False),
]

hq_pt = None
node_pts = []

for name, lon, lat, is_hq in india_nodes:
    nx, ny = lonlat_to_xy(lon, lat)
    node_pts.append((nx, ny))
    if is_hq:
        hq_pt = (nx, ny)

# Defense laser web across India
for nx, ny in node_pts:
    if (nx, ny) != hq_pt:
        t_draw.line([hq_pt, (nx, ny)], fill=(57, 255, 20, 200), width=1)

# Node symbols
for name, lon, lat, is_hq in india_nodes:
    nx, ny = lonlat_to_xy(lon, lat)
    r = 8 if is_hq else 4
    # Concentric outer ring
    t_draw.ellipse([nx - r*2, ny - r*2, nx + r*2, ny + r*2], outline=(57, 255, 20, 180), width=1)
    if is_hq:
        # Diamond HQ
        t_draw.polygon([(nx, ny - r), (nx + r, ny), (nx, ny + r), (nx - r, ny)], fill=(240, 255, 220, 255), outline=(57, 255, 20, 255))
    else:
        t_draw.ellipse([nx - r, ny - r, nx + r, ny + r], fill=(0, 255, 160, 240))

# HUD badge above India
ix_center, iy_center = lonlat_to_xy(80.0, 22.0)
t_draw.rectangle([ix_center - 115, iy_center - 90, ix_center + 115, iy_center - 68], fill=(2, 14, 10, 225), outline=(57, 255, 20, 220), width=1)
t_draw.text((ix_center - 100, iy_center - 86), "INDIA DEFENSE SECTOR // SECURED", fill=(57, 255, 20, 255))

img = Image.alpha_composite(img, telemetry_img)

# Save
world_map_path = os.path.join(PUBLIC_ASSETS, "cyber-world-map.png")
img.save(world_map_path, "PNG", optimize=True)
print(f"Saved optimized world map to {world_map_path} ({os.path.getsize(world_map_path):,} bytes)")
