from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, Index, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import enum

Base = declarative_base()


class LeadStatus(str, enum.Enum):
    NEW = "new"
    CONTACTED = "contacted"
    QUALIFIED = "qualified"
    IN_PROGRESS = "in_progress"
    CLOSED = "closed"
    REJECTED = "rejected"


class OutreachChannel(str, enum.Enum):
    WHATSAPP = "whatsapp"
    EMAIL = "email"
    PHONE = "phone"


class OutreachStatus(str, enum.Enum):
    PENDING = "pending"
    SENT = "sent"
    FAILED = "failed"
    OPENED = "opened"
    CLICKED = "clicked"
    REPLIED = "replied"


class EnrichmentJobStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(String(255), nullable=True)
    business_name = Column(String(255), nullable=False, index=True)
    category = Column(String(255), nullable=True, index=True)
    location = Column(String(255), nullable=True, index=True)
    city = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)
    website = Column(String(500), nullable=True)
    phone = Column(String(20), nullable=True, index=True)
    email = Column(String(255), nullable=True, index=True)
    whatsapp = Column(String(20), nullable=True, index=True)
    outreach_message = Column(Text, nullable=True)
    status = Column(
        SQLEnum(LeadStatus), default=LeadStatus.NEW, nullable=False, index=True
    )
    has_website = Column(Boolean, default=False)
    has_email = Column(Boolean, default=False)
    has_phone = Column(Boolean, default=False)
    has_whatsapp = Column(Boolean, default=False)
    duplicate_of_id = Column(Integer, nullable=True)  # Self-reference for duplicates
    is_suppressed = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_contacted_at = Column(DateTime, nullable=True)

    __table_args__ = (
        Index("idx_domain", "website"),
        Index("idx_business_location", "business_name", "location"),
        Index("idx_status_created", "status", "created_at"),
    )


class OutreachEvent(Base):
    __tablename__ = "outreach_events"

    id = Column(Integer, primary_key=True, index=True)
    lead_id = Column(Integer, nullable=False, index=True)
    channel = Column(SQLEnum(OutreachChannel), nullable=False, index=True)
    message_text = Column(Text, nullable=True)
    status = Column(
        SQLEnum(OutreachStatus), default=OutreachStatus.PENDING, nullable=False
    )
    external_message_id = Column(String(500), nullable=True)  # For future integrations
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    sent_at = Column(DateTime, nullable=True)
    received_at = Column(DateTime, nullable=True)

    __table_args__ = (Index("idx_lead_channel", "lead_id", "channel"),)


class EnrichmentJob(Base):
    __tablename__ = "enrichment_jobs"

    id = Column(Integer, primary_key=True, index=True)
    job_name = Column(String(255), nullable=False)
    status = Column(
        SQLEnum(EnrichmentJobStatus),
        default=EnrichmentJobStatus.PENDING,
        nullable=False,
    )
    filters = Column(Text, nullable=True)  # JSON string
    leads_count = Column(Integer, default=0)
    results_count = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)

    __table_args__ = (Index("idx_enrichment_status_created", "status", "created_at"),)


class SuppressionList(Base):
    __tablename__ = "suppression_list"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), nullable=True, unique=True, index=True)
    phone = Column(String(20), nullable=True, unique=True, index=True)
    whatsapp = Column(String(20), nullable=True, unique=True, index=True)
    domain = Column(String(255), nullable=True, unique=True, index=True)
    reason = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
