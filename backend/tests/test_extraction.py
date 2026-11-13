import pytest
from app.services.llm_extractor import StructuredInformationExtractor

def test_extract_all_five_mandatory_fields():
    extractor = StructuredInformationExtractor()
    transcript = (
        "Today I visited beneficiary 102. Baby weight is 2.8 kilograms. "
        "Vaccinations due are BCG and OPV zero. Next visit scheduled on 15 December. "
        "Baby feeding well at breast, no fever, umbilical cord stump dry."
    )
    fields, missing = extractor.extract(transcript)
    assert missing == []
    assert fields is not None
    assert fields.beneficiary_id == "BEN-102"
    assert fields.visit_type == "Newborn Home Visit (HBNC)"
    assert fields.weight == 2.80
    assert "BCG" in fields.vaccinations_due
    assert "OPV-0" in fields.vaccinations_due
    assert fields.next_visit_date == "2026-12-15"
    assert "feeding well" in fields.visit_notes.lower()

def test_extract_with_missing_mandatory_field():
    extractor = StructuredInformationExtractor()
    # Missing weight
    transcript = "Beneficiary 101 ANC visit. Next visit 2026-11-20. TT-2 due."
    fields, missing = extractor.extract(transcript)
    assert "weight" in missing
    assert fields is None

def test_extract_codemixed_hindi_english():
    extractor = StructuredInformationExtractor()
    transcript = "लाभार्थी 104 का गृह भेंट। वजन 1.95 किलो। हेपेटाइटिस बी टीका। अगली मुलाकात 2026-11-14।"
    fields, missing = extractor.extract(transcript)
    assert missing == []
    assert fields is not None
    assert fields.beneficiary_id == "BEN-104"
    assert fields.weight == 1.95
    assert fields.next_visit_date == "2026-11-14"

def test_extract_preselected_beneficiary_fallback():
    extractor = StructuredInformationExtractor()
    # Spoken note doesn't mention beneficiary ID explicitly
    transcript = "Weight is 54.5 kg, ANC visit, next checkup 2026-11-20, TT-1 due."
    fields, missing = extractor.extract(transcript, preselected_beneficiary_id="BEN-101")
    assert missing == []
    assert fields.beneficiary_id == "BEN-101"
    assert fields.weight == 54.5
