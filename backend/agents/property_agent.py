"""
RevenueGuard AI — Property Agent
Compares declared area vs actual area and flags under-reporting fraud.
"""
from typing import Dict, Any


class PropertyAgent:
    """
    Detects area under-reporting by comparing reported_area_sqft
    against actual_area_sqft from field survey data.
    """

    THRESHOLD_PCT = 20.0          # flag if actual > reported by more than 20 %
    BASE_CONFIDENCE = 70.0        # minimum confidence when flagging
    MAX_CONFIDENCE  = 95.0        # cap

    def __init__(self, properties: list[Dict]):
        # Index properties by ID for O(1) lookup
        self._data: Dict[str, Dict] = {p["property_id"]: p for p in properties}

    # ── Public API ─────────────────────────────────────────────────────────
    def analyze(self, property_id: str) -> Dict[str, Any]:
        """
        Run property area analysis.

        Returns
        -------
        {
            agent        : "PropertyAgent",
            flagged      : bool,
            confidence   : float,   # 0-100
            reason       : str,
            evidence     : str,
            reported_area: int,
            actual_area  : int,
            pct_diff     : float,
        }
        """
        prop = self._data.get(property_id)
        if prop is None:
            return self._not_found(property_id)

        reported = prop["reported_area_sqft"]
        actual   = prop["actual_area_sqft"]
        declared = prop.get("declared_category", "Residential")

        if reported == 0:
            pct_diff = 0.0
        else:
            pct_diff = ((actual - reported) / reported) * 100.0

        flagged = pct_diff > self.THRESHOLD_PCT

        if flagged:
            confidence = min(
                self.BASE_CONFIDENCE + (pct_diff / 2.0),
                self.MAX_CONFIDENCE
            )
            reason   = (
                f"Property declared as {declared} with {reported} sqft, "
                f"but field survey shows {actual} sqft — "
                f"{pct_diff:.1f}% under-reported."
            )
            evidence = (
                f"Reported: {reported} sqft | Actual: {actual} sqft | "
                f"Excess: {actual - reported} sqft ({pct_diff:.1f}% over threshold of {self.THRESHOLD_PCT}%)"
            )
        else:
            confidence = max(20.0, 65.0 - abs(pct_diff))
            reason   = (
                f"Declared area ({reported} sqft) is within acceptable range "
                f"of surveyed area ({actual} sqft). Variance: {pct_diff:.1f}%."
            )
            evidence = (
                f"Reported: {reported} sqft | Actual: {actual} sqft | "
                f"Variance: {pct_diff:.1f}% (below {self.THRESHOLD_PCT}% threshold)"
            )

        return {
            "agent":         "PropertyAgent",
            "flagged":       flagged,
            "confidence":    round(confidence, 1),
            "reason":        reason,
            "evidence":      evidence,
            "reported_area": reported,
            "actual_area":   actual,
            "pct_diff":      round(pct_diff, 1),
        }

    # ── Private helpers ────────────────────────────────────────────────────
    @staticmethod
    def _not_found(pid: str) -> Dict[str, Any]:
        return {
            "agent":      "PropertyAgent",
            "flagged":    False,
            "confidence": 0.0,
            "reason":     f"Property {pid} not found in database.",
            "evidence":   "No data available.",
            "reported_area": 0,
            "actual_area":   0,
            "pct_diff":      0.0,
        }
