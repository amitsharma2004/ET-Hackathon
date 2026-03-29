"""
RevenueGuard AI — Crew Manager
Orchestrates Property, Water and Trade agents in parallel,
calculates correlation score, priority and revenue impact.
"""
import concurrent.futures
from typing import Dict, List, Any

from .property_agent import PropertyAgent
from .water_agent    import WaterAgent
from .trade_agent    import TradeAgent


# ── Revenue calculation constants ─────────────────────────────────────────
RESIDENTIAL_RATE = 2.5    # ₹ per sqft per year
COMMERCIAL_RATE  = 8.5    # ₹ per sqft per year
PENALTY_FACTOR   = 1.25   # 25 % surcharge on annual loss


class CrewManager:
    """
    Orchestrates all agents and produces a unified fraud analysis report.

    Correlation Score Table
    -----------------------
    3 agents flag → 100  (Critical)
    2 agents flag →  85  (High Priority)
    1 agent  flag →  60  (Medium)
    0 agents flag →  20  (Low / Clear)
    """

    SCORE_TABLE = {3: 100, 2: 85, 1: 60, 0: 20}

    PRIORITY_MAP = {
        100: ("Critical",      "🔴"),
        85:  ("High Priority", "🟠"),
        60:  ("Medium",        "🟡"),
        20:  ("Low",           "🟢"),
    }

    def __init__(self, properties: List[Dict], consumption: List[Dict],
                 gst_records: List[Dict]):
        self._props_idx = {p["property_id"]: p for p in properties}
        self.prop_agent  = PropertyAgent(properties)
        self.water_agent = WaterAgent(consumption)
        self.trade_agent = TradeAgent(gst_records)

    # ── Public API ─────────────────────────────────────────────────────────
    def analyze(self, property_id: str) -> Dict[str, Any]:
        """
        Run all 3 agents in parallel and produce the unified report.
        """
        prop = self._props_idx.get(property_id)
        if prop is None:
            return {"error": f"Property {property_id} not found."}

        address = prop.get("address", "")

        # ── Parallel execution ────────────────────────────────────────────
        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
            fut_prop  = pool.submit(self.prop_agent.analyze,  property_id)
            fut_water = pool.submit(self.water_agent.analyze, property_id)
            fut_trade = pool.submit(self.trade_agent.analyze, property_id, address)

        prop_result  = fut_prop.result()
        water_result = fut_water.result()
        trade_result = fut_trade.result()

        # ── Correlation ───────────────────────────────────────────────────
        flags_count  = sum([
            prop_result["flagged"],
            water_result["flagged"],
            trade_result["flagged"],
        ])
        corr_score   = self.SCORE_TABLE[flags_count]
        priority_label, priority_icon = self.PRIORITY_MAP[corr_score]

        # ── Fraud type classification ──────────────────────────────────────
        fraud_type = self._classify_fraud(prop_result, water_result, trade_result)

        # ── Revenue calculation ────────────────────────────────────────────
        reported_area  = prop.get("reported_area_sqft", 0)
        actual_area    = prop.get("actual_area_sqft", 0)
        current_tax    = reported_area * RESIDENTIAL_RATE
        fair_tax       = actual_area   * COMMERCIAL_RATE
        annual_loss    = max(fair_tax - current_tax, 0)
        five_yr_loss   = annual_loss * 5
        with_penalty   = annual_loss * PENALTY_FACTOR

        revenue = {
            "current_tax_annual":   round(current_tax,  2),
            "fair_tax_annual":      round(fair_tax,     2),
            "annual_loss":          round(annual_loss,  2),
            "five_year_projection": round(five_yr_loss, 2),
            "with_penalty":         round(with_penalty, 2),
        }

        # ── Notification template ──────────────────────────────────────────
        notice_marathi = self._generate_marathi_notice(prop, annual_loss, fraud_type)

        return {
            "property_id":      property_id,
            "property_details": prop,
            "agent_results": {
                "property_agent": prop_result,
                "water_agent":    water_result,
                "trade_agent":    trade_result,
            },
            "correlation": {
                "flags_count":    flags_count,
                "score":          corr_score,
                "priority":       priority_label,
                "priority_icon":  priority_icon,
                "fraud_type":     fraud_type,
            },
            "revenue_impact":     revenue,
            "notice_marathi":     notice_marathi,
            "whatsapp_preview":   self._whatsapp_template(prop, annual_loss, fraud_type),
        }

    # ── Private helpers ────────────────────────────────────────────────────
    @staticmethod
    def _classify_fraud(prop_r, water_r, trade_r) -> str:
        p = prop_r["flagged"]
        w = water_r["flagged"]
        t = trade_r["flagged"]

        if p and w and t:
            return "Critical Commercial Fraud — Illegal construction + commercial use + no license"
        if p and w:
            return "High Confidence Commercial Fraud — Area under-reported + commercial consumption"
        if p and t:
            return "Commercial Activity Without License — Area mismatch + unlicensed business"
        if w and t:
            return "Unlicensed Commercial Operation — High consumption + no trade license"
        if p:
            return "Possible Residential Extension — Area under-reported"
        if w:
            return "Elevated Consumption — Possible commercial activity"
        if t:
            return "Unlicensed Business — Trade license missing"
        return "No Significant Fraud Indicators"

    @staticmethod
    def _generate_marathi_notice(prop: Dict, annual_loss: float, fraud_type: str) -> str:
        pid     = prop.get("property_id", "N/A")
        address = prop.get("address",     "N/A")
        owner   = prop.get("owner_name",  "N/A")
        return (
            f"🚨 महानगरपालिका नोटीस\n\n"
            f"मालमत्ता क्रमांक: {pid}\n"
            f"मालक: {owner}\n"
            f"पत्ता: {address}\n\n"
            f"समस्या: {fraud_type}\n"
            f"अंदाजित महसूल तूट: ₹{annual_loss:,.0f}/वर्ष\n\n"
            f"आपणास 7 दिवसांत खुलासा सादर करावयाचा आहे.\n"
            f"अन्यथा थकबाकीसह दंड आकारण्यात येईल.\n\n"
            f"— पुणे महानगरपालिका, मालमत्ता कर विभाग"
        )

    @staticmethod
    def _whatsapp_template(prop: Dict, annual_loss: float, fraud_type: str) -> str:
        pid     = prop.get("property_id", "N/A")
        address = prop.get("address",     "N/A")
        return (
            f"🚨 *RevenueGuard Alert*\n"
            f"Property: {pid}\n"
            f"Address: {address}\n"
            f"Issue: {fraud_type}\n"
            f"Revenue Loss: ₹{annual_loss:,.0f}/year\n"
            f"Action Required: Issue notice within 7 days\n"
            f"[View Details in Dashboard]"
        )
