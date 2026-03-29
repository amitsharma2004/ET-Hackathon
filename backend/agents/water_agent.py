"""
RevenueGuard AI — Water Agent
Analyzes 12-month water + electricity consumption to detect commercial
activity hidden behind a residential tax declaration.
"""
from typing import Dict, List, Any
from collections import defaultdict


class WaterAgent:
    """
    Flags properties whose average monthly water consumption exceeds
    residential norms, indicating potential commercial use.
    """

    RESIDENTIAL_WATER_THRESHOLD  = 12_000   # liters/month  (avg ≥ this → flag)
    RESIDENTIAL_POWER_THRESHOLD  =    800   # kWh/month
    BASE_CONFIDENCE              =   70.0
    MAX_CONFIDENCE               =   95.0

    def __init__(self, consumption: List[Dict]):
        # Build per-property monthly consumption index
        self._data: Dict[str, List[Dict]] = defaultdict(list)
        for row in consumption:
            self._data[row["property_id"]].append(row)

    # ── Public API ─────────────────────────────────────────────────────────
    def analyze(self, property_id: str) -> Dict[str, Any]:
        """
        Run 12-month consumption analysis.

        Returns
        -------
        {
            agent            : "WaterAgent",
            flagged          : bool,
            confidence       : float,
            reason           : str,
            evidence         : str,
            avg_water_liters : float,
            avg_elec_units   : float,
            months_analyzed  : int,
        }
        """
        records = self._data.get(property_id, [])
        if not records:
            return self._not_found(property_id)

        water_vals = [r["water_liters"]      for r in records]
        elec_vals  = [r["electricity_units"] for r in records]

        avg_water = sum(water_vals) / len(water_vals)
        avg_elec  = sum(elec_vals)  / len(elec_vals)
        max_water = max(water_vals)
        months    = len(records)

        water_flagged = avg_water > self.RESIDENTIAL_WATER_THRESHOLD
        elec_flagged  = avg_elec  > self.RESIDENTIAL_POWER_THRESHOLD
        flagged       = water_flagged or elec_flagged

        if flagged:
            water_excess = ((avg_water - self.RESIDENTIAL_WATER_THRESHOLD)
                            / self.RESIDENTIAL_WATER_THRESHOLD) * 100
            confidence = min(
                self.BASE_CONFIDENCE + (water_excess / 3.0),
                self.MAX_CONFIDENCE
            )
            flags = []
            if water_flagged:
                flags.append(
                    f"avg water {avg_water:,.0f} L/month "
                    f"(residential limit: {self.RESIDENTIAL_WATER_THRESHOLD:,} L)"
                )
            if elec_flagged:
                flags.append(
                    f"avg electricity {avg_elec:,.0f} units/month "
                    f"(residential limit: {self.RESIDENTIAL_POWER_THRESHOLD:,} units)"
                )
            reason   = (
                f"Consumption pattern indicates commercial activity: "
                + "; ".join(flags) + "."
            )
            evidence = (
                f"Avg Water: {avg_water:,.0f} L | Avg Elec: {avg_elec:,.0f} units | "
                f"Peak Water Month: {max_water:,} L | Months Analyzed: {months}"
            )
        else:
            confidence = 30.0
            reason   = (
                f"Water ({avg_water:,.0f} L/mo) and electricity ({avg_elec:,.0f} units/mo) "
                "consumption are within residential norms."
            )
            evidence = (
                f"Avg Water: {avg_water:,.0f} L | Avg Elec: {avg_elec:,.0f} units | "
                f"Months Analyzed: {months}"
            )

        return {
            "agent":             "WaterAgent",
            "flagged":           flagged,
            "confidence":        round(confidence, 1),
            "reason":            reason,
            "evidence":          evidence,
            "avg_water_liters":  round(avg_water, 1),
            "avg_elec_units":    round(avg_elec, 1),
            "months_analyzed":   months,
        }

    # ── Private helpers ────────────────────────────────────────────────────
    @staticmethod
    def _not_found(pid: str) -> Dict[str, Any]:
        return {
            "agent":            "WaterAgent",
            "flagged":          False,
            "confidence":       0.0,
            "reason":           f"No consumption data found for {pid}.",
            "evidence":         "No data available.",
            "avg_water_liters": 0.0,
            "avg_elec_units":   0.0,
            "months_analyzed":  0,
        }
