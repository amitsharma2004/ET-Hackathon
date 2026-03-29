"""
RevenueGuard AI - Satellite Image Simulator
Generates fake before/after satellite imagery (512x512 px) for demo purposes.
Fraud properties show 30-40% building footprint expansion between 2020 → 2024.
"""
import os
import random
import json
import math

try:
    from PIL import Image, ImageDraw, ImageFilter
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False

try:
    import numpy as np
    NUMPY_AVAILABLE = True
except ImportError:
    NUMPY_AVAILABLE = False

BASE_DIR    = os.path.dirname(os.path.abspath(__file__))
SAT_DIR     = os.path.join(BASE_DIR, "..", "data", "satellite")
DATA_DIR    = os.path.join(BASE_DIR, "..", "data")
IMG_SIZE    = 512
SEED        = 42


# ── Colour palette ────────────────────────────────────────────────────────
GRASS_COLOR   = (107, 142,  35)   # olive green ground
ROAD_COLOR    = (169, 169, 169)   # light grey roads
BLDG_COLORS   = [
    (210, 180, 140),  # tan / beige
    (188, 143, 143),  # rosy brown
    (205, 133,  63),  # peru
    (160, 120,  80),  # brown
    (220, 200, 160),  # wheat
]
ROOF_SHADOW   = (100,  80,  60)   # darker edge
TREE_COLOR    = ( 34, 139,  34)   # forest green
WATER_COLOR   = ( 70, 130, 180)   # steel blue


def _noise_layer(size, intensity=15):
    """Return an RGBA noise image to overlay for realism."""
    if not NUMPY_AVAILABLE:
        return None
    noise = np.random.randint(0, intensity, (size, size, 3), dtype=np.uint8)
    return Image.fromarray(noise.astype(np.uint8), "RGB")


def _draw_building(draw, x, y, w, h, color):
    """Draw a single building footprint with a shadow offset."""
    # Shadow
    draw.rectangle([x+4, y+4, x+w+4, y+h+4], fill=ROOF_SHADOW)
    # Main body
    draw.rectangle([x, y, x+w, y+h], fill=color)
    # Roof ridge line
    cx = x + w // 2
    draw.line([(cx, y), (cx, y+h)], fill=(255, 255, 255, 80), width=1)


def _draw_tree(draw, x, y, r=8):
    draw.ellipse([x-r, y-r, x+r, y+r], fill=TREE_COLOR)


def _draw_roads(draw, size):
    """Draw two perpendicular roads."""
    draw.rectangle([0, size//2-6, size, size//2+6], fill=ROAD_COLOR)
    draw.rectangle([size//2-6, 0, size//2+6, size], fill=ROAD_COLOR)


def _generate_image(buildings, size=IMG_SIZE, year_label="2020", is_fraud=False):
    """Render one satellite image given a list of building dicts."""
    rng = random.Random(SEED + hash(year_label))

    img  = Image.new("RGB", (size, size), GRASS_COLOR)
    draw = ImageDraw.Draw(img)

    # Roads
    _draw_roads(draw, size)

    # Trees (static)
    for _ in range(20):
        tx = rng.randint(20, size-20)
        ty = rng.randint(20, size-20)
        _draw_tree(draw, tx, ty)

    # Buildings
    for b in buildings:
        _draw_building(draw, b["x"], b["y"], b["w"], b["h"], b["color"])

    # Noise overlay for realism
    if NUMPY_AVAILABLE:
        noise = _noise_layer(size, intensity=20)
        if noise:
            img = Image.blend(img, noise, alpha=0.08)

    # Slight blur to mimic satellite sensor
    img = img.filter(ImageFilter.GaussianBlur(radius=0.6))

    return img


def generate_satellite_pair(property_id: str, is_fraud: bool = False):
    """
    Generate 2020 and 2024 satellite image pair for a given property.
    Fraud properties show building expansion in 2024.

    Returns: (path_2020, path_2024)
    """
    os.makedirs(SAT_DIR, exist_ok=True)

    rng = random.Random(hash(property_id))

    # Generate 5-10 initial building placements
    n_buildings = rng.randint(5, 10)
    buildings_2020 = []
    for _ in range(n_buildings):
        w = rng.randint(40, 100)
        h = rng.randint(30, 80)
        x = rng.randint(20, IMG_SIZE - w - 20)
        y = rng.randint(20, IMG_SIZE - h - 20)
        color = rng.choice(BLDG_COLORS)
        buildings_2020.append({"x": x, "y": y, "w": w, "h": h, "color": color})

    # 2024: expand buildings for fraud properties
    if is_fraud:
        expansion = rng.uniform(0.30, 0.45)
        buildings_2024 = []
        for b in buildings_2020:
            new_w = int(b["w"] * (1 + expansion))
            new_h = int(b["h"] * (1 + expansion))
            # Keep within bounds
            new_w = min(new_w, IMG_SIZE - b["x"] - 5)
            new_h = min(new_h, IMG_SIZE - b["y"] - 5)
            buildings_2024.append({**b, "w": new_w, "h": new_h})
    else:
        # Minor natural variation only
        buildings_2024 = [{**b, "w": b["w"] + rng.randint(-3, 3),
                           "h": b["h"] + rng.randint(-3, 3)} for b in buildings_2020]

    img_2020 = _generate_image(buildings_2020, year_label=f"{property_id}_2020")
    img_2024 = _generate_image(buildings_2024, year_label=f"{property_id}_2024", is_fraud=is_fraud)

    path_2020 = os.path.join(SAT_DIR, f"{property_id}_2020.jpg")
    path_2024 = os.path.join(SAT_DIR, f"{property_id}_2024.jpg")

    img_2020.save(path_2020, "JPEG", quality=85)
    img_2024.save(path_2024, "JPEG", quality=85)

    # Compute approximate area change for metadata
    total_area_2020 = sum(b["w"] * b["h"] for b in buildings_2020)
    total_area_2024 = sum(b["w"] * b["h"] for b in buildings_2024)
    pct_change = ((total_area_2024 - total_area_2020) / total_area_2020) * 100

    metadata = {
        "property_id": property_id,
        "is_fraud":    is_fraud,
        "area_2020_px": total_area_2020,
        "area_2024_px": total_area_2024,
        "pct_change":   round(pct_change, 1),
        "n_buildings":  n_buildings,
        "path_2020":    path_2020,
        "path_2024":    path_2024,
    }

    return path_2020, path_2024, metadata


# ══════════════════════════════════════════════════════════════════════════════
# BATCH GENERATION  — run this script directly to pre-generate all images
# ══════════════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    if not PIL_AVAILABLE:
        print("❌  Pillow not installed. Run: pip install Pillow")
        raise SystemExit(1)

    props_path = os.path.join(DATA_DIR, "properties.json")
    if not os.path.exists(props_path):
        print("❌  Run data/generate_data.py first to create properties.json")
        raise SystemExit(1)

    with open(props_path, encoding="utf-8") as f:
        properties = json.load(f)

    print(f"\n🛰️  Generating satellite images for {len(properties)} properties …")
    all_meta = []
    for i, p in enumerate(properties, 1):
        pid      = p["property_id"]
        is_fraud = p["is_fraud"]
        _, _, meta = generate_satellite_pair(pid, is_fraud)
        all_meta.append(meta)
        if i % 20 == 0:
            print(f"   {i}/{len(properties)} done …")

    # Save metadata index
    meta_path = os.path.join(DATA_DIR, "satellite_metadata.json")
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(all_meta, f, ensure_ascii=False, indent=2)

    fraud_expanded = sum(1 for m in all_meta if m["is_fraud"])
    print(f"\n✅  Done! {len(all_meta)} pairs saved to {SAT_DIR}")
    print(f"   Fraud properties with expansion: {fraud_expanded}")
    print(f"   Metadata index: {meta_path}\n")
