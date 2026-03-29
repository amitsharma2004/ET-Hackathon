"""
RevenueGuard AI - Synthetic Data Generator
Generates realistic Indian municipal data for Pune/Mumbai context
"""
import random
import json
import csv
import os
from datetime import datetime

# ── Seed for reproducibility ───────────────────────────────────────────────
random.seed(42)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ── Indian name pools ──────────────────────────────────────────────────────
FIRST_NAMES = [
    "Rajesh", "Sunil", "Priya", "Anita", "Vijay", "Sneha", "Arun", "Kavita",
    "Mahesh", "Sunita", "Ramesh", "Deepa", "Sanjay", "Pooja", "Amit", "Neha",
    "Prakash", "Rekha", "Ashok", "Meena", "Santosh", "Usha", "Dinesh", "Lata",
    "Suresh", "Savita", "Ganesh", "Nirmala", "Vishnu", "Shanti", "Ravi", "Geeta",
    "Mohan", "Sushma", "Kishore", "Radha", "Narayan", "Pushpa", "Hemant", "Archana"
]
LAST_NAMES = [
    "Sharma", "Patil", "Desai", "Joshi", "Kulkarni", "More", "Shinde", "Pawar",
    "Kadam", "Jadhav", "Bhosale", "Chavan", "Gaikwad", "Salve", "Mane", "Yadav",
    "Gupta", "Verma", "Singh", "Mishra", "Pandey", "Tiwari", "Dubey", "Srivastava",
    "Mehta", "Shah", "Patel", "Gandhi", "Trivedi", "Parikh", "Iyer", "Nair"
]
STREET_NAMES = [
    "Laxmi Nagar", "Ganesh Nagar", "Shivaji Nagar", "Ram Nagar", "Indira Nagar",
    "Nehru Road", "MG Road", "Patel Marg", "Tilak Chowk", "Balgandharva Road",
    "Sahakar Nagar", "Karve Road", "FC Road", "JM Road", "Pune-Satara Road",
    "Kothrud", "Baner Road", "Aundh", "Hadapsar", "Wakad",
    "Viman Nagar", "Kharadi", "Magarpatta", "Hinjewadi", "Pimple Saudagar"
]
CITY_AREAS = ["Pune", "Pimpri", "Chinchwad", "Hadapsar", "Kothrud", "Baner", "Aundh", "Wakad"]
ZONES = ["Zone-A", "Zone-B", "Zone-C"]
CATEGORIES = ["Residential", "Commercial"]

BUSINESS_NAMES = [
    "Shree Ganesh Traders", "Om Sai Enterprises", "Mahalaxmi Stores", "Balaji Textiles",
    "Sai Baba Electronics", "New India Hardware", "Durga Agencies", "Hanuman Medicals",
    "Krishna Auto Parts", "Radhe Radhe Furniture", "Shankar Steel", "Parvati Plastics",
    "Narayan Chemicals", "Vitthal Constructions", "Samarth Logistics", "Mangal Caterers",
    "Jai Bhavani Tours", "Dnyaneshwar Publishers", "Tukaram Dairy", "Sopan Engineering"
]


def random_name():
    return f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"


def random_address():
    num = random.randint(1, 999)
    street = random.choice(STREET_NAMES)
    area = random.choice(CITY_AREAS)
    pin = random.randint(410001, 411060)
    return f"{num}, {street}, {area} - {pin}"


def random_phone():
    prefixes = ["98", "97", "96", "95", "94", "93", "91", "90", "89", "88", "87", "86"]
    return f"+91-{random.choice(prefixes)}{random.randint(10000000, 99999999)}"


def generate_gstin(state_code="27"):
    """Generate fake GSTIN (Maharashtra = 27)"""
    pan_chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    pan = f"{''.join(random.choices(pan_chars, k=5))}{random.randint(1000, 9999)}{''.join(random.choices(pan_chars, k=1))}"
    return f"{state_code}{pan}1Z{random.choice(pan_chars)}"


# ══════════════════════════════════════════════════════════════════════════════
# 1.  PROPERTY DATA  (200 records)
# ══════════════════════════════════════════════════════════════════════════════
def generate_properties(n=200):
    properties = []
    n_fraud = int(n * 0.30)           # 30 % fraud cases

    residential_rate = 2.5            # ₹ per sqft
    commercial_rate  = 8.5            # ₹ per sqft

    for i in range(1, n + 1):
        prop_id   = f"PROP{i:05d}"
        is_fraud  = i <= n_fraud
        zone      = random.choice(ZONES)
        category  = "Residential"     # All declared as residential
        reported  = random.randint(600, 2000)

        if is_fraud:
            # Actual area is 20-50 % larger
            multiplier = 1 + random.uniform(0.20, 0.50)
            actual = int(reported * multiplier)
            # Fraud = commercial activity in residential
            real_category = "Commercial"
        else:
            actual = reported + random.randint(-50, 50)
            actual = max(actual, reported)   # never smaller than reported
            real_category = "Residential"

        declared_category = category   # Always declared Residential

        current_tax = round(reported * residential_rate, 2)
        fair_tax    = round(actual * (commercial_rate if is_fraud else residential_rate), 2)
        annual_loss = round(fair_tax - current_tax, 2)

        properties.append({
            "property_id":        prop_id,
            "owner_name":         random_name(),
            "address":            random_address(),
            "zone":               zone,
            "declared_category":  declared_category,
            "actual_category":    real_category,
            "reported_area_sqft": reported,
            "actual_area_sqft":   actual,
            "tax_amount":         current_tax,
            "annual_loss":        max(annual_loss, 0),
            "phone":              random_phone(),
            "is_fraud":           is_fraud,
        })

    random.shuffle(properties)
    return properties


# ══════════════════════════════════════════════════════════════════════════════
# 2.  ELECTRICITY / WATER CONSUMPTION  (12 months × 200 properties)
# ══════════════════════════════════════════════════════════════════════════════
def generate_consumption(properties):
    consumption = []
    fraud_ids = {p["property_id"] for p in properties if p["is_fraud"]}

    for prop in properties:
        pid      = prop["property_id"]
        is_fraud = pid in fraud_ids
        for month in range(1, 13):
            if is_fraud:
                units  = random.randint(1000, 3000)     # commercial-level
                liters = random.randint(15000, 30000)
            else:
                units  = random.randint(150, 450)        # normal residential
                liters = random.randint(3000, 8000)

            consumption.append({
                "property_id":      pid,
                "month":            month,
                "electricity_units": units,
                "water_liters":     liters,
            })

    return consumption


# ══════════════════════════════════════════════════════════════════════════════
# 3.  GST REGISTRATIONS  (50 records)
# ══════════════════════════════════════════════════════════════════════════════
def generate_gst(properties):
    # Link ~40 fraud properties to GST registrations
    fraud_props = [p for p in properties if p["is_fraud"]][:40]
    gst_records = []

    for i, prop in enumerate(fraud_props):
        has_license = random.random() > 0.40   # 40 % unlicensed
        gst_records.append({
            "gstin":           generate_gstin(),
            "business_name":   random.choice(BUSINESS_NAMES),
            "address":         prop["address"],   # same address as property
            "property_id":     prop["property_id"],
            "has_trade_license": has_license,
            "license_number":  f"TL{random.randint(10000,99999)}" if has_license else None,
        })

    # Add 10 extra GST records not linked to any property
    for _ in range(10):
        gst_records.append({
            "gstin":           generate_gstin(),
            "business_name":   random.choice(BUSINESS_NAMES),
            "address":         random_address(),
            "property_id":     None,
            "has_trade_license": random.choice([True, False]),
            "license_number":  f"TL{random.randint(10000,99999)}",
        })

    return gst_records


# ══════════════════════════════════════════════════════════════════════════════
# SAVE helpers
# ══════════════════════════════════════════════════════════════════════════════
def save_csv(data, filename):
    if not data:
        return
    path = os.path.join(BASE_DIR, filename)
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=data[0].keys())
        writer.writeheader()
        writer.writerows(data)
    print(f"  ✅  Saved {len(data):,} records → {path}")


def save_json(data, filename):
    path = os.path.join(BASE_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"  ✅  Saved {len(data):,} records → {path}")


# ══════════════════════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    print("\n🏙️  RevenueGuard AI — Synthetic Data Generator")
    print("=" * 55)

    print("\n[1/3] Generating property data …")
    props = generate_properties(200)
    save_csv(props, "properties.csv")
    save_json(props, "properties.json")

    print("\n[2/3] Generating consumption data …")
    cons = generate_consumption(props)
    save_csv(cons, "consumption.csv")
    save_json(cons, "consumption.json")

    print("\n[3/3] Generating GST registrations …")
    gst = generate_gst(props)
    save_csv(gst, "gst_registrations.csv")
    save_json(gst, "gst_registrations.json")

    fraud_count = sum(1 for p in props if p["is_fraud"])
    total_loss  = sum(p["annual_loss"] for p in props if p["is_fraud"])
    print(f"\n📊  Summary")
    print(f"   Total properties : {len(props)}")
    print(f"   Fraud cases      : {fraud_count} ({fraud_count/len(props)*100:.0f}%)")
    print(f"   Total annual loss: ₹{total_loss:,.0f}")
    print(f"   5-year projection: ₹{total_loss*5:,.0f}")
    print("\n✅  Data generation complete!\n")
