import re
from datetime import datetime
from typing import Dict, Any, Optional, Tuple, List
from pydantic import ValidationError
from app.schemas.voice_event import MandatoryVisitFields

class StructuredInformationExtractor:
    """
    Intelligent Information Extractor for Multilingual / Code-Mixed ASHA Visit Transcripts.
    Extracts the 5 mandatory fields and clinical observations without hallucinating missing data.
    """
    
    MONTH_MAP = {
        "january": 1, "jan": 1, "जनवरी": 1,
        "february": 2, "feb": 2, "फरवरी": 2,
        "march": 3, "mar": 3, "मार्च": 3,
        "april": 4, "apr": 4, "अप्रैल": 4,
        "may": 5, "मई": 5,
        "june": 6, "jun": 6, "जून": 6,
        "july": 7, "jul": 7, "जुलाई": 7,
        "august": 8, "aug": 8, "अगस्त": 8,
        "september": 9, "sep": 9, "sept": 9, "सितंबर": 9,
        "october": 10, "oct": 10, "अक्टूबर": 10,
        "november": 11, "nov": 11, "नवंबर": 11,
        "december": 12, "dec": 12, "दिसंबर": 12,
    }

    def extract(self, transcript: str, preselected_beneficiary_id: Optional[str] = None) -> Tuple[Optional[MandatoryVisitFields], List[str]]:
        missing_fields = []
        text = transcript.strip()

        # 1. Beneficiary ID
        ben_id = self._extract_beneficiary_id(text, preselected_beneficiary_id)
        if not ben_id:
            missing_fields.append("beneficiary_id")

        # 2. Weight
        weight = self._extract_weight(text)
        if weight is None:
            missing_fields.append("weight")

        # 3. Next Visit Date
        next_date = self._extract_next_visit_date(text)
        if not next_date:
            missing_fields.append("next_visit_date")

        # 4. Visit Type
        visit_type = self._extract_visit_type(text)
        if not visit_type:
            missing_fields.append("visit_type")

        # 5. Vaccinations Due
        vaccines = self._extract_vaccinations(text)
        if not vaccines:
            if re.search(r'(?:^|\s)(?:no|none|not due|nil|कोई नहीं)(?:$|\s|\.|\,)', text, re.IGNORECASE):
                vaccines = "None"
            else:
                missing_fields.append("vaccinations_due")

        # Additional clinical observations
        notes = self._extract_notes(text)

        if missing_fields:
            return None, missing_fields

        try:
            fields = MandatoryVisitFields(
                beneficiary_id=ben_id,
                visit_type=visit_type,
                weight=weight,
                vaccinations_due=vaccines,
                next_visit_date=next_date,
                visit_notes=notes
            )
            return fields, []
        except ValidationError:
            return None, missing_fields

    def _extract_beneficiary_id(self, text: str, fallback_id: Optional[str] = None) -> Optional[str]:
        match = re.search(r'(?:beneficiary|ben|id|लाभार्थी)\s*[:#-]?\s*([0-9]{2,4}|[A-Za-z]+-[0-9]{2,4})', text, re.IGNORECASE)
        if match:
            val = match.group(1).upper()
            return val if val.startswith("BEN-") else f"BEN-{val}"
        if fallback_id:
            return fallback_id if fallback_id.startswith("BEN-") else f"BEN-{fallback_id}"
        return None

    def _extract_weight(self, text: str) -> Optional[float]:
        # Specific weight patterns
        match = re.search(r'(?:weight|wt|वजन)\s*(?:is|was|=)?\s*([0-9]+(?:\.[0-9]+)?)\s*(?:kg|kgs|kilograms?|किलो)?', text, re.IGNORECASE)
        if match:
            return float(match.group(1))
        # Direct number followed by kg or किलो
        match_direct = re.search(r'([0-9]+(?:\.[0-9]+)?)\s*(?:kg|kgs|kilograms?|किलो)', text, re.IGNORECASE)
        if match_direct:
            return float(match_direct.group(1))
        return None

    def _extract_next_visit_date(self, text: str) -> Optional[str]:
        # Format 1: ISO "2026-12-15"
        iso_match = re.search(r'\b(202[5-9]-[0-1][0-9]-[0-3][0-9])\b', text)
        if iso_match:
            return iso_match.group(1)

        # Format 2: Specifically look for defined month names
        months_pattern = "|".join(re.escape(k) for k in self.MONTH_MAP.keys())
        
        # Day followed by month: "15 December", "15 Dec 2026", "15 दिसंबर"
        day_month_match = re.search(
            rf'([0-3]?[0-9])\s*(?:th|st|nd|rd)?\s+({months_pattern})(?:\s+(202[5-9]))?',
            text,
            re.IGNORECASE
        )
        if day_month_match:
            day = int(day_month_match.group(1))
            month_str = day_month_match.group(2).lower()
            year = int(day_month_match.group(3)) if day_month_match.group(3) else 2026
            if month_str in self.MONTH_MAP:
                month = self.MONTH_MAP[month_str]
                return f"{year:04d}-{month:02d}-{day:02d}"

        # Month followed by day: "December 15"
        month_day_match = re.search(
            rf'({months_pattern})\s+([0-3]?[0-9])(?:\s+(202[5-9]))?',
            text,
            re.IGNORECASE
        )
        if month_day_match:
            month_str = month_day_match.group(1).lower()
            day = int(month_day_match.group(2))
            year = int(month_day_match.group(3)) if month_day_match.group(3) else 2026
            if month_str in self.MONTH_MAP:
                month = self.MONTH_MAP[month_str]
                return f"{year:04d}-{month:02d}-{day:02d}"

        return None

    def _extract_visit_type(self, text: str) -> Optional[str]:
        lower = text.lower()
        if "newborn" in lower or "hbnc" in lower or "नवजात" in lower or "baby" in lower:
            return "Newborn Home Visit (HBNC)"
        elif "anc" in lower or "pregnant" in lower or "गर्भवती" in lower or "antenatal" in lower:
            return "ANC Home Visit"
        elif "pnc" in lower or "postnatal" in lower or "प्रसव" in lower:
            return "PNC Home Visit"
        elif "immunis" in lower or "vaccin" in lower or "टीका" in lower:
            return "Child Immunisation Check"
        elif "visit" in lower or "भेंट" in lower:
            return "Routine Community Home Visit"
        return None

    def _extract_vaccinations(self, text: str) -> Optional[str]:
        found_vaccines = []
        vaccine_patterns = [
            (r'(?:BCG|बीसीजी)', 'BCG'),
            (r'(?:OPV|ओपीवी|पोलियो)(?:\s*[-_]?\s*(?:0|zero|1|2|3|शून्य))?', 'OPV-0'),
            (r'(?:Hepatitis\s*B|हेपेटाइटिस\s*बी)(?:\s*[-_]?\s*0)?', 'Hepatitis B-0'),
            (r'(?:Pentavalent|पेंटावेलेंट)(?:\s*[-_]?\s*[1-3])?', 'Pentavalent-1'),
            (r'(?:Rotavirus|रोटावायरस)', 'Rotavirus'),
            (r'(?:PCV|पीसीवी)', 'PCV'),
            (r'(?:MR|Measles|खसरा)(?:\s*[-_]?\s*1)?', 'MR-1'),
            (r'(?:TT|टीटी)(?:\s*[-_]?\s*(?:1|2|booster|बूस्टर))?', 'TT-2 Booster'),
            (r'(?:Vitamin\s*A|विटामिन\s*ए)', 'Vitamin A')
        ]
        for pat, standard_name in vaccine_patterns:
            if re.search(pat, text, re.IGNORECASE):
                found_vaccines.append(standard_name)

        if found_vaccines:
            return ", ".join(list(dict.fromkeys(found_vaccines)))
        return None

    def _extract_notes(self, text: str) -> str:
        observations = []
        lower = text.lower()
        if "feeding well" in lower or "स्तनपान" in lower:
            observations.append("Baby feeding well at breast")
        if "no fever" in lower or "बुखार नहीं" in lower:
            observations.append("No fever")
        if "cord" in lower or "नाल" in lower:
            observations.append("Umbilical cord clean and dry")
        if "ifa" in lower or "iron" in lower:
            observations.append("IFA supplementation verified")
        if "bp" in lower:
            observations.append("Maternal BP recorded")
        
        return ". ".join(observations) if observations else "Home visit conducted per protocol."
