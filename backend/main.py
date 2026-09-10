from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from io import BytesIO
import os
from datetime import datetime

import models
import schemas
import crud
from database import get_db, init_db
from utils import process_csv_import

app = FastAPI(
    title="Lead Generation & WhatsApp Outreach Dashboard",
    description="Phase 1: Lead Management and Extraction",
    version="1.0.0",
)

# CORS Configuration
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:8000,http://frontend:3000",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Constants
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()


# Health check endpoint
@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
    }


# Dashboard endpoints
@app.get("/api/dashboard/metrics", response_model=schemas.DashboardMetrics)
async def get_dashboard_metrics(db: Session = Depends(get_db)):
    """Get dashboard metrics"""
    return crud.get_dashboard_metrics(db)


# Leads endpoints
@app.get("/api/leads", response_model=dict)
async def list_leads(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    search: Optional[str] = None,
    status: Optional[str] = None,
    country: Optional[str] = None,
    city: Optional[str] = None,
    category: Optional[str] = None,
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    db: Session = Depends(get_db),
):
    """
    List leads with filtering, searching, and sorting.

    Query parameters:
    - skip: Number of records to skip (pagination)
    - limit: Number of records to return
    - search: Search in business name, email, phone, website, location
    - status: Filter by lead status
    - country: Filter by country
    - city: Filter by city
    - category: Filter by category/industry
    - sort_by: Column to sort by (created_at, business_name, etc.)
    - sort_order: asc or desc
    """
    result = crud.get_leads(
        db,
        skip=skip,
        limit=limit,
        search=search,
        status=status,
        country=country,
        city=city,
        category=category,
        sort_by=sort_by,
        sort_order=sort_order,
    )

    # Convert to response models
    leads_response = [schemas.LeadResponse.model_validate(lead) for lead in result["items"]]

    return {
        "items": leads_response,
        "total": result["total"],
        "skip": result["skip"],
        "limit": result["limit"],
    }


@app.post("/api/leads", response_model=schemas.LeadResponse)
async def create_lead(lead: schemas.LeadCreate, db: Session = Depends(get_db)):
    """Create a new lead"""
    result = crud.create_lead(db, lead)

    if result["status"] == "duplicate":
        raise HTTPException(
            status_code=409,
            detail=f"Duplicate lead detected (ID: {result['duplicate_id']})",
        )

    return schemas.LeadResponse.model_validate(result["lead"])


@app.get("/api/leads/{lead_id}", response_model=schemas.LeadResponse)
async def get_lead(lead_id: int, db: Session = Depends(get_db)):
    """Get a specific lead"""
    lead = crud.get_lead(db, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return schemas.LeadResponse.model_validate(lead)


@app.put("/api/leads/{lead_id}", response_model=schemas.LeadResponse)
async def update_lead(
    lead_id: int, lead_update: schemas.LeadUpdate, db: Session = Depends(get_db)
):
    """Update a lead"""
    updated_lead = crud.update_lead(db, lead_id, lead_update)
    if not updated_lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return schemas.LeadResponse.model_validate(updated_lead)


@app.delete("/api/leads/{lead_id}")
async def delete_lead(lead_id: int, db: Session = Depends(get_db)):
    """Delete a lead"""
    deleted_lead = crud.delete_lead(db, lead_id)
    if not deleted_lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"status": "success", "message": "Lead deleted"}


# Outreach endpoints
@app.post("/api/outreach", response_model=schemas.OutreachEventResponse)
async def create_outreach_event(
    event: schemas.OutreachEventCreate, db: Session = Depends(get_db)
):
    """
    Create an outreach event (log WhatsApp/Email/Phone contact).
    This is for logging only - actual sending is Phase 4.
    """
    # Verify lead exists
    lead = crud.get_lead(db, event.lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    return schemas.OutreachEventResponse.model_validate(
        crud.create_outreach_event(db, event)
    )


@app.get("/api/leads/{lead_id}/outreach")
async def get_lead_outreach_history(lead_id: int, db: Session = Depends(get_db)):
    """Get outreach history for a lead"""
    lead = crud.get_lead(db, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    events = crud.get_outreach_events(db, lead_id)
    return [schemas.OutreachEventResponse.model_validate(event) for event in events]


# CSV Import endpoint
@app.post("/api/import/csv", response_model=schemas.CSVImportResponse)
async def import_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Import leads from CSV file.

    Supported columns (auto-mapped):
    - business_name (required), company, name
    - category, industry, type, sector
    - location, address, region
    - city, country
    - website, url
    - phone, telephone
    - email
    - whatsapp
    - source_id, id

    Features:
    - Automatic column mapping
    - Duplicate detection by source_id, domain, phone, business+location
    - Suppression list checking
    - Data normalization
    - Error reporting per row
    """

    # Validate file size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Max size: {MAX_FILE_SIZE / 1024 / 1024}MB",
        )

    # Validate file type
    if not file.filename.endswith((".csv", ".xlsx")):
        raise HTTPException(status_code=400, detail="Only CSV and XLSX files are supported")

    # Process import
    imported, duplicates, errors, error_details, lead_ids = process_csv_import(
        db, BytesIO(contents), file.filename
    )

    return schemas.CSVImportResponse(
        total_imported=imported,
        duplicates_found=duplicates,
        errors_found=errors,
        error_details=error_details,
        lead_ids=lead_ids,
    )


# Extraction filters endpoint (Phase 2 - planning only)
@app.post("/api/extraction/start", response_model=dict)
async def start_extraction(filters: schemas.ExtractionFilters, db: Session = Depends(get_db)):
    """
    Queue an extraction job (Phase 2).
    Currently, this only creates a record. Actual extraction will be in Phase 2.

    Parameters:
    - country: Country to extract from
    - city: City/Region to extract from
    - industry: Industry/Category keywords
    - keywords: Additional search keywords
    - lead_count: Desired number of leads
    - needs_website: Filter for leads with websites
    - needs_email: Filter for leads with emails
    - needs_phone: Filter for leads with phone numbers
    - needs_whatsapp: Filter for leads with WhatsApp
    """
    # Validate filters
    if not filters.country and not filters.city and not filters.industry:
        raise HTTPException(
            status_code=400,
            detail="At least one of country, city, or industry is required",
        )

    if filters.lead_count <= 0 or filters.lead_count > 50000:
        raise HTTPException(
            status_code=400,
            detail="Lead count must be between 1 and 50000",
        )

    # Create enrichment job record
    import json
    
    job = models.EnrichmentJob(
        job_name=f"Extraction-{datetime.utcnow().isoformat()}",
        status=models.EnrichmentJobStatus.PENDING,
        filters=json.dumps(filters.model_dump()),
        leads_count=0,
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    return {
        "status": "pending",
        "job_id": job.id,
        "message": "Extraction job queued (Phase 2: Implement actual extraction)",
    }


@app.get("/api/extraction/job/{job_id}")
async def get_extraction_job(job_id: int, db: Session = Depends(get_db)):
    """Get extraction job status"""
    job = db.query(models.EnrichmentJob).filter(models.EnrichmentJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return {
        "id": job.id,
        "name": job.job_name,
        "status": job.status.value,
        "leads_count": job.leads_count,
        "results_count": job.results_count,
        "error_message": job.error_message,
        "created_at": job.created_at.isoformat(),
        "started_at": job.started_at.isoformat() if job.started_at else None,
        "completed_at": job.completed_at.isoformat() if job.completed_at else None,
    }


# Suppression List endpoints
@app.post("/api/suppression")
async def add_to_suppression(
    email: Optional[str] = None,
    phone: Optional[str] = None,
    whatsapp: Optional[str] = None,
    domain: Optional[str] = None,
    reason: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Add contact info to suppression list"""
    if not any([email, phone, whatsapp, domain]):
        raise HTTPException(
            status_code=400,
            detail="At least one contact method is required",
        )

    crud.add_to_suppression_list(db, email, phone, whatsapp, domain, reason)
    return {"status": "added", "message": "Contact added to suppression list"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
