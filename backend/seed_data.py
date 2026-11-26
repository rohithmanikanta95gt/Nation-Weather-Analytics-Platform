"""
Seed Database with Realistic Demo & Mock Telemetry for Indian Metros.
Distinguishes between REAL API DATA and MOCK/DEMO DATA.
Usage:
    python seed_data.py
"""

import sys
import os
from datetime import datetime, timedelta

# Ensure backend root is on Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database.connection import SessionLocal, init_db
from app.database import models


def seed():
    print("Initializing database tables...")
    init_db()
    db = SessionLocal()

    try:
        # Check if already seeded
        existing_count = db.query(models.WeatherReport).count()
        if existing_count > 0:
            print(f"Database already contains {existing_count} weather reports. Clearing old demo data for clean refresh...")
            db.query(models.WeatherReport).delete()
            db.query(models.WeatherAlert).delete()
            db.query(models.DataSourceStatus).delete()
            db.commit()

        print("Seeding initial Data Source Health records...")
        sources = [
            models.DataSourceStatus(
                source="Open-Meteo",
                status="online",
                endpoint="api.open-meteo.com/v1/forecast",
                latency_ms=42.0,
                records_received=4820,
                last_sync=datetime.utcnow(),
            ),
            models.DataSourceStatus(
                source="OpenWeather",
                status="online",
                endpoint="api.openweathermap.org/data/2.5/weather",
                latency_ms=115.0,
                records_received=2941,
                last_sync=datetime.utcnow() - timedelta(seconds=34),
            ),
            models.DataSourceStatus(
                source="Social Media (NLP)",
                status="streaming",
                endpoint="stream.nwap.gov.in/social/x-telegram-feed",
                latency_ms=180.0,
                records_received=3204,
                last_sync=datetime.utcnow() - timedelta(seconds=10),
            ),
            models.DataSourceStatus(
                source="Citizen Reports",
                status="delayed",
                endpoint="citizen.nwap.gov.in/api/v1/inbound-reports",
                latency_ms=340.0,
                records_received=1521,
                last_sync=datetime.utcnow() - timedelta(minutes=2),
            ),
            models.DataSourceStatus(
                source="IMD",
                status="not_configured",
                endpoint="api.imd.gov.in/v2/telemetry",
                latency_ms=0.0,
                records_received=0,
                last_sync=None,
            ),
        ]
        db.add_all(sources)

        print("Seeding active National Weather & Disaster Alerts...")
        alerts = [
            models.WeatherAlert(
                alert_code="ALT-IN-901",
                event_type="flood",
                severity="severe",
                location="Mumbai Suburban & Thane",
                district="Kurla West",
                state="Maharashtra",
                description="Water levels along Mithi river breached 3.8m warning threshold. Severe waterlogging reported across Kurla, Sion, and Hindmata.",
                source="IMD Doppler & MCGM Sensor Cell",
                advisory_action="Deploy NDRF Battalions 3 & 5, evacuate river bank informal settlements, keep pumping stations operational.",
                affected_population="1.4M residents",
                latitude=19.0760,
                longitude=72.8777,
                issued_at=datetime.utcnow() - timedelta(minutes=4),
                is_active=True,
            ),
            models.WeatherAlert(
                alert_code="ALT-IN-902",
                event_type="rainfall",
                severity="high",
                location="Chennai Coastal & Chengalpattu",
                district="Chennai",
                state="Tamil Nadu",
                description="Intense rain bands moving northwest from Bay of Bengal. Recorded 68mm rainfall within past 3 hours.",
                source="Regional Met Centre Chennai",
                advisory_action="Issue civic travel advisory, monitor Chembarambakkam reservoir release gates.",
                affected_population="850K residents",
                latitude=13.0827,
                longitude=80.2707,
                issued_at=datetime.utcnow() - timedelta(minutes=8),
                is_active=True,
            ),
            models.WeatherAlert(
                alert_code="ALT-IN-903",
                event_type="thunderstorm",
                severity="moderate",
                location="Greater Hyderabad Area",
                district="Gachibowli",
                state="Telangana",
                description="Severe convective cloud formation over Rangareddy & Medchal. Lightning frequency > 40 strikes/min. Wind gusts up to 55 km/h.",
                source="TSDPS & Citizen Alert Bot",
                advisory_action="Advise residents to stay indoors, secure open construction equipment.",
                affected_population="620K residents",
                latitude=17.3850,
                longitude=78.4867,
                issued_at=datetime.utcnow() - timedelta(minutes=12),
                is_active=True,
            ),
            models.WeatherAlert(
                alert_code="ALT-IN-904",
                event_type="flood",
                severity="severe",
                location="Brahmaputra Basin, Guwahati",
                district="Kamrup Metro",
                state="Assam",
                description="Brahmaputra flowing 0.72m above danger level at Pandu ghat. Embankment erosion reported near Anil Nagar.",
                source="Central Water Commission (CWC)",
                advisory_action="SDRF speed boats mobilized, 14 relief shelters activated with emergency drinking water supply.",
                affected_population="320K residents",
                latitude=26.1445,
                longitude=91.7362,
                issued_at=datetime.utcnow() - timedelta(minutes=15),
                is_active=True,
            ),
            models.WeatherAlert(
                alert_code="ALT-IN-905",
                event_type="heatwave",
                severity="high",
                location="Ahmedabad & Gandhinagar Belt",
                district="Ahmedabad",
                state="Gujarat",
                description="Sustained ambient temperatures exceeding 42.5°C with severe thermal stress index. Dry westerly winds from Thar desert.",
                source="IMD Regional Centre",
                advisory_action="Enforce Heat Action Plan Phase-2, cool roofs activation, free hydration stations at transit hubs.",
                affected_population="2.1M residents",
                latitude=23.0225,
                longitude=72.5714,
                issued_at=datetime.utcnow() - timedelta(minutes=22),
                is_active=True,
            ),
            models.WeatherAlert(
                alert_code="ALT-IN-906",
                event_type="fog",
                severity="warning",
                location="IGIA Corridor & Western UP",
                district="New Delhi",
                state="Delhi",
                description="Radiation fog reducing runway visual range (RVR) to under 150m. CAT III ILS flight operations enabled.",
                source="Airport Met Station & Delhi Police",
                advisory_action="Speed limit enforced on Yamuna & Eastern Peripheral Expressways.",
                affected_population="Frequent travelers & transit vehicles",
                latitude=28.6139,
                longitude=77.2090,
                issued_at=datetime.utcnow() - timedelta(minutes=35),
                is_active=True,
            ),
        ]
        db.add_all(alerts)

        print("Seeding Weather Reports across Indian cities (Tagging REAL vs MOCK data)...")
        now = datetime.utcnow()

        sample_reports = [
            # 1. Chennai
            models.WeatherReport(
                source="Citizen Report",
                source_report_id="CIT-TN-9812",
                timestamp=now - timedelta(minutes=18),
                country="India",
                state="Tamil Nadu",
                city="Chennai",
                district="T. Nagar",
                latitude=13.0418,
                longitude=80.2341,
                event_type="rainfall",
                description="Water accumulating over 1.5 feet on Usman Road near flyover. Traffic stalled, stormwater drains overflowing rapidly.",
                temperature=28.0,
                humidity=84.0,
                rainfall=62.0,
                wind_speed=19.0,
                severity="high",
                verification_status="verified",
                verification_score=0.94,
                verification_reason="[MOCK/DEMO DATA] Validated by citizen mobile GPS and regional radar alignment.",
                ai_confidence=0.94,
                duplicate_probability=0.04,
                is_duplicate=False,
            ),
            # 2. Mumbai
            models.WeatherReport(
                source="IMD",
                source_report_id="AWS-MUM-04",
                timestamp=now - timedelta(minutes=25),
                country="India",
                state="Maharashtra",
                city="Mumbai",
                district="Kurla West",
                latitude=19.0726,
                longitude=72.8845,
                event_type="flood",
                description="Severe flood inundation near railway station and LBS Marg. Water levels measured at 65cm by IoT telemetry nodes.",
                temperature=26.5,
                humidity=90.0,
                rainfall=88.0,
                wind_speed=24.0,
                severity="severe",
                verification_status="verified",
                verification_score=0.98,
                verification_reason="[REAL API DATA FORMAT] High-frequency IoT telemetry verified against Doppler AWS.",
                ai_confidence=0.98,
                duplicate_probability=0.08,
                is_duplicate=False,
            ),
            # 3. Hyderabad
            models.WeatherReport(
                source="Social Media",
                source_report_id="X-HYD-4921",
                timestamp=now - timedelta(minutes=32),
                country="India",
                state="Telangana",
                city="Hyderabad",
                district="Gachibowli",
                latitude=17.4401,
                longitude=78.3489,
                event_type="thunderstorm",
                description="Massive lightning strike caught on camera, tree fell across Outer Ring Road service lane near financial district.",
                temperature=27.0,
                humidity=78.0,
                rainfall=24.0,
                wind_speed=48.0,
                severity="moderate",
                verification_status="verified",
                verification_score=0.89,
                verification_reason="[MOCK/DEMO DATA] AI NLP text urgency analysis passed; verified by Cyberabad traffic unit.",
                ai_confidence=0.89,
                duplicate_probability=0.18,
                is_duplicate=False,
            ),
            # 4. Guwahati
            models.WeatherReport(
                source="Citizen Report",
                source_report_id="CIT-AS-4109",
                timestamp=now - timedelta(minutes=39),
                country="India",
                state="Assam",
                city="Guwahati",
                district="Anil Nagar",
                latitude=26.1785,
                longitude=91.7725,
                event_type="flood",
                description="Bharalu river water overflowing into residential lanes. Ground floors submerged up to 3 feet.",
                temperature=25.0,
                humidity=92.0,
                rainfall=72.0,
                wind_speed=12.0,
                severity="severe",
                verification_status="verified",
                verification_score=0.96,
                verification_reason="[MOCK/DEMO DATA] Geofenced polygon matched with Bharalu river vulnerability model.",
                ai_confidence=0.96,
                duplicate_probability=0.12,
                is_duplicate=False,
            ),
            # 5. Ahmedabad
            models.WeatherReport(
                source="OpenWeather",
                source_report_id="OWM-AHM-192",
                timestamp=now - timedelta(minutes=46),
                country="India",
                state="Gujarat",
                city="Ahmedabad",
                district="Maninagar",
                latitude=22.9982,
                longitude=72.6021,
                event_type="heatwave",
                description="Ambient surface temperature hit 43.1°C with UV index 10. Severe thermal anomaly observed.",
                temperature=43.1,
                humidity=34.0,
                rainfall=0.0,
                wind_speed=14.0,
                severity="high",
                verification_status="verified",
                verification_score=0.93,
                verification_reason="[REAL API DATA FORMAT] Verified against OpenWeather telemetry stream.",
                ai_confidence=0.93,
                duplicate_probability=0.02,
                is_duplicate=False,
            ),
            # 6. Jaipur
            models.WeatherReport(
                source="Social Media",
                source_report_id="TG-JAI-801",
                timestamp=now - timedelta(hours=1, minutes=5),
                country="India",
                state="Rajasthan",
                city="Jaipur",
                district="Mansarovar",
                latitude=26.8524,
                longitude=75.7618,
                event_type="dust_storm",
                description="Blinding dust storm covering skies in south Jaipur. High winds rattling windows and rooftop tin sheets.",
                temperature=37.0,
                humidity=28.0,
                rainfall=0.0,
                wind_speed=54.0,
                severity="moderate",
                verification_status="suspicious",
                verification_score=0.62,
                verification_reason="[MOCK/DEMO DATA] Flagged as Suspicious due to image metadata discrepancy with past 2024 archive.",
                ai_confidence=0.62,
                duplicate_probability=0.71,
                is_duplicate=False,
            ),
            # 7. Kochi
            models.WeatherReport(
                source="Citizen Report",
                source_report_id="WA-KOC-114",
                timestamp=now - timedelta(hours=1, minutes=20),
                country="India",
                state="Kerala",
                city="Kochi",
                district="Fort Kochi",
                latitude=9.9658,
                longitude=76.2421,
                event_type="strong_wind",
                description="Gale force winds up to 60km/h causing fishing boats to drift. Waves splashing across promenade seawall.",
                temperature=28.0,
                humidity=89.0,
                rainfall=28.0,
                wind_speed=64.0,
                severity="high",
                verification_status="unverified",
                verification_score=0.78,
                verification_reason="[MOCK/DEMO DATA] Placed in queue awaiting Coast Guard coastal radar confirmation.",
                ai_confidence=0.78,
                duplicate_probability=0.15,
                is_duplicate=False,
            ),
            # 8. Delhi
            models.WeatherReport(
                source="Public Dataset",
                source_report_id="CPCB-DEL-908",
                timestamp=now - timedelta(hours=1, minutes=40),
                country="India",
                state="Delhi",
                city="Delhi",
                district="Palam / Airport",
                latitude=28.5665,
                longitude=77.1031,
                event_type="fog",
                description="Localized radiation fog pocket formed near southern ridge and airport basin. Visibility down to 250m.",
                temperature=21.0,
                humidity=92.0,
                rainfall=0.0,
                wind_speed=4.0,
                severity="moderate",
                verification_status="verified",
                verification_score=0.95,
                verification_reason="[REAL API DATA FORMAT] Verified via CPCB & Safar Open Data Portal.",
                ai_confidence=0.95,
                duplicate_probability=0.06,
                is_duplicate=False,
            ),
            # 9. Bengaluru
            models.WeatherReport(
                source="Citizen Report",
                source_report_id="CIT-KA-10294",
                timestamp=now - timedelta(hours=2, minutes=10),
                country="India",
                state="Karnataka",
                city="Bengaluru",
                district="Bellandur & Ecospace",
                latitude=12.9260,
                longitude=77.6762,
                event_type="flood",
                description="Outer Ring Road service lane near Ecospace tech park inundated with 2 feet of water. Vehicles stranded.",
                temperature=23.0,
                humidity=76.0,
                rainfall=45.0,
                wind_speed=14.0,
                severity="high",
                verification_status="verified",
                verification_score=0.91,
                verification_reason="[MOCK/DEMO DATA] Matched with BBMP stormwater vulnerability map and verified by traffic cell.",
                ai_confidence=0.91,
                duplicate_probability=0.25,
                is_duplicate=False,
            ),
            # 10. Kolkata
            models.WeatherReport(
                source="Open-Meteo",
                source_report_id="OM-KOL-819",
                timestamp=now - timedelta(hours=2, minutes=35),
                country="India",
                state="West Bengal",
                city="Kolkata",
                district="Salt Lake Sector V",
                latitude=22.5804,
                longitude=88.4378,
                event_type="rainfall",
                description="Continuous downpour recorded 34mm in last 60 minutes. Sluice gates opened along Kestopur canal.",
                temperature=29.0,
                humidity=82.0,
                rainfall=34.0,
                wind_speed=16.0,
                severity="moderate",
                verification_status="verified",
                verification_score=0.97,
                verification_reason="[REAL API DATA FORMAT] Corroborated with Open-Meteo radar precipitation index.",
                ai_confidence=0.97,
                duplicate_probability=0.03,
                is_duplicate=False,
            ),
            # 11. Duplicate Example (Jaipur)
            models.WeatherReport(
                source="Citizen Report",
                source_report_id="CIT-JAI-902",
                timestamp=now - timedelta(hours=1, minutes=2),
                country="India",
                state="Rajasthan",
                city="Jaipur",
                district="Mansarovar",
                latitude=26.8520,
                longitude=75.7620,
                event_type="dust_storm",
                description="Severe dust storm in south Jaipur Mansarovar with strong winds rattling roofs.",
                temperature=37.0,
                humidity=28.0,
                rainfall=0.0,
                wind_speed=52.0,
                severity="moderate",
                verification_status="duplicate",
                verification_score=0.20,
                verification_reason="[MOCK/DEMO DATA] Duplicate cluster detected (>85% text and geospatial similarity).",
                ai_confidence=0.84,
                duplicate_probability=0.88,
                is_duplicate=True,
                duplicate_of_id=6,
            ),
            # 12. Rejected Disinformation Example (Patna)
            models.WeatherReport(
                source="Citizen Report",
                source_report_id="CIT-BR-9031",
                timestamp=now - timedelta(hours=3, minutes=15),
                country="India",
                state="Bihar",
                city="Patna",
                district="Kankarbagh",
                latitude=25.5941,
                longitude=85.1376,
                event_type="rainfall",
                description="Claimed massive tsunami in Ganga river. Attached video found to be from historical 2011 tsunami archive.",
                temperature=32.0,
                humidity=55.0,
                rainfall=2.0,
                wind_speed=8.0,
                severity="low",
                verification_status="rejected",
                verification_score=0.12,
                verification_reason="[MOCK/DEMO DATA] Rejected by AI reverse image search; identified as malicious clickbait.",
                ai_confidence=0.34,
                duplicate_probability=0.02,
                is_duplicate=False,
            ),
        ]

        db.add_all(sample_reports)
        db.commit()

        print(f"Successfully seeded:")
        print(f"  - {len(sources)} Data Source records")
        print(f"  - {len(alerts)} Active Disaster Alerts")
        print(f"  - {len(sample_reports)} Weather Reports across Indian cities")
        print("Done!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
