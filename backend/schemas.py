from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime
from typing import Optional, List
from enum import Enum


class LeadStatus(str, Enum):
    NEW = "new"
    CONTACTED = "contacted"
    QUALIFIED = "qualified"
    IN_PROGRESS = "in_progress"
    CLOSED = "closed"
    REJECTED = "rejected"


class OutreachChannel(str, Enum):
    WHATSAPP = "whatsapp"
    EMAIL = "email"
    PHONE = "phone"


class OutreachStatus(str, Enum):
    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"
    OPENED = "opened"
    CLICKED = "clicked"
    REPLIED = "replied"


class LeadCreate(BaseModel):
    business_name: str
    category: Optional[str] = None
    location: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    whatsapp: Optional[str] = None
    outreach_message: Optional[str] = None
    source_id: Optional[str] = None

    @field_validator("phone", "whatsapp")
    @classmethod
    def validate_phone(cls, v):
        if v:
            v = "".join(filter(str.isdigit, v))
            if len(v) < 10:
                raise ValueError("Phone must have at least 10 digits")
        return v


class LeadUpdate(BaseModel):
    business_name: Optional[str] = None
    category: Optional[str] = None
    location: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    whatsapp: Optional[str] = None
    outreach_message: Optional[str] = None
    status: Optional[LeadStatus] = None


class LeadResponse(BaseModel):
    id: int
    business_name: str
    category: Optional[str]
    location: Optional[str]
    city: Optional[str]
    country: Optional[str]
    website: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    whatsapp: Optional[str]
    outreach_message: Optional[str]
    status: str
    has_website: bool
    has_email: bool
    has_phone: bool
    has_whatsapp: bool
    is_suppressed: bool
    created_at: datetime
    updated_at: datetime
    last_contacted_at: Optional[datetime]

    class Config:
        from_attributes = True


class OutreachEventCreate(BaseModel):
    lead_id: int
    channel: OutreachChannel
    message_text: Optional[str] = None
    notes: Optional[str] = None


class OutreachEventResponse(BaseModel):
    id: int
    lead_id: int
    channel: str
    message_text: Optional[str]
    status: str
    external_message_id: Optional[str]
    notes: Optional[str]
    created_at: datetime
    sent_at: Optional[datetime]
    received_at: Optional[datetime]

    class Config:
        from_attributes = True


class CSVImportResponse(BaseModel):
    total_imported: int
    duplicates_found: int
    errors_found: int
    error_details: List[str]
    lead_ids: List[int]


class ExtractionFilters(BaseModel):
    country: Optional[str] = None
    city: Optional[str] = None
    industry: Optional[str] = None
    keywords: Optional[str] = None
    lead_count: int = 100
    needs_website: bool = False
    needs_email: bool = False
    needs_phone: bool = False
    needs_whatsapp: bool = False


class DashboardMetrics(BaseModel):
    total_leads: int
    leads_whatsapp_ready: int
    leads_email_ready: int
    leads_with_website: int
    leads_contacted: int
    recent_activity_count: int  # Last 7 days
