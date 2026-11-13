import re
from typing import List, Dict, Any, Optional
from app.schemas.voice_event import MandatoryVisitFields
from app.safety.guidelines import SAFETY_RULES, SafetyRuleDefinition

class SafetyRulesEngine:
    """
    Deterministic Clinical Rules Engine for ASHA VoiceCare.
    Identifies predefined danger signs strictly from cited MoHFW and IMNCI guidelines.
    Does NOT provide autonomous diagnosis, medication, or unvetted advice.
    """

    def __init__(self):
        self.rules = {r.rule_id: r for r in SAFETY_RULES}

    def evaluate(self, fields: MandatoryVisitFields, full_text: str = "") -> List[Dict[str, Any]]:
        """
        Runs deterministic rule evaluation over extracted visit fields and clinical text.
        Returns all matched referral flags.
        """
        alerts: List[Dict[str, Any]] = []
        combined_text = f"{fields.visit_type} {fields.visit_notes or ''} {full_text}".lower()
        is_newborn = "newborn" in combined_text or "hbnc" in combined_text or "baby" in combined_text or (fields.weight and fields.weight < 5.0)

        # Rule 1 & 2: Newborn Weight Checks
        if is_newborn and fields.weight is not None:
            if fields.weight < 1.80:
                alerts.append(self._build_alert(
                    rule=self.rules["HBNC-NB-002"],
                    trigger_reason=f"Very Low Birth Weight detected: {fields.weight:.2f} kg (< 1.80 kg threshold)"
                ))
            elif fields.weight < 2.00:
                alerts.append(self._build_alert(
                    rule=self.rules["HBNC-NB-001"],
                    trigger_reason=f"Low Birth Weight detected: {fields.weight:.2f} kg (< 2.00 kg threshold)"
                ))

        # Rule 3: Neonatal Hypothermia or Fever (with clinical negation guard)
        if is_newborn:
            has_hypothermia = bool(re.search(r'\b(cold to touch|hypothermia|thanda|ठंडा)\b', combined_text))
            has_high_fever = bool(re.search(r'\b(high fever|tez bukhar|तेज बुखार)\b', combined_text))
            # Check for generic fever only if NOT negated ("no fever", "without fever", "बुखार नहीं")
            has_generic_fever = bool(re.search(r'\bfever\b|\bबुखार\b', combined_text)) and not bool(re.search(r'\b(no fever|not fever|without fever|no high fever|बुखार नहीं)\b', combined_text))
            
            if has_hypothermia or has_high_fever or has_generic_fever:
                alerts.append(self._build_alert(
                    rule=self.rules["HBNC-NB-003"],
                    trigger_reason="Reported temperature instability (hypothermia or high fever in newborn)"
                ))

        # Rule 4: Poor Suckling / Inability to Feed
        if is_newborn:
            if re.search(r'\b(unable to feed|poor suckling|weak suckling|not feeding|दूध नहीं पी रहा|feed refusal|vomiting everything)\b', combined_text):
                alerts.append(self._build_alert(
                    rule=self.rules["HBNC-NB-004"],
                    trigger_reason="Weak or absent suckling / inability to breastfeed reported"
                ))

        # Rule 5: Fast breathing or chest indrawing
        if is_newborn:
            if re.search(r'\b(fast breathing|chest indrawing|grunting|saans tez|सांस तेज|pasli chalna)\b', combined_text):
                alerts.append(self._build_alert(
                    rule=self.rules["HBNC-NB-005"],
                    trigger_reason="Signs of acute respiratory distress (fast breathing or chest indrawing)"
                ))

        # Rule 6: Maternal Pre-eclampsia signs
        is_anc = "anc" in combined_text or "pregnant" in combined_text or "गर्भवती" in combined_text
        if is_anc:
            if re.search(r'\b(severe headache|blurred vision|swelling of face|preeclampsia|high bp|sir dard|dhundhla)\b', combined_text):
                alerts.append(self._build_alert(
                    rule=self.rules["HBNC-ANC-006"],
                    trigger_reason="Pre-eclampsia warning signs reported (severe headache, visual disturbance, or edema)"
                ))

        # Rule 7: Obstetric Hemorrhage / Bleeding
        if re.search(r'\b(vaginal bleeding|bleeding|khoon aana|खून बहना|hemorrhage)\b', combined_text):
            alerts.append(self._build_alert(
                rule=self.rules["HBNC-ANC-007"],
                trigger_reason="Vaginal bleeding or acute obstetric hemorrhage reported"
            ))

        return alerts

    def _build_alert(self, rule: SafetyRuleDefinition, trigger_reason: str) -> Dict[str, Any]:
        return {
            "rule_id": rule.rule_id,
            "title": rule.danger_sign_title,
            "trigger_reason": trigger_reason,
            "severity": rule.referral_severity,
            "guideline_source": rule.guideline_source,
            "action_instructions": rule.action_instructions
        }
