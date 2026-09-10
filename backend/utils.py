from urllib.parse import urlparse
import re
import pandas as pd
from typing import List, Dict, Tuple
import schemas
import crud
from sqlalchemy.orm import Session


def extract_domain(url: str) -> str:
    """Extract domain from URL"""
    if not url:
        return None

    # Add scheme if missing
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    try:
        parsed = urlparse(url)
        domain = parsed.netloc or parsed.path
        # Remove www. prefix
        domain = domain.replace("www.", "").split("/")[0]
        return domain
    except:
        return None


def normalize_phone(phone: str) -> str:
    """Normalize phone number to digits only"""
    if not phone:
        return None
    digits = re.sub(r"\D", "", str(phone))
    # Keep last 10 digits minimum
    return digits[-10:] if len(digits) >= 10 else None


def normalize_email(email: str) -> str:
    """Normalize email to lowercase"""
    if not email:
        return None
    return email.lower().strip()


def map_csv_columns(df: pd.DataFrame) -> Dict[str, str]:
    """
    Auto-map CSV columns to lead schema.
    Handles common naming variations.
    """
    columns = {col.lower().strip() for col in df.columns}

    mapping = {}

    # Business name
    for col in df.columns:
        lower = col.lower().strip()
        if any(x in lower for x in ["business", "company", "name"]):
            mapping["business_name"] = col
            break

    # Category/Industry
    for col in df.columns:
        lower = col.lower().strip()
        if any(x in lower for x in ["category", "industry", "type", "sector"]):
            mapping["category"] = col
            break

    # Location
    for col in df.columns:
        lower = col.lower().strip()
        if any(x in lower for x in ["location", "address", "region"]):
            mapping["location"] = col
            break

    # City
    for col in df.columns:
        lower = col.lower().strip()
        if "city" in lower:
            mapping["city"] = col
            break

    # Country
    for col in df.columns:
        lower = col.lower().strip()
        if "country" in lower:
            mapping["country"] = col
            break

    # Website
    for col in df.columns:
        lower = col.lower().strip()
        if any(x in lower for x in ["website", "url", "web"]):
            mapping["website"] = col
            break

    # Phone
    for col in df.columns:
        lower = col.lower().strip()
        if any(x in lower for x in ["phone", "phone1", "telephone"]):
            mapping["phone"] = col
            break

    # Email
    for col in df.columns:
        lower = col.lower().strip()
        if any(x in lower for x in ["email", "email1"]):
            mapping["email"] = col
            break

    # WhatsApp
    for col in df.columns:
        lower = col.lower().strip()
        if "whatsapp" in lower:
            mapping["whatsapp"] = col
            break

    # Source ID
    for col in df.columns:
        lower = col.lower().strip()
        if any(x in lower for x in ["source_id", "id", "sourceid"]):
            mapping["source_id"] = col
            break

    return mapping


def process_csv_import(
    db: Session, file_content: bytes, filename: str
) -> Tuple[int, int, int, List[str], List[int]]:
    """
    Process CSV file and import leads.
    Returns: (imported_count, duplicate_count, error_count, error_details, lead_ids)
    """
    try:
        df = pd.read_csv(file_content)
    except Exception as e:
        return 0, 0, 1, [f"Failed to parse CSV: {str(e)}"], []

    if df.empty:
        return 0, 0, 1, ["CSV file is empty"], []

    # Auto-map columns
    column_mapping = map_csv_columns(df)

    if "business_name" not in column_mapping:
        return 0, 0, 1, ["Could not find business name column"], []

    error_details = []
    imported_count = 0
    duplicate_count = 0
    lead_ids = []

    for idx, row in df.iterrows():
        try:
            lead_data = {}

            # Map columns to lead schema
            for schema_field, csv_column in column_mapping.items():
                value = row.get(csv_column)
                if pd.isna(value):
                    value = None
                else:
                    value = str(value).strip()
                    if not value or value.lower() == "nan":
                        value = None

                lead_data[schema_field] = value

            # Validate required fields
            if not lead_data.get("business_name"):
                error_details.append(f"Row {idx + 1}: Missing business name")
                continue

            # Normalize contact info
            if lead_data.get("phone"):
                lead_data["phone"] = normalize_phone(lead_data["phone"])
            if lead_data.get("email"):
                lead_data["email"] = normalize_email(lead_data["email"])
            if lead_data.get("whatsapp"):
                lead_data["whatsapp"] = normalize_phone(lead_data["whatsapp"])

            # Create lead
            lead = schemas.LeadCreate(**lead_data)

            # Check for duplicates
            duplicate = crud.check_duplicate_lead(db, lead)
            if duplicate:
                duplicate_count += 1
                continue

            # Check suppression list
            if crud.is_suppressed(db, lead):
                error_details.append(
                    f"Row {idx + 1}: Contact info is on suppression list"
                )
                continue

            # Import lead
            result = crud.create_lead(db, lead)
            if result["status"] == "created":
                imported_count += 1
                lead_ids.append(result["lead"].id)
            elif result["status"] == "duplicate":
                duplicate_count += 1

        except Exception as e:
            error_details.append(f"Row {idx + 1}: {str(e)}")

    return imported_count, duplicate_count, len(error_details), error_details, lead_ids


def get_contact_info_summary(lead) -> Dict[str, bool]:
    """Get summary of available contact info for a lead"""
    return {
        "has_website": bool(lead.website),
        "has_email": bool(lead.email),
        "has_phone": bool(lead.phone),
        "has_whatsapp": bool(lead.whatsapp),
    }
