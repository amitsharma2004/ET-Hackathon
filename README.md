# ET-Hackathon — RevenueGuard AI 🏛️

> Municipal Revenue Protection System powered by Multi-Agent GenAI

## Overview
RevenueGuard AI helps Indian cities (ULBs) detect property tax fraud through:
- **Multi-agent AI analysis** (Property, Water, Trade License agents)
- **Satellite image change detection** (Prithvi-EO-2.0 pipeline)
- **Real-time React dashboard** with vernacular support (EN / हिंदी / मराठी)
- **Automated alerts** for field officers (WhatsApp + Email + Print)

## Tech Stack
| Layer | Tech |
|-------|------|
| Backend | FastAPI (Python) |
| Frontend | React 18 + Vite + Tailwind CSS |
| AI Agents | Custom Python classes (CrewManager) |
| Data | Synthetic — Faker (Indian locale) |
| Visualization | Recharts, Leaflet |
| Satellite | PIL/Pillow simulated imagery |

## Project Structure
```
revenueguard-ai/
├── backend/          # FastAPI server + AI agents
│   ├── main.py
│   └── agents/       # PropertyAgent, WaterAgent, TradeAgent, CrewManager
├── frontend-react/   # React + Vite dashboard
│   └── src/
│       ├── pages/    # Dashboard, PropertyAnalysis, SatelliteView, Reports
│       └── components/
├── data/             # Synthetic data generator
├── models/           # Satellite image simulator
└── docs/             # Demo script, architecture notes
```

## Quick Start
```bash
# Install dependencies
pip install -r requirements.txt
cd frontend-react && npm install

# Generate synthetic data
python data/generate_data.py
python models/satellite_simulator.py

# Start backend
uvicorn backend.main:app --host 0.0.0.0 --port 8000

# Start frontend
cd frontend-react && npm run dev
```

## Demo Scenario
1. Open dashboard → Select **Zone-B**
2. Go to **Property Analysis** → Select any flagged property
3. Click **Analyze Property** → Watch 4-step agent execution
4. View agent findings, correlation score, revenue breakdown
5. See **Satellite View** → 2020 vs 2024 building expansion
6. Auto-generate **Marathi notice** + **WhatsApp alert**

## Impact
- Reference: **Jabalpur recovered ₹30 Crores** using similar technology
- **Bengaluru** reduced water revenue leakage by **30%**
- Scales to **200+ Indian cities**

## Team
ET Hackathon 2024 — Mumbai
