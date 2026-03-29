"""
RevenueGuard AI — Trade License Agent
Cross-references GST registrations with property addresses and checks
whether active businesses hold valid municipal trade licenses.
"""
from typing import Dict, List, Any


class TradeAgent:
    """
    Flags properties where a GST-registered business operates without
    a corresponding municipal trade license.
    """

    def __init__(self, gst_records: List[Dict]):
        # Index by property_id for direct lookup
        self._by_prop: Dict[str, Dict] = {}
        # Also index by address substring for fuzzy matching
        self._by_addr: List[Dict] = []

        for rec in gst_records:
            if rec.get("property_id"):
                self._by_prop[rec["property_id"]] = rec
            if rec.get("address"):
                self._by_addr.append(rec)

    # ── Public API ─────────────────────────────────────────────────────────
    def analyze(self, property_id: str, address: str = "") -> Dict[str, Any]:
        """
        Check GST registration and trade license status.

        Returns
        -------
        {
            agent           : "TradeAgent",
            flagged         : bool,
            confidence      : float,
            reason          : str,
            evidence        : str,
            gst_found       : bool,
            has_license     : bool,
            business_name   : str | None,
            gstin           : str | None,
        }
        """
        # Primary: direct property_id match
        gst_rec = self._by_prop.get(property_id)

        # Fallback: address substring match
        if gst_rec is None and address:
            gst_rec = self._fuzzy_address_match(address)

        if gst_rec is None:
            # No GST registration found → no flag
            return {
                "agent":         "TradeAgent",
                "flagged":       False,
                "confidence":    40.0,
                "reason":        "No GST registration linked to this property address.",
                "evidence":      "No GST records found for this property_id or address.",
                "gst_found":     False,
                "has_license":   False,
                "business_name": None,
                "gstin":         None,
            }

        has_license   = bool(gst_rec.get("has_trade_license"))
        business_name = gst_rec.get("business_name", "Unknown")
        gstin         = gst_rec.get("gstin", "N/A")
        flagged       = not has_license    # flag if GST exists but NO trade license

        if flagged:
            confidence = 85.0
            reason     = (
                f"Business '{business_name}' (GSTIN: {gstin}) is operating at this "
                "address but has NO valid municipal trade license."
            )
            evidence   = (
                f"GST Registered: YES | Business: {business_name} | "
                f"GSTIN: {gstin} | Trade License: NOT FOUND"
            )
        else:
            confidence = 30.0
            license_no = gst_rec.get("license_number", "N/A")
            reason     = (
                f"Business '{business_name}' (GSTIN: {gstin}) has a valid "
                f"trade license (No. {license_no})."
            )
            evidence   = (
                f"GST Registered: YES | Business: {business_name} | "
                f"Trade License: {license_no}"
            )

        return {
            "agent":         "TradeAgent",
            "flagged":       flagged,
            "confidence":    confidence,
            "reason":        reason,
            "evidence":      evidence,
            "gst_found":     True,
            "has_license":   has_license,
            "business_name": business_name,
            "gstin":         gstin,
        }

    # ── Private helpers ────────────────────────────────────────────────────
    def _fuzzy_address_match(self, address: str) -> Dict | None:
        """Very simple substring overlap check (good enough for synthetic data)."""
        addr_lower = address.lower()
        for rec in self._by_addr:
            rec_addr = rec.get("address", "").lower()
            # Match on at least 3 significant words
            words = [w for w in addr_lower.split() if len(w) > 3]
            if sum(1 for w in words if w in rec_addr) >= 2:
                return rec
        return None
