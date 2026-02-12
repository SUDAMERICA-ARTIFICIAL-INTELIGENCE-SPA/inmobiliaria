import json
import sys
import os
import random
from pathlib import Path
from homeharvest import scrape_property


def harvest(location: str = "Miami, FL", listing_type: str = "for_sale", limit: int = 50):
    """
    Scrape properties and return a clean list of dicts.
    Uses return_type="raw" for direct JSON-serializable output.
    """
    print(f"\nHomeHarvest -- Scraping '{location}' ({listing_type})...")
    print(f"   Limit: {limit} properties\n")

    # Scrape using raw return type (list of dicts)
    raw_properties = scrape_property(
        location=location,
        listing_type=listing_type,
        limit=limit,
        sort_by="list_date",
        sort_direction="desc",
        return_type="raw",
        extra_property_data=True,
    )

    print(f"Raw data received: {len(raw_properties)} properties\n")
    if raw_properties:
        print("DEBUG: First raw property keys:", raw_properties[0].keys())
        print("DEBUG: First raw property content:", json.dumps(raw_properties[0], indent=2, default=str))

    # Flatten and normalize each property
    cleaned = []
    for prop in raw_properties:
        address = prop.get("address", {}) or {}
        description = prop.get("description", {}) or {}

        # Extract photos
        primary_photo = prop.get("primary_photo", "")
        alt_photos = prop.get("alt_photos", []) or []

        # Build clean record
        record = {
            "id": prop.get("property_id", ""),
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
            "street": address.get("street", ""),
            "unit": address.get("unit", ""),
            "city": address.get("city", ""),
            "state": address.get("state", ""),
            "zip_code": address.get("zip_code", ""),
            "formatted_address": address.get("formatted_address", "")
                or f"{address.get('street', '')}, {address.get('city', '')}, {address.get('state', '')} {address.get('zip_code', '')}",
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

        if prop.get("list_price"):
             print(f"DEBUG: Price: {record['price']}, Lat: {record['latitude']}, Lon: {record['longitude']}")

        # DEMO MODE: Mock coordinates if missing
        if not record["latitude"] or not record["longitude"]:
            record["latitude"] = 25.70 + (random.random() * 0.15)  # 25.70 - 25.85
            record["longitude"] = -80.30 + (random.random() * 0.15) # -80.30 - -80.15

        if record["price"] > 0:
            cleaned.append(record)
        else:
            print(f"DEBUG: Dropped property {record['id']} - Price: {record['price']}")

    return cleaned


def save_json(data: list, output_path: str):
    """Save data to JSON file, creating directories if needed."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False, default=str)
    print(f"Saved {len(data)} properties to {output_path}")


def print_summary(data: list):
    """Print a quick summary of scraped data."""
    if not data:
        print("No properties found!")
        return

    prices = [p["price"] for p in data if p["price"] > 0]
    avg_price = sum(prices) / len(prices) if prices else 0

    print("\n" + "=" * 50)
    print("HARVEST SUMMARY")
    print("=" * 50)
    print(f"   Total Properties:  {len(data)}")
    print(f"   With Valid Price:  {len(prices)}")
    print(f"   Average Price:     ${avg_price:,.0f}")
    print(f"   Min Price:         ${min(prices):,.0f}" if prices else "")
    print(f"   Max Price:         ${max(prices):,.0f}" if prices else "")
    print(f"   With Photos:       {sum(1 for p in data if p['primary_photo'])}")
    print(f"   With Coordinates:  {sum(1 for p in data if p['latitude'] and p['longitude'])}")
    print("=" * 50 + "\n")


if __name__ == "__main__":
    # Accept optional CLI arguments
    location = sys.argv[1] if len(sys.argv) > 1 else "Miami, FL"
    listing_type = sys.argv[2] if len(sys.argv) > 2 else "for_sale"
    limit = int(sys.argv[3]) if len(sys.argv) > 3 else 50

    # Resolve output path relative to project root
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    output_path = project_root / "public" / "data" / "properties.json"

    # Execute harvest
    properties = harvest(location, listing_type, limit)
    save_json(properties, str(output_path))
    print_summary(properties)
