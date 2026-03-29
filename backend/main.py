"""
RevenueGuard AI — FastAPI Backend
Endpoints for property data, AI analysis, KPI stats and satellite images.
"""
import os
import sys
import json
import logging
from pathlib import Path
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

# ── Path setup ─────────────────────────────────────────────────────────────
ROOT_DIR = Path(__file__).parent.parent
DATA_DIR = ROOT_DIR / "data"
SAT_DIR  = ROOT_DIR / "data" / "satellite"
sys.path.insert(0, str(ROOT_DIR))

from backend.agents import CrewManager, PropertyAgent, WaterAgent, TradeAgent

# ── Logging ────────────────────────────────────────────────────────────────
LOG_DIR = ROOT_DIR / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)s  %(message)s",
    handlers=[
        logging.FileHandler(LOG_DIR / "backend.log"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger("revenueguard")

# ── Load synthetic data ────────────────────────────────────────────────────
def _load_json(filename: str) -> List[Dict]:
    path = DATA_DIR / filename
    if not path.exists():
        logger.warning(f"Data file not found: {path}")
        return []
    with open(path, encoding="utf-8") as f:
        return json.load(f)


properties   = _load_json("properties.json")
consumption  = _load_json("consumption.json")
gst_records  = _load_json("gst_registrations.json")

# ── Crew Manager singleton ─────────────────────────────────────────────────
crew = CrewManager(properties, consumption, gst_records)
props_idx: Dict[str, Dict] = {p["property_id"]: p for p in properties}

# ── FastAPI app ────────────────────────────────────────────────────────────
app = FastAPI(
    title="RevenueGuard AI",
    description="Municipal Property Tax Fraud Detection System",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve satellite images as static files
if SAT_DIR.exists():
    app.mount("/satellite-images", StaticFiles(directory=str(SAT_DIR)), name="satellite")


# ══════════════════════════════════════════════════════════════════════════════
# ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════

@app.get("/", tags=["Health"])
def root():
    return {
        "service":  "RevenueGuard AI",
        "status":   "running",
        "version":  "1.0.0",
        "properties_loaded": len(properties),
    }


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}


# ── GET /properties ────────────────────────────────────────────────────────
@app.get("/properties", tags=["Properties"])
def get_properties(
    zone: Optional[str] = Query(None, description="Filter by zone: Zone-A, Zone-B, Zone-C"),
    limit: int = Query(200, ge=1, le=500),
    offset: int = Query(0, ge=0),
) -> Dict[str, Any]:
    """
    Return property list with optional zone filter.
    """
    filtered = properties
    if zone and zone != "All Zones":
        filtered = [p for p in properties if p.get("zone") == zone]

    paginated = filtered[offset: offset + limit]

    # Return lightweight summary (omit internal fields for large lists)
    summary = []
    for p in paginated:
        summary.append({
            "property_id":        p["property_id"],
            "owner_name":         p["owner_name"],
            "address":            p["address"],
            "zone":               p["zone"],
            "declared_category":  p["declared_category"],
            "reported_area_sqft": p["reported_area_sqft"],
            "tax_amount":         p["tax_amount"],
            "is_fraud":           p["is_fraud"],          # included for demo
            "phone":              p["phone"],
        })

    return {
        "total":      len(filtered),
        "offset":     offset,
        "limit":      limit,
        "properties": summary,
    }


# ── POST /analyze/{property_id} ────────────────────────────────────────────
@app.post("/analyze/{property_id}", tags=["Analysis"])
def analyze_property(property_id: str) -> Dict[str, Any]:
    """
    Run all 3 AI agents on a given property and return unified report.
    """
    property_id = property_id.upper()
    if property_id not in props_idx:
        raise HTTPException(status_code=404, detail=f"Property {property_id} not found.")

    logger.info(f"Analyzing property: {property_id}")
    result = crew.analyze(property_id)
    logger.info(
        f"Analysis complete: {property_id} | "
        f"Score={result['correlation']['score']} | "
        f"Priority={result['correlation']['priority']}"
    )
    return result


# ── GET /dashboard-stats ───────────────────────────────────────────────────
@app.get("/dashboard-stats", tags=["Dashboard"])
def dashboard_stats(
    zone: Optional[str] = Query(None)
) -> Dict[str, Any]:
    """
    Return aggregated KPI stats for the dashboard.
    """
    filtered = properties
    if zone and zone != "All Zones":
        filtered = [p for p in properties if p.get("zone") == zone]

    fraud_props   = [p for p in filtered if p["is_fraud"]]
    total_loss    = sum(p.get("annual_loss", 0) for p in fraud_props)
    five_yr_loss  = total_loss * 5
    recovery_est  = total_loss * 0.70   # assume 70 % recovery rate

    zone_breakdown: Dict[str, Dict] = {}
    for z in ["Zone-A", "Zone-B", "Zone-C"]:
        z_props     = [p for p in filtered if p["zone"] == z]
        z_fraud     = [p for p in z_props if p["is_fraud"]]
        z_loss      = sum(p.get("annual_loss", 0) for p in z_fraud)
        zone_breakdown[z] = {
            "total":       len(z_props),
            "fraud":       len(z_fraud),
            "annual_loss": round(z_loss, 2),
        }

    return {
        "total_properties":      len(filtered),
        "fraud_count":           len(fraud_props),
        "fraud_pct":             round(len(fraud_props) / max(len(filtered), 1) * 100, 1),
        "total_annual_loss":     round(total_loss,   2),
        "five_year_projection":  round(five_yr_loss, 2),
        "recovery_potential":    round(recovery_est, 2),
        "zone_breakdown":        zone_breakdown,
    }


# ── GET /satellite/{property_id} ───────────────────────────────────────────
@app.get("/satellite/{property_id}", tags=["Satellite"])
def get_satellite_info(property_id: str) -> Dict[str, Any]:
    """
    Return satellite image paths/URLs for 2020 and 2024 for a property.
    Auto-generates images on first request if they don't exist.
    """
    property_id = property_id.upper()
    prop        = props_idx.get(property_id)
    if prop is None:
        raise HTTPException(status_code=404, detail="Property not found.")

    path_2020 = SAT_DIR / f"{property_id}_2020.jpg"
    path_2024 = SAT_DIR / f"{property_id}_2024.jpg"

    if not path_2020.exists() or not path_2024.exists():
        # Generate on-the-fly
        try:
            sys.path.insert(0, str(ROOT_DIR / "models"))
            from models.satellite_simulator import generate_satellite_pair
            generate_satellite_pair(property_id, prop.get("is_fraud", False))
        except Exception as e:
            logger.error(f"Satellite generation failed for {property_id}: {e}")
            raise HTTPException(status_code=500, detail="Could not generate satellite images.")

    return {
        "property_id": property_id,
        "url_2020":    f"/satellite-images/{property_id}_2020.jpg",
        "url_2024":    f"/satellite-images/{property_id}_2024.jpg",
        "is_fraud":    prop.get("is_fraud", False),
    }


# ── GET /satellite-image/{property_id}/{year} ──────────────────────────────
@app.get("/satellite-image/{property_id}/{year}", tags=["Satellite"])
def serve_satellite_image(property_id: str, year: int):
    """Serve a satellite JPG file directly."""
    property_id = property_id.upper()
    path = SAT_DIR / f"{property_id}_{year}.jpg"
    if not path.exists():
        raise HTTPException(status_code=404, detail="Image not found.")
    return FileResponse(str(path), media_type="image/jpeg")


# ── GET /zones ─────────────────────────────────────────────────────────────
@app.get("/zones", tags=["Properties"])
def get_zones() -> Dict[str, Any]:
    """Return list of all zones with property counts."""
    zones = {}
    for p in properties:
        z = p.get("zone", "Unknown")
        zones[z] = zones.get(z, 0) + 1
    return {"zones": zones}


# ── GET /fraud-summary ─────────────────────────────────────────────────────
@app.get("/fraud-summary", tags=["Dashboard"])
def fraud_summary() -> List[Dict]:
    """
    Return top 20 highest-risk fraud properties (pre-computed from data).
    Sorted by annual_loss descending.
    """
    fraud_props = sorted(
        [p for p in properties if p["is_fraud"]],
        key=lambda x: x.get("annual_loss", 0),
        reverse=True,
    )[:20]

    return [
        {
            "property_id":    p["property_id"],
            "owner_name":     p["owner_name"],
            "address":        p["address"],
            "zone":           p["zone"],
            "reported_area":  p["reported_area_sqft"],
            "actual_area":    p["actual_area_sqft"],
            "annual_loss":    p.get("annual_loss", 0),
            "phone":          p["phone"],
        }
        for p in fraud_props
    ]
