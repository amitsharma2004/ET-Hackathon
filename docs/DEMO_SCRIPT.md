# RevenueGuard AI — Demo Script

## Setup (before presentation)
```bash
cd revenueguard-ai
pip install -r requirements.txt
python data/generate_data.py
python models/satellite_simulator.py
# Terminal 1: uvicorn backend.main:app --host 0.0.0.0 --port 8000
# Terminal 2: streamlit run frontend/app.py
```

## Step-by-Step Demo Flow

### 1. Open Dashboard (30 sec)
- Open browser → Streamlit URL
- Point out: "Commissioner of Pune view"
- Show KPIs: ~60 fraud cases, ₹XX Lakhs at risk

### 2. Select Zone-B (20 sec)
- Sidebar → "Zone-B"
- Map updates, bar chart shows Zone-B breakdown
- "45 properties in this zone, 13 flagged"

### 3. Navigate to Property Analysis (30 sec)
- Click "🔍 Property Analysis"
- Select PROP00001 (first fraud property)
- Show basic details

### 4. Click "Analyze Property" (45 sec)
- Watch agent log messages animate
- Results appear:
  - PropertyAgent: FLAGGED — "XX% area under-reported, Confidence 9X%"
  - WaterAgent: FLAGGED — "XXXXX L/month (commercial level)"
  - TradeAgent: FLAGGED or clear
  - Correlation score bar fills up
  - Priority badge shows RED / HIGH PRIORITY

### 5. Revenue Impact (20 sec)
- Point to: Annual Loss ₹XX,XXX
- "This is one property — multiply by 60 = ₹X Crores recoverable in Pune"

### 6. Notifications (20 sec)
- Scroll to Marathi notice box
- "Automatically generated in Marathi — zero manual typing"
- Show WhatsApp preview

### 7. Satellite View (30 sec)
- Sidebar → "🛰️ Satellite View"
- Select same property → Load Imagery
- Point to 2020 vs 2024 side-by-side
- "AI detects XX% building expansion — illegal construction confirmed"

### 8. Impact Slide (verbal, 20 sec)
- "Jabalpur recovered ₹30 Crores with similar tech"
- "Bengaluru reduced water revenue leakage by 30%"
- "This system scales to 200 cities × ₹X Crores = ₹XXXX Crores national impact"

## Key Phrases
- "Multi-agent AI — 3 specialized models cross-verify each other"
- "Vernacular-first — Marathi & Hindi built-in"
- "Prithvi-EO-2.0 satellite model pipeline (NASA + IBM)"
- "Zero human bias — fully automated detection"
