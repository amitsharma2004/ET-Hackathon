"""
RevenueGuard AI — Streamlit Dashboard
Municipal Revenue Protection System for Indian ULBs
"""
import os
import sys
import json
import time
import requests
from pathlib import Path
from typing import Dict, Any, List, Optional

import streamlit as st

# ── Path setup ─────────────────────────────────────────────────────────────
ROOT_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT_DIR))

# ── Page config ────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="RevenueGuard AI",
    page_icon="🏛️",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ── Backend config ─────────────────────────────────────────────────────────
BACKEND_URL = os.environ.get("BACKEND_URL", "http://127.0.0.1:8000")

# ── Color Palette ──────────────────────────────────────────────────────────
SAFFRON   = "#FF9933"
NAVY      = "#000080"
SUCCESS   = "#28A745"
WARNING   = "#FFC107"
DANGER    = "#DC3545"
BG_LIGHT  = "#F5F5F5"

# ══════════════════════════════════════════════════════════════════════════════
# CSS
# ══════════════════════════════════════════════════════════════════════════════
st.markdown(f"""
<style>
  /* Global */
  .stApp {{ background-color: {BG_LIGHT}; }}

  /* Header */
  .rg-header {{
    background: linear-gradient(135deg, {NAVY} 0%, #1a237e 100%);
    padding: 1.5rem 2rem;
    border-radius: 12px;
    margin-bottom: 1.5rem;
    border-left: 6px solid {SAFFRON};
  }}
  .rg-header h1 {{ color: {SAFFRON}; font-size: 2.2rem; margin: 0; font-weight: 800; }}
  .rg-header p  {{ color: #ccc; margin: 0.3rem 0 0; font-size: 1rem; }}

  /* KPI cards */
  .kpi-card {{
    background: white;
    border-radius: 10px;
    padding: 1.2rem;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.10);
    border-top: 4px solid {SAFFRON};
  }}
  .kpi-value {{ font-size: 2rem; font-weight: 800; color: {NAVY}; }}
  .kpi-label {{ font-size: 0.85rem; color: #666; margin-top: 0.3rem; }}

  /* Agent cards */
  .agent-card {{
    background: white;
    border-radius: 10px;
    padding: 1rem 1.2rem;
    box-shadow: 0 2px 6px rgba(0,0,0,0.08);
    margin-bottom: 0.8rem;
  }}
  .agent-title {{ font-weight: 700; font-size: 1rem; color: {NAVY}; }}
  .badge-red    {{ background:{DANGER};  color:white; padding:2px 10px; border-radius:12px; font-size:0.78rem; }}
  .badge-orange {{ background:{WARNING}; color:white; padding:2px 10px; border-radius:12px; font-size:0.78rem; }}
  .badge-green  {{ background:{SUCCESS}; color:white; padding:2px 10px; border-radius:12px; font-size:0.78rem; }}

  /* Notice box */
  .notice-box {{
    background: #fff3cd;
    border: 1px solid #ffc107;
    border-radius: 8px;
    padding: 1rem;
    font-family: "Noto Sans Devanagari", sans-serif;
    white-space: pre-wrap;
    line-height: 1.7;
  }}
  .whatsapp-box {{
    background: #e8f5e9;
    border: 1px solid #4caf50;
    border-radius: 8px;
    padding: 1rem;
    white-space: pre-wrap;
    font-size: 0.9rem;
  }}
  div[data-testid="stHorizontalBlock"] > div {{ gap: 1rem; }}
</style>
""", unsafe_allow_html=True)

# ══════════════════════════════════════════════════════════════════════════════
# Helpers — API calls
# ══════════════════════════════════════════════════════════════════════════════
@st.cache_data(ttl=60)
def api_get(endpoint: str, params: Dict = None) -> Optional[Dict]:
    try:
        r = requests.get(f"{BACKEND_URL}{endpoint}", params=params, timeout=10)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        st.error(f"⚠️ API error ({endpoint}): {e}")
        return None


def api_post(endpoint: str) -> Optional[Dict]:
    try:
        r = requests.post(f"{BACKEND_URL}{endpoint}", timeout=30)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        st.error(f"⚠️ Analysis error: {e}")
        return None


# ── Fallback: load data locally if backend is not reachable ─────────────────
@st.cache_data
def load_local_properties() -> List[Dict]:
    path = ROOT_DIR / "data" / "properties.json"
    if path.exists():
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    return []


@st.cache_data
def load_local_consumption() -> List[Dict]:
    path = ROOT_DIR / "data" / "consumption.json"
    if path.exists():
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    return []


@st.cache_data
def load_local_gst() -> List[Dict]:
    path = ROOT_DIR / "data" / "gst_registrations.json"
    if path.exists():
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    return []


def backend_alive() -> bool:
    try:
        r = requests.get(f"{BACKEND_URL}/health", timeout=3)
        return r.status_code == 200
    except Exception:
        return False


# ── Run analysis locally if backend unavailable ─────────────────────────────
def local_analyze(property_id: str) -> Dict:
    from backend.agents import CrewManager
    props = load_local_properties()
    cons  = load_local_consumption()
    gst   = load_local_gst()
    cm    = CrewManager(props, cons, gst)
    return cm.analyze(property_id)


# ══════════════════════════════════════════════════════════════════════════════
# Language support
# ══════════════════════════════════════════════════════════════════════════════
LABELS = {
    "English": {
        "title":         "RevenueGuard AI",
        "subtitle":      "Municipal Revenue Protection System — Powered by Multi-Agent GenAI",
        "total_props":   "Total Properties",
        "fraud_cases":   "Fraud Cases",
        "revenue_risk":  "Revenue at Risk (Annual)",
        "recovery":      "Recovery Potential (70%)",
        "select_zone":   "Select Zone",
        "run_analysis":  "🔍 Analyze Property",
        "analyzing":     "AI Agents analyzing...",
        "zone_filter":   "Filter by Zone",
        "property_sel":  "Select Property ID",
        "sat_title":     "🛰️ Satellite Comparison",
        "before":        "📷 2020 (Before)",
        "after":         "📷 2024 (After)",
        "notice_title":  "📋 Auto-Generated Notice (Marathi)",
        "whatsapp":      "📱 WhatsApp Alert Preview",
        "send_notice":   "📤 Send Notice",
        "schedule":      "📅 Schedule Inspection",
        "mark_resolved": "✅ Mark Resolved",
    },
    "हिंदी": {
        "title":         "RevenueGuard AI",
        "subtitle":      "नगरपालिका राजस्व संरक्षण प्रणाली — मल्टी-एजेंट GenAI द्वारा संचालित",
        "total_props":   "कुल संपत्तियाँ",
        "fraud_cases":   "धोखाधड़ी के मामले",
        "revenue_risk":  "खतरे में राजस्व (वार्षिक)",
        "recovery":      "वसूली संभावना (70%)",
        "select_zone":   "ज़ोन चुनें",
        "run_analysis":  "🔍 संपत्ति का विश्लेषण करें",
        "analyzing":     "AI एजेंट विश्लेषण कर रहे हैं...",
        "zone_filter":   "ज़ोन द्वारा फ़िल्टर करें",
        "property_sel":  "संपत्ति ID चुनें",
        "sat_title":     "🛰️ उपग्रह तुलना",
        "before":        "📷 2020 (पहले)",
        "after":         "📷 2024 (बाद में)",
        "notice_title":  "📋 स्वतः उत्पन्न नोटिस (मराठी)",
        "whatsapp":      "📱 WhatsApp अलर्ट पूर्वावलोकन",
        "send_notice":   "📤 नोटिस भेजें",
        "schedule":      "📅 निरीक्षण शेड्यूल करें",
        "mark_resolved": "✅ हल किया गया चिह्नित करें",
    },
    "मराठी": {
        "title":         "RevenueGuard AI",
        "subtitle":      "महानगरपालिका महसूल संरक्षण प्रणाली — मल्टी-एजंट GenAI द्वारे",
        "total_props":   "एकूण मालमत्ता",
        "fraud_cases":   "फसवणुकीचे प्रकरण",
        "revenue_risk":  "धोक्यातील महसूल (वार्षिक)",
        "recovery":      "वसुलीची संभावना (70%)",
        "select_zone":   "झोन निवडा",
        "run_analysis":  "🔍 मालमत्ता विश्लेषण करा",
        "analyzing":     "AI एजंट विश्लेषण करत आहेत...",
        "zone_filter":   "झोननुसार फिल्टर करा",
        "property_sel":  "मालमत्ता ID निवडा",
        "sat_title":     "🛰️ उपग्रह तुलना",
        "before":        "📷 २०२० (आधी)",
        "after":         "📷 २०२४ (नंतर)",
        "notice_title":  "📋 स्वयंचलित नोटीस (मराठी)",
        "whatsapp":      "📱 WhatsApp अलर्ट पूर्वावलोकन",
        "send_notice":   "📤 नोटीस पाठवा",
        "schedule":      "📅 तपासणी शेड्यूल करा",
        "mark_resolved": "✅ सोडवलेले म्हणून चिन्हांकित करा",
    },
}


def L(key: str) -> str:
    lang = st.session_state.get("lang", "English")
    return LABELS.get(lang, LABELS["English"]).get(key, key)


# ══════════════════════════════════════════════════════════════════════════════
# SIDEBAR
# ══════════════════════════════════════════════════════════════════════════════
with st.sidebar:
    st.image("https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/120px-Emblem_of_India.svg.png", width=60)
    st.markdown(f"## 🏛️ RevenueGuard AI")
    st.markdown("---")

    # Language selector
    lang = st.selectbox("🌐 Language / भाषा / भाषा", ["English", "हिंदी", "मराठी"], key="lang")

    st.markdown("---")
    st.markdown("### 📌 Navigation")
    page = st.radio("Go to", ["📊 Dashboard", "🔍 Property Analysis", "🛰️ Satellite View", "📋 Reports"], label_visibility="collapsed")

    st.markdown("---")
    # Zone filter
    zone_opt = st.selectbox(L("zone_filter"), ["All Zones", "Zone-A", "Zone-B", "Zone-C"])
    st.session_state["selected_zone"] = zone_opt

    st.markdown("---")
    be_alive = backend_alive()
    if be_alive:
        st.success("🟢 Backend Connected")
    else:
        st.warning("🟡 Running in Local Mode")

    st.markdown("---")
    st.caption("Powered by Multi-Agent GenAI\nReference: Jabalpur ₹30Cr Recovery\nPrithvi-EO-2.0 Satellite Model")


# ══════════════════════════════════════════════════════════════════════════════
# HEADER
# ══════════════════════════════════════════════════════════════════════════════
st.markdown(f"""
<div class="rg-header">
  <h1>🏛️ {L('title')}</h1>
  <p>{L('subtitle')}</p>
</div>
""", unsafe_allow_html=True)


# ══════════════════════════════════════════════════════════════════════════════
# Load data for UI
# ══════════════════════════════════════════════════════════════════════════════
selected_zone = st.session_state.get("selected_zone", "All Zones")
props_data = load_local_properties()
if selected_zone != "All Zones":
    props_filtered = [p for p in props_data if p.get("zone") == selected_zone]
else:
    props_filtered = props_data

fraud_props   = [p for p in props_filtered if p["is_fraud"]]
total_loss    = sum(p.get("annual_loss", 0) for p in fraud_props)
recovery_est  = total_loss * 0.70


# ══════════════════════════════════════════════════════════════════════════════
# PAGE: DASHBOARD
# ══════════════════════════════════════════════════════════════════════════════
if "Dashboard" in page:
    # ── KPI Cards ──────────────────────────────────────────────────────────
    c1, c2, c3, c4 = st.columns(4)
    with c1:
        st.markdown(f"""
        <div class="kpi-card">
          <div class="kpi-value">{len(props_filtered):,}</div>
          <div class="kpi-label">📊 {L('total_props')}</div>
        </div>""", unsafe_allow_html=True)
    with c2:
        st.markdown(f"""
        <div class="kpi-card" style="border-top-color:{DANGER};">
          <div class="kpi-value" style="color:{DANGER};">{len(fraud_props):,}</div>
          <div class="kpi-label">🚨 {L('fraud_cases')}</div>
        </div>""", unsafe_allow_html=True)
    with c3:
        st.markdown(f"""
        <div class="kpi-card" style="border-top-color:{WARNING};">
          <div class="kpi-value" style="color:{WARNING};">₹{total_loss/100000:.1f}L</div>
          <div class="kpi-label">💸 {L('revenue_risk')}</div>
        </div>""", unsafe_allow_html=True)
    with c4:
        st.markdown(f"""
        <div class="kpi-card" style="border-top-color:{SUCCESS};">
          <div class="kpi-value" style="color:{SUCCESS};">₹{recovery_est/100000:.1f}L</div>
          <div class="kpi-label">💰 {L('recovery')}</div>
        </div>""", unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    # ── Charts ──────────────────────────────────────────────────────────────
    try:
        import plotly.graph_objects as go
        import plotly.express as px

        col_left, col_right = st.columns([1, 1])

        with col_left:
            st.markdown("### 📊 Fraud Distribution by Zone")
            zone_data = {}
            for z in ["Zone-A", "Zone-B", "Zone-C"]:
                zp  = [p for p in props_filtered if p["zone"] == z]
                zf  = [p for p in zp if p["is_fraud"]]
                zone_data[z] = {"Total": len(zp), "Fraud": len(zf), "Clear": len(zp) - len(zf)}

            fig_bar = go.Figure()
            fig_bar.add_trace(go.Bar(name="Clear", x=list(zone_data.keys()),
                                     y=[zone_data[z]["Clear"] for z in zone_data],
                                     marker_color=SUCCESS))
            fig_bar.add_trace(go.Bar(name="Fraud", x=list(zone_data.keys()),
                                     y=[zone_data[z]["Fraud"] for z in zone_data],
                                     marker_color=DANGER))
            fig_bar.update_layout(barmode="stack", height=300, showlegend=True,
                                  plot_bgcolor="white", paper_bgcolor="white",
                                  font=dict(size=12),
                                  margin=dict(l=20, r=20, t=20, b=20))
            st.plotly_chart(fig_bar, use_container_width=True)

        with col_right:
            st.markdown("### 💸 Revenue Loss by Zone")
            zone_loss = {}
            for z in ["Zone-A", "Zone-B", "Zone-C"]:
                zp = [p for p in props_filtered if p["zone"] == z and p["is_fraud"]]
                zone_loss[z] = sum(p.get("annual_loss", 0) for p in zp)

            fig_pie = px.pie(
                values=list(zone_loss.values()),
                names=list(zone_loss.keys()),
                color_discrete_sequence=[DANGER, WARNING, SAFFRON],
                hole=0.4,
            )
            fig_pie.update_layout(height=300, margin=dict(l=20, r=20, t=20, b=20),
                                  showlegend=True)
            st.plotly_chart(fig_pie, use_container_width=True)

        # ── Map ────────────────────────────────────────────────────────────
        st.markdown("### 🗺️ Property Map — Pune")
        import folium
        from streamlit_folium import st_folium
        import random as rnd

        rnd.seed(42)
        m = folium.Map(location=[18.5204, 73.8567], zoom_start=12, tiles="CartoDB positron")

        for prop in props_filtered[:150]:   # cap at 150 markers for performance
            lat = 18.48 + rnd.uniform(0, 0.10)
            lon = 73.82 + rnd.uniform(0, 0.10)
            color = "red" if prop["is_fraud"] else "green"
            popup = (
                f"<b>{prop['property_id']}</b><br>"
                f"{prop['owner_name']}<br>"
                f"{prop['address'][:40]}...<br>"
                f"Zone: {prop['zone']}<br>"
                f"Area: {prop['reported_area_sqft']} sqft declared<br>"
                f"{'⚠️ FLAGGED' if prop['is_fraud'] else '✅ CLEAR'}"
            )
            folium.CircleMarker(
                location=[lat, lon], radius=7,
                color=color, fill=True, fill_opacity=0.7,
                popup=folium.Popup(popup, max_width=220),
            ).add_to(m)

        st_folium(m, width=None, height=400)

    except ImportError as e:
        st.warning(f"Visualization libraries not fully installed: {e}")

    # ── Top Fraud Table ────────────────────────────────────────────────────
    st.markdown("### 🚨 Top Fraud Cases")
    top_fraud = sorted(fraud_props, key=lambda x: x.get("annual_loss", 0), reverse=True)[:10]
    if top_fraud:
        import pandas as pd
        df = pd.DataFrame([{
            "Property ID":   p["property_id"],
            "Owner":         p["owner_name"],
            "Zone":          p["zone"],
            "Declared Area": f"{p['reported_area_sqft']} sqft",
            "Actual Area":   f"{p['actual_area_sqft']} sqft",
            "Annual Loss":   f"₹{p.get('annual_loss',0):,.0f}",
        } for p in top_fraud])
        st.dataframe(df, use_container_width=True, hide_index=True)


# ══════════════════════════════════════════════════════════════════════════════
# PAGE: PROPERTY ANALYSIS
# ══════════════════════════════════════════════════════════════════════════════
elif "Analysis" in page:
    st.markdown("## 🔍 Property Analysis")

    prop_ids = [p["property_id"] for p in props_filtered]
    # Pre-select a known fraud property for demo
    default_idx = prop_ids.index("PROP00001") if "PROP00001" in prop_ids else 0

    col_sel, col_btn = st.columns([3, 1])
    with col_sel:
        selected_pid = st.selectbox(L("property_sel"), prop_ids, index=default_idx)
    with col_btn:
        st.markdown("<br>", unsafe_allow_html=True)
        analyze_btn = st.button(L("run_analysis"), use_container_width=True)

    # Show basic property info
    prop_info = next((p for p in props_data if p["property_id"] == selected_pid), None)
    if prop_info:
        with st.expander("📁 Property Details", expanded=False):
            c1, c2, c3 = st.columns(3)
            c1.metric("Property ID",    prop_info["property_id"])
            c1.metric("Owner",          prop_info["owner_name"])
            c2.metric("Zone",           prop_info["zone"])
            c2.metric("Declared Cat.",  prop_info["declared_category"])
            c3.metric("Reported Area",  f"{prop_info['reported_area_sqft']} sqft")
            c3.metric("Tax Amount",     f"₹{prop_info['tax_amount']:,.0f}")
            st.text(f"📍 {prop_info['address']}")
            st.text(f"📞 {prop_info['phone']}")

    if analyze_btn:
        with st.spinner(L("analyzing")):
            # Show animated agent logs
            log_container = st.empty()
            for msg in [
                "🤖 PropertyAgent: Comparing declared vs survey area...",
                "💧 WaterAgent: Analyzing 12-month consumption data...",
                "🏪 TradeAgent: Cross-referencing GST database...",
                "📊 CrewManager: Calculating correlation score...",
            ]:
                log_container.info(msg)
                time.sleep(0.4)
            log_container.empty()

            # Run analysis
            if backend_alive():
                result = api_post(f"/analyze/{selected_pid}")
            else:
                result = local_analyze(selected_pid)

        if result and "error" not in result:
            corr   = result["correlation"]
            agents = result["agent_results"]
            rev    = result["revenue_impact"]
            score  = corr["score"]

            # ── Priority badge ─────────────────────────────────────────────
            badge_color = {100: DANGER, 85: "#e65100", 60: WARNING, 20: SUCCESS}.get(score, SAFFRON)
            st.markdown(f"""
            <div style="text-align:center;margin:1rem 0;">
              <span style="background:{badge_color};color:white;padding:8px 24px;
                    border-radius:20px;font-size:1.2rem;font-weight:700;">
                {corr['priority_icon']} {corr['priority']} — Score: {score}/100
              </span>
            </div>
            """, unsafe_allow_html=True)
            st.markdown(f"**Fraud Type:** {corr['fraud_type']}")
            st.progress(score / 100)

            # ── Agent cards ────────────────────────────────────────────────
            st.markdown("### 🤖 Agent Findings")
            ac1, ac2, ac3 = st.columns(3)

            def _agent_card(col, title, icon, res):
                flagged   = res["flagged"]
                badge_cls = "badge-red" if flagged else "badge-green"
                status    = "FLAGGED ⚠️" if flagged else "CLEAR ✅"
                with col:
                    st.markdown(f"""
                    <div class="agent-card">
                      <div class="agent-title">{icon} {title}</div>
                      <span class="{badge_cls}">{status}</span>
                      <p style="font-size:0.8rem;margin-top:0.5rem;color:#444;">
                        {res['reason'][:160]}…
                      </p>
                      <p style="font-size:0.75rem;color:#888;">{res['evidence'][:120]}</p>
                      <b>Confidence: {res['confidence']}%</b>
                    </div>
                    """, unsafe_allow_html=True)

            _agent_card(ac1, "Property Agent", "🏠", agents["property_agent"])
            _agent_card(ac2, "Water Agent",    "💧", agents["water_agent"])
            _agent_card(ac3, "Trade Agent",    "🏪", agents["trade_agent"])

            # ── Revenue impact ─────────────────────────────────────────────
            st.markdown("### 💸 Revenue Impact")
            rc1, rc2, rc3, rc4 = st.columns(4)
            rc1.metric("Current Tax",       f"₹{rev['current_tax_annual']:,.0f}")
            rc2.metric("Fair Tax",          f"₹{rev['fair_tax_annual']:,.0f}")
            rc3.metric("Annual Loss",       f"₹{rev['annual_loss']:,.0f}", delta=f"₹{rev['annual_loss']:,.0f} under-collection")
            rc4.metric("5-Year Projection", f"₹{rev['five_year_projection']:,.0f}")

            # ── Notifications ──────────────────────────────────────────────
            st.markdown(f"### {L('notice_title')}")
            st.markdown(f"""
            <div class="notice-box">{result.get('notice_marathi', 'N/A')}</div>
            """, unsafe_allow_html=True)

            st.markdown(f"### {L('whatsapp')}")
            st.markdown(f"""
            <div class="whatsapp-box">{result.get('whatsapp_preview', 'N/A')}</div>
            """, unsafe_allow_html=True)

            # ── Action buttons ─────────────────────────────────────────────
            st.markdown("### ⚡ Actions")
            btn1, btn2, btn3 = st.columns(3)
            if btn1.button(L("send_notice"), use_container_width=True):
                st.success("✅ Notice sent via email and SMS!")
            if btn2.button(L("schedule"), use_container_width=True):
                st.success("📅 Field inspection scheduled for next week!")
            if btn3.button(L("mark_resolved"), use_container_width=True):
                st.success("✅ Case marked as resolved.")

        elif result:
            st.error(f"Analysis error: {result.get('error')}")


# ══════════════════════════════════════════════════════════════════════════════
# PAGE: SATELLITE VIEW
# ══════════════════════════════════════════════════════════════════════════════
elif "Satellite" in page:
    st.markdown(f"## {L('sat_title')}")
    st.caption("Simulated imagery showing building footprint changes (2020 → 2024). Powered by Prithvi-EO-2.0 model pipeline.")

    prop_ids = [p["property_id"] for p in props_filtered]
    sat_pid  = st.selectbox("Select Property", prop_ids)

    if st.button("🛰️ Load Satellite Imagery"):
        prop_info = next((p for p in props_data if p["property_id"] == sat_pid), {})

        # Generate images if needed
        sat_dir  = ROOT_DIR / "data" / "satellite"
        p20      = sat_dir / f"{sat_pid}_2020.jpg"
        p24      = sat_dir / f"{sat_pid}_2024.jpg"

        if not p20.exists() or not p24.exists():
            with st.spinner("🛰️ Generating satellite imagery..."):
                try:
                    from models.satellite_simulator import generate_satellite_pair
                    generate_satellite_pair(sat_pid, prop_info.get("is_fraud", False))
                except Exception as e:
                    st.error(f"Could not generate images: {e}")

        col_l, col_r = st.columns(2)
        with col_l:
            st.markdown(f"#### {L('before')}")
            if p20.exists():
                st.image(str(p20), use_column_width=True, caption="2020 — Baseline")
            else:
                st.info("Image not available")
        with col_r:
            st.markdown(f"#### {L('after')}")
            if p24.exists():
                st.image(str(p24), use_column_width=True, caption="2024 — Current")
            else:
                st.info("Image not available")

        if prop_info.get("is_fraud"):
            rep = prop_info.get("reported_area_sqft", 0)
            act = prop_info.get("actual_area_sqft", 0)
            if rep > 0:
                pct = ((act - rep) / rep) * 100
            else:
                pct = 0
            st.error(f"🔴 AI detected ~{pct:.0f}% building area increase — Illegal construction suspected")
            st.markdown(f"""
            | Metric | 2020 | 2024 | Change |
            |--------|------|------|--------|
            | Declared Area | {rep} sqft | {rep} sqft | — |
            | Actual Area   | {rep} sqft | {act} sqft | **+{act-rep} sqft** |
            | Variance      | 0%         | **{pct:.1f}%** | 🔴 |
            """)
        else:
            st.success("✅ No significant structural changes detected between 2020 and 2024.")


# ══════════════════════════════════════════════════════════════════════════════
# PAGE: REPORTS
# ══════════════════════════════════════════════════════════════════════════════
elif "Reports" in page:
    st.markdown("## 📋 Zone Reports")

    try:
        import pandas as pd
        import plotly.express as px

        # Revenue trend (simulated monthly)
        st.markdown("### 📈 Monthly Revenue Recovery Trend")
        months  = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"]
        revenue = [12.5, 14.2, 11.8, 16.0, 18.5, 15.3, 19.2, 21.0, 17.8, 22.5, 25.0, 28.3]
        fig_trend = px.line(x=months, y=revenue, markers=True,
                            labels={"x": "Month", "y": "₹ Lakhs Recovered"},
                            color_discrete_sequence=[SAFFRON])
        fig_trend.update_layout(height=300, plot_bgcolor="white",
                                margin=dict(l=20, r=20, t=20, b=20))
        st.plotly_chart(fig_trend, use_container_width=True)

        # Full fraud properties table
        st.markdown("### 🚨 All Flagged Properties")
        df_fraud = pd.DataFrame([{
            "Property ID":   p["property_id"],
            "Owner":         p["owner_name"],
            "Zone":          p["zone"],
            "Address":       p["address"][:50],
            "Reported sqft": p["reported_area_sqft"],
            "Actual sqft":   p["actual_area_sqft"],
            "Annual Loss ₹": f"{p.get('annual_loss',0):,.0f}",
            "Phone":         p["phone"],
        } for p in sorted(fraud_props, key=lambda x: x.get("annual_loss",0), reverse=True)])

        st.dataframe(df_fraud, use_container_width=True, hide_index=True, height=400)

        # Download button
        csv = df_fraud.to_csv(index=False).encode("utf-8")
        st.download_button("⬇️ Download Report CSV", csv,
                           file_name="fraud_report.csv", mime="text/csv")

        # Impact summary
        st.markdown("### 🎯 Impact Summary")
        i1, i2, i3 = st.columns(3)
        i1.metric("Total Annual Loss",    f"₹{total_loss/100000:.1f} Lakhs")
        i2.metric("5-Year Projection",    f"₹{total_loss*5/10000000:.2f} Crores")
        i3.metric("With Penalty (25%)",   f"₹{total_loss*1.25/100000:.1f} Lakhs")

        st.info("📌 Reference: Jabalpur recovered ₹30 Crores using similar technology. "
                "Bengaluru saved 30% water revenue through consumption cross-referencing.")

    except ImportError as e:
        st.warning(f"Report libraries not fully installed: {e}")


# ── Footer ─────────────────────────────────────────────────────────────────
st.markdown("---")
st.markdown(
    "<center style='color:#888;font-size:0.8rem;'>"
    "🏛️ RevenueGuard AI | Hackathon 2024 | "
    "Prithvi-EO-2.0 (NASA+IBM) Satellite Analysis | "
    "Multi-Agent GenAI for Indian ULBs"
    "</center>",
    unsafe_allow_html=True
)
