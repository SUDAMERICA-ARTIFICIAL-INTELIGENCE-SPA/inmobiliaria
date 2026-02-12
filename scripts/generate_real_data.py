"""
generate_real_data.py — HomeHarvest Pipeline (500 props)
Scrapes Miami-Dade County properties and outputs clean JSON.
Mock coordinates use LAND-ONLY zones to avoid placing pins in water.
"""

import json
import sys
import os
import random
from pathlib import Path
from homeharvest import scrape_property


# Land-only coordinate zones in Miami-Dade County
# Each zone is (lat_min, lat_max, lon_min, lon_max) — all verified on land
LAND_ZONES = [
    # Downtown Miami / Brickell
    (25.758, 25.780, -80.210, -80.188),
    # Little Havana / Flagler
    (25.760, 25.780, -80.230, -80.210),
    # Wynwood / Design District
    (25.790, 25.810, -80.205, -80.185),
    # Coral Gables
    (25.715, 25.755, -80.290, -80.250),
    # Coconut Grove
    (25.710, 25.735, -80.250, -80.225),
    # Kendall area
    (25.670, 25.700, -80.360, -80.310),
    # Doral
    (25.800, 25.830, -80.370, -80.330),
    # Hialeah
    (25.850, 25.880, -80.310, -80.270),
    # Miami Gardens
    (25.930, 25.960, -80.260, -80.220),
    # Aventura / North Miami Beach
    (25.930, 25.960, -80.160, -80.130),
    # Homestead
    (25.450, 25.490, -80.490, -80.440),
    # Cutler Bay
    (25.560, 25.590, -80.360, -80.330),
    # Palmetto Bay
    (25.620, 25.650, -80.340, -80.310),
    # Pinecrest
    (25.655, 25.680, -80.310, -80.280),
    # Sweetwater / FIU area
    (25.750, 25.770, -80.390, -80.360),
    # Opa-locka
    (25.890, 25.910, -80.270, -80.240),
    # North Miami
    (25.880, 25.910, -80.200, -80.170),
    # Westchester
    (25.730, 25.755, -80.330, -80.300),
    # Tamiami
    (25.740, 25.760, -80.360, -80.330),
    # Olympia Heights
    (25.720, 25.740, -80.360, -80.330),
]


import re

def extract_photo_url(photo):
    """Extract URL string from photo which may be a dict {'href': url} or a string.
    Upgrades rdcpix thumbnail URLs to high resolution (od.jpg).
    """
    url = ""
    if isinstance(photo, dict):
        url = photo.get("href", "")
    elif isinstance(photo, str):
        url = photo
    
    if url:
        # Replace thumbnail suffix patterns (s.jpg, e_*.jpg) with od.jpg (original dimensions)
        url = re.sub(r's\.jpg$', 'od.jpg', url)
        url = re.sub(r'e_\w+\.jpg$', 'od.jpg', url)
    return url


def random_land_coord():
    """Generate a random coordinate guaranteed to be on land in Miami-Dade."""
    zone = random.choice(LAND_ZONES)
    lat = round(random.uniform(zone[0], zone[1]), 6)
    lon = round(random.uniform(zone[2], zone[3]), 6)
    return lat, lon


def harvest(location="Miami-Dade County, FL", listing_type="for_sale", limit=500):
    print(f"\n[*] Scraping '{location}' ({listing_type}) -- Limit: {limit}")

    raw_properties = scrape_property(
        location=location,
        listing_type=listing_type,
        limit=limit,
        sort_by="list_date",
        sort_direction="desc",
        return_type="raw",
        extra_property_data=True,
    )

    print(f"[+] Recibidas: {len(raw_properties)} propiedades crudas")

    cleaned = []
    for prop in raw_properties:
        address = prop.get("address", {}) or {}
        description = prop.get("description", {}) or {}

        raw_photo = prop.get("primary_photo", "")
        primary_photo = extract_photo_url(raw_photo)
        raw_alt = prop.get("alt_photos", []) or []
        alt_photos = [extract_photo_url(p) for p in raw_alt if extract_photo_url(p)]

        street = address.get("street", "")
        city = address.get("city", "")
        state = address.get("state", "")
        zip_code = address.get("zip_code", "")

        record = {
            "id": str(prop.get("property_id", "")),
            "url": prop.get("property_url", ""),
            "status": prop.get("status", ""),
            "price": prop.get("list_price", 0) or 0,
            "beds": description.get("beds", 0) or 0,
            "baths_full": description.get("full_baths", 0) or 0,
            "baths_half": description.get("half_baths", 0) or 0,
            "sqft": description.get("sqft", 0) or 0,
            "year_built": description.get("year_built", None),
            "lot_sqft": description.get("lot_sqft", 0) or 0,
            "style": description.get("style", ""),
            "property_type": description.get("type", ""),
            "description": description.get("text", ""),
            "street": street,
            "unit": address.get("unit", ""),
            "city": city,
            "state": state,
            "zip_code": zip_code,
            "formatted_address": address.get("formatted_address", "")
                or f"{street}, {city}, {state} {zip_code}",
            "latitude": prop.get("latitude", None),
            "longitude": prop.get("longitude", None),
            "primary_photo": primary_photo,
            "photos": alt_photos[:6] if alt_photos else ([primary_photo] if primary_photo else []),
            "agent_name": prop.get("agent_name", ""),
            "agent_phone": prop.get("agent_phone", ""),
            "agent_email": prop.get("agent_email", ""),
            "days_on_mls": prop.get("days_on_mls", 0) or 0,
            "price_per_sqft": prop.get("price_per_sqft", 0) or 0,
            "hoa_fee": prop.get("hoa_fee", 0) or 0,
            "list_date": str(prop.get("list_date", "")) if prop.get("list_date") else "",
            "neighborhoods": prop.get("neighborhoods", ""),
            "stories": description.get("stories", 0) or 0,
            "garage": description.get("garage", 0) or 0,
        }

        # Use LAND-ONLY mock coordinates if real ones are missing
        if not record["latitude"] or not record["longitude"]:
            lat, lon = random_land_coord()
            record["latitude"] = lat
            record["longitude"] = lon

        if record["price"] > 0:
            cleaned.append(record)

    return cleaned


def save_json(data, output_path):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False, default=str)
    print(f"[+] Guardadas: {len(data)} propiedades en {output_path}")


if __name__ == "__main__":
    location = sys.argv[1] if len(sys.argv) > 1 else "Miami-Dade County, FL"
    listing_type = sys.argv[2] if len(sys.argv) > 2 else "for_sale"
    limit = int(sys.argv[3]) if len(sys.argv) > 3 else 500

    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    output_path = project_root / "public" / "data" / "properties.json"

    properties = harvest(location, listing_type, limit)
    save_json(properties, str(output_path))

    if properties:
        prices = [p["price"] for p in properties]
        with_photos = sum(1 for p in properties if p["primary_photo"])
        with_real_coords = sum(1 for p in properties if p.get("latitude") and p.get("longitude"))
        print(f"\n{'='*50}")
        print(f"  Total: {len(properties)} | Fotos: {with_photos}")
        print(f"  Con coordenadas: {with_real_coords}")
        print(f"  Precio Min: US$ {min(prices):,.0f}")
        print(f"  Precio Max: US$ {max(prices):,.0f}")
        print(f"  Precio Avg: US$ {sum(prices)/len(prices):,.0f}")
        print(f"{'='*50}\n")
    else:
        print("[!] No se encontraron propiedades")
