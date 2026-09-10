#!/usr/bin/env python
"""
Test suite for Lead Generation API
Run: python test_api.py
"""

import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import schemas
import crud
import models
from utils import extract_domain, normalize_phone, normalize_email, map_csv_columns
import pandas as pd
from io import StringIO

# Use SQLite for testing
DATABASE_URL = "sqlite:///:memory:"  # In-memory SQLite for tests
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
models.Base.metadata.create_all(bind=engine)

def init_db():
    models.Base.metadata.create_all(bind=engine)

def drop_db():
    models.Base.metadata.drop_all(bind=engine)

def test_database_init():
    """Test database initialization"""
    print("Testing database initialization...")
    try:
        drop_db()
        init_db()
        print("✓ Database initialized successfully")
        return True
    except Exception as e:
        print(f"✗ Database init failed: {e}")
        return False


def test_create_lead():
    """Test lead creation"""
    print("\nTesting lead creation...")
    try:
        db = SessionLocal()
        
        lead_data = schemas.LeadCreate(
            business_name="Test Company",
            category="IT",
            location="Mumbai",
            city="Mumbai",
            country="India",
            website="https://testcompany.com",
            phone="9876543210",
            email="hello@testcompany.com",
            whatsapp="9876543210",
        )
        
        result = crud.create_lead(db, lead_data)
        
        if result["status"] == "created":
            print(f"✓ Lead created: ID {result['lead'].id}")
            return True, result["lead"].id
        else:
            print(f"✗ Lead creation failed: {result}")
            return False, None
    except Exception as e:
        print(f"✗ Create lead failed: {e}")
        return False, None
    finally:
        db.close()


def test_duplicate_detection():
    """Test duplicate detection"""
    print("\nTesting duplicate detection...")
    try:
        db = SessionLocal()
        
        # Create first lead
        lead1 = schemas.LeadCreate(
            business_name="Duplicate Test Co",
            website="https://duplicate-test.com",
            email="test@duplicate.com",
        )
        crud.create_lead(db, lead1)
        
        # Try to create duplicate by domain
        lead2 = schemas.LeadCreate(
            business_name="Duplicate Test Co",
            website="https://www.duplicate-test.com",  # Same domain
        )
        result = crud.create_lead(db, lead2)
        
        if result["status"] == "duplicate":
            print(f"✓ Duplicate detected correctly (ID: {result['duplicate_id']})")
            return True
        else:
            print("✗ Duplicate detection failed")
            return False
    except Exception as e:
        print(f"✗ Duplicate detection test failed: {e}")
        return False
    finally:
        db.close()


def test_search_and_filter():
    """Test lead search and filtering"""
    print("\nTesting search and filtering...")
    try:
        db = SessionLocal()
        
        # Create test leads
        leads_to_create = [
            schemas.LeadCreate(
                business_name="Tech Solutions India",
                category="IT",
                country="India",
                email="tech@solutions.com",
            ),
            schemas.LeadCreate(
                business_name="Digital Marketing USA",
                category="Marketing",
                country="USA",
                phone="1234567890",
            ),
        ]
        
        for lead in leads_to_create:
            crud.create_lead(db, lead)
        
        # Test search
        results = crud.get_leads(db, search="Tech")
        if len(results["items"]) > 0:
            print(f"✓ Search found {len(results['items'])} results")
        else:
            print("✗ Search failed")
            return False
        
        # Test filter by country
        results = crud.get_leads(db, country="India")
        if len(results["items"]) > 0:
            print(f"✓ Country filter found {len(results['items'])} results")
        else:
            print("✗ Country filter failed")
            return False
        
        # Test filter by category
        results = crud.get_leads(db, category="Marketing")
        if len(results["items"]) > 0:
            print(f"✓ Category filter found {len(results['items'])} results")
        else:
            print("✗ Category filter failed")
            return False
        
        return True
    except Exception as e:
        print(f"✗ Search/filter test failed: {e}")
        return False
    finally:
        db.close()


def test_utils():
    """Test utility functions"""
    print("\nTesting utility functions...")
    
    try:
        # Test extract_domain
        domain = extract_domain("https://www.example.com/path")
        assert domain == "example.com", f"Expected example.com, got {domain}"
        print("✓ extract_domain works")
        
        # Test normalize_phone
        phone = normalize_phone("+1 (234) 567-8901")
        assert phone == "2345678901", f"Expected 2345678901, got {phone}"
        print("✓ normalize_phone works")
        
        # Test normalize_email
        email = normalize_email("  TEST@EXAMPLE.COM  ")
        assert email == "test@example.com", f"Expected test@example.com, got {email}"
        print("✓ normalize_email works")
        
        return True
    except AssertionError as e:
        print(f"✗ Utility test failed: {e}")
        return False
    except Exception as e:
        print(f"✗ Utility test error: {e}")
        return False


def test_csv_column_mapping():
    """Test CSV column auto-mapping"""
    print("\nTesting CSV column mapping...")
    
    try:
        csv_content = """
Company Name,Business Category,Region,Email Address,Phone Number,Website URL
Acme Corp,IT,Mumbai,hello@acme.com,9876543210,acme.com
Tech Inc,Software,Bangalore,info@tech.com,9123456789,tech.co.in
        """.strip()
        
        df = pd.read_csv(StringIO(csv_content))
        mapping = map_csv_columns(df)
        
        if mapping.get("business_name") == "Company Name":
            print("✓ Business name mapped correctly")
        else:
            print(f"✗ Business name mapping failed: {mapping.get('business_name')}")
            return False
        
        if mapping.get("category") == "Business Category":
            print("✓ Category mapped correctly")
        else:
            print(f"✗ Category mapping failed: {mapping.get('category')}")
            return False
        
        if mapping.get("website") == "Website URL":
            print("✓ Website mapped correctly")
        else:
            print(f"✗ Website mapping failed: {mapping.get('website')}")
            return False
        
        return True
    except Exception as e:
        print(f"✗ CSV mapping test failed: {e}")
        return False


def test_dashboard_metrics():
    """Test dashboard metrics calculation"""
    print("\nTesting dashboard metrics...")
    
    try:
        db = SessionLocal()
        
        # Create test leads with unique identifiers
        for i in range(5):
            lead = schemas.LeadCreate(
                business_name=f"Test Business {i}",
                source_id=f"src_{i}",  # Unique source ID to avoid duplicate detection
                email=f"test{i}@test.com" if i % 2 == 0 else None,
                whatsapp=f"98765432{i:02d}" if i % 3 == 0 else None,  # Unique phone
                website=f"test{i}.com",  # Unique website
            )
            crud.create_lead(db, lead)
        
        # Get metrics
        metrics = crud.get_dashboard_metrics(db)
        
        if metrics.total_leads >= 3:  # At least 3 should be created
            print(f"✓ Metrics calculated: {metrics.total_leads} leads")
            print(f"  - WhatsApp ready: {metrics.leads_whatsapp_ready}")
            print(f"  - Email ready: {metrics.leads_email_ready}")
            print(f"  - With website: {metrics.leads_with_website}")
            return True
        else:
            print(f"✗ Metrics calculation failed - only {metrics.total_leads} leads")
            return False
    except Exception as e:
        print(f"✗ Metrics test failed: {e}")
        return False
    finally:
        db.close()


def test_outreach_events():
    """Test outreach event logging"""
    print("\nTesting outreach events...")
    
    try:
        db = SessionLocal()
        
        # Create a lead
        lead_data = schemas.LeadCreate(
            business_name="Test Lead for Outreach",
            email="test@outreach.com",
        )
        result = crud.create_lead(db, lead_data)
        lead_id = result["lead"].id
        
        # Create outreach event
        event_data = schemas.OutreachEventCreate(
            lead_id=lead_id,
            channel=schemas.OutreachChannel.WHATSAPP,
            message_text="Test message",
        )
        event = crud.create_outreach_event(db, event_data)
        
        if event.id:
            print(f"✓ Outreach event created: ID {event.id}")
            
            # Get events
            events = crud.get_outreach_events(db, lead_id)
            if len(events) > 0:
                print(f"✓ Retrieved {len(events)} outreach events")
                
                # Check lead status updated
                updated_lead = crud.get_lead(db, lead_id)
                if updated_lead.last_contacted_at:
                    print(f"✓ Lead status updated with last_contacted_at")
                    return True
        
        return False
    except Exception as e:
        print(f"✗ Outreach events test failed: {e}")
        return False
    finally:
        db.close()


def run_all_tests():
    """Run all tests"""
    print("=" * 60)
    print("LEAD GENERATION API TEST SUITE")
    print("=" * 60)
    
    results = {
        "Database Init": test_database_init(),
        "Create Lead": test_create_lead()[0],
        "Duplicate Detection": test_duplicate_detection(),
        "Search & Filter": test_search_and_filter(),
        "Utilities": test_utils(),
        "CSV Mapping": test_csv_column_mapping(),
        "Dashboard Metrics": test_dashboard_metrics(),
        "Outreach Events": test_outreach_events(),
    }
    
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{status}: {test_name}")
    
    print("=" * 60)
    print(f"Results: {passed}/{total} passed")
    print("=" * 60)
    
    # Cleanup
    try:
        drop_db()
        print("\nDatabase cleaned up")
    except:
        pass
    
    return passed == total


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
