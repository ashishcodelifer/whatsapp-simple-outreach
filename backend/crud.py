from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from datetime import datetime, timedelta
import models
import schemas
from utils import extract_domain


def get_lead(db: Session, lead_id: int):
    return db.query(models.Lead).filter(models.Lead.id == lead_id).first()


def get_leads(
    db: Session,
    skip: int = 0,
    limit: int = 50,
    search: str = None,
    status: str = None,
    country: str = None,
    city: str = None,
    category: str = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
):
    query = db.query(models.Lead).filter(models.Lead.is_suppressed == False)

    if search:
        search = f"%{search}%"
        query = query.filter(
            or_(
                models.Lead.business_name.ilike(search),
                models.Lead.email.ilike(search),
                models.Lead.phone.ilike(search),
                models.Lead.website.ilike(search),
                models.Lead.location.ilike(search),
            )
        )

    if status:
        query = query.filter(models.Lead.status == status)

    if country:
        query = query.filter(models.Lead.country.ilike(f"%{country}%"))

    if city:
        query = query.filter(models.Lead.city.ilike(f"%{city}%"))

    if category:
        query = query.filter(models.Lead.category.ilike(f"%{category}%"))

    # Sorting
    sort_column = getattr(models.Lead, sort_by, models.Lead.created_at)
    if sort_order.lower() == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    total = query.count()
    leads = query.offset(skip).limit(limit).all()

    return {"items": leads, "total": total, "skip": skip, "limit": limit}


def create_lead(db: Session, lead: schemas.LeadCreate):
    # Check for duplicates
    duplicate_lead = check_duplicate_lead(db, lead)
    if duplicate_lead:
        return {"status": "duplicate", "duplicate_id": duplicate_lead.id}

    # Determine flags
    has_website = bool(lead.website)
    has_email = bool(lead.email)
    has_phone = bool(lead.phone)
    has_whatsapp = bool(lead.whatsapp)

    db_lead = models.Lead(
        business_name=lead.business_name,
        category=lead.category,
        location=lead.location,
        city=lead.city,
        country=lead.country,
        website=lead.website,
        phone=lead.phone,
        email=lead.email,
        whatsapp=lead.whatsapp,
        outreach_message=lead.outreach_message,
        source_id=lead.source_id,
        has_website=has_website,
        has_email=has_email,
        has_phone=has_phone,
        has_whatsapp=has_whatsapp,
    )
    db.add(db_lead)
    db.commit()
    db.refresh(db_lead)
    return {"status": "created", "lead": db_lead}


def update_lead(db: Session, lead_id: int, lead_update: schemas.LeadUpdate):
    db_lead = get_lead(db, lead_id)
    if not db_lead:
        return None

    update_data = lead_update.model_dump(exclude_unset=True)

    # Update flags
    if "website" in update_data:
        update_data["has_website"] = bool(update_data["website"])
    if "email" in update_data:
        update_data["has_email"] = bool(update_data["email"])
    if "phone" in update_data:
        update_data["has_phone"] = bool(update_data["phone"])
    if "whatsapp" in update_data:
        update_data["has_whatsapp"] = bool(update_data["whatsapp"])

    for key, value in update_data.items():
        setattr(db_lead, key, value)

    db_lead.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_lead)
    return db_lead


def delete_lead(db: Session, lead_id: int):
    db_lead = get_lead(db, lead_id)
    if not db_lead:
        return None
    db.delete(db_lead)
    db.commit()
    return db_lead


def delete_all_leads(db: Session):
    try:
        count = db.query(models.Lead).delete()
        db.commit()
        return count
    except Exception:
        db.rollback()
        raise


def check_duplicate_lead(db: Session, lead: schemas.LeadCreate):
    """Check for duplicate leads using multiple criteria"""

    conditions = []

    # Check by source_id if provided
    if lead.source_id:
        conditions.append(models.Lead.source_id == lead.source_id)

    # Check by domain
    if lead.website:
        domain = extract_domain(lead.website)
        if domain:
            conditions.append(models.Lead.website.ilike(f"%{domain}%"))

    # Check by phone
    if lead.phone:
        conditions.append(models.Lead.phone == lead.phone)

    # Check by business name + location
    if lead.business_name and lead.location:
        conditions.append(
            and_(
                models.Lead.business_name.ilike(lead.business_name),
                models.Lead.location.ilike(lead.location),
            )
        )

    if conditions:
        return db.query(models.Lead).filter(or_(*conditions)).first()

    return None


def create_outreach_event(db: Session, event: schemas.OutreachEventCreate):
    db_event = models.OutreachEvent(
        lead_id=event.lead_id,
        channel=event.channel,
        message_text=event.message_text,
        notes=event.notes,
    )
    db.add(db_event)

    # Update lead's last_contacted_at
    lead = get_lead(db, event.lead_id)
    if lead:
        lead.last_contacted_at = datetime.utcnow()
        if lead.status == models.LeadStatus.NEW:
            lead.status = models.LeadStatus.CONTACTED

    db.commit()
    db.refresh(db_event)
    return db_event


def get_outreach_events(db: Session, lead_id: int):
    return (
        db.query(models.OutreachEvent)
        .filter(models.OutreachEvent.lead_id == lead_id)
        .order_by(models.OutreachEvent.created_at.desc())
        .all()
    )


def get_dashboard_metrics(db: Session):
    total_leads = db.query(func.count(models.Lead.id)).scalar()
    leads_with_whatsapp = db.query(func.count(models.Lead.id)).filter(
        models.Lead.has_whatsapp == True
    ).scalar()
    leads_with_email = db.query(func.count(models.Lead.id)).filter(
        models.Lead.has_email == True
    ).scalar()
    leads_with_website = db.query(func.count(models.Lead.id)).filter(
        models.Lead.has_website == True
    ).scalar()
    leads_contacted = db.query(func.count(models.Lead.id)).filter(
        models.Lead.status != models.LeadStatus.NEW
    ).scalar()

    # Recent activity (last 7 days)
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    recent_activity = db.query(func.count(models.Lead.id)).filter(
        models.Lead.created_at >= seven_days_ago
    ).scalar()

    return schemas.DashboardMetrics(
        total_leads=total_leads,
        leads_whatsapp_ready=leads_with_whatsapp,
        leads_email_ready=leads_with_email,
        leads_with_website=leads_with_website,
        leads_contacted=leads_contacted,
        recent_activity_count=recent_activity,
    )


def add_to_suppression_list(
    db: Session, email: str = None, phone: str = None, whatsapp: str = None,
    domain: str = None, reason: str = None
):
    """Add contacts to suppression list"""
    entry = models.SuppressionList(
        email=email,
        phone=phone,
        whatsapp=whatsapp,
        domain=domain,
        reason=reason,
    )
    db.add(entry)
    db.commit()
    return entry


def is_suppressed(db: Session, lead: schemas.LeadCreate):
    """Check if a lead's contact info is suppressed"""
    conditions = []

    if lead.email:
        conditions.append(models.SuppressionList.email == lead.email)
    if lead.phone:
        conditions.append(models.SuppressionList.phone == lead.phone)
    if lead.whatsapp:
        conditions.append(models.SuppressionList.whatsapp == lead.whatsapp)
    if lead.website:
        domain = extract_domain(lead.website)
        if domain:
            conditions.append(models.SuppressionList.domain == domain)

    if conditions:
        return db.query(models.SuppressionList).filter(or_(*conditions)).first()

    return None
