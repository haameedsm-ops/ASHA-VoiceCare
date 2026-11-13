"""
Clinical Guidelines and Rule Definitions for ASHA VoiceCare
Derived strictly from:
1. Ministry of Health & Family Welfare (MoHFW), Govt of India - Home Based Newborn Care (HBNC)
2. Integrated Management of Neonatal and Childhood Illness (IMNCI)
3. National Health Mission (NHM) Ante-Natal Care (ANC) / Janani Suraksha Yojana Protocols
"""
from dataclasses import dataclass
from typing import List

@dataclass(frozen=True)
class SafetyRuleDefinition:
    rule_id: str
    guideline_source: str
    target_category: str # "Newborn", "ANC", "Child", "PNC"
    danger_sign_title: str
    clinical_criteria: str
    referral_severity: str # "IMMEDIATE_PHC_REFERRAL", "EMERGENCY_SNCU_REFERRAL", "URGENT_PHC_REFERRAL", "URGENT_ANC_REFERRAL", "EMERGENCY_MOH_REFERRAL"
    action_instructions: str

SAFETY_RULES: List[SafetyRuleDefinition] = [
    SafetyRuleDefinition(
        rule_id="HBNC-NB-001",
        guideline_source="MoHFW HBNC Operational Guidelines (Module 6 & 7)",
        target_category="Newborn",
        danger_sign_title="Low Birth Weight (< 2.0 kg)",
        clinical_criteria="Measured or reported newborn weight less than 2.0 kg",
        referral_severity="IMMEDIATE_PHC_REFERRAL",
        action_instructions="Urgent referral to PHC/SNCU. Advise mother to initiate immediate Kangaroo Mother Care (KMC) and assist with frequent breastfeeding."
    ),
    SafetyRuleDefinition(
        rule_id="HBNC-NB-002",
        guideline_source="IMNCI Neonatal Guidelines - Table 1 (Danger Signs)",
        target_category="Newborn",
        danger_sign_title="Very Low Birth Weight (< 1.8 kg)",
        clinical_criteria="Measured or reported newborn weight less than 1.8 kg",
        referral_severity="EMERGENCY_SNCU_REFERRAL",
        action_instructions="Direct emergency transfer to Special Newborn Care Unit (SNCU). Keep baby warm during transport."
    ),
    SafetyRuleDefinition(
        rule_id="HBNC-NB-003",
        guideline_source="MoHFW HBNC Home Visit Checklist",
        target_category="Newborn",
        danger_sign_title="Neonatal Hypothermia or High Fever",
        clinical_criteria="Reported cold to touch (hypothermia) or hot/fever in newborn notes",
        referral_severity="URGENT_PHC_REFERRAL",
        action_instructions="Measure axillary temperature. If cold, wrap in warm clothes with head covered (KMC). Refer urgently to PHC."
    ),
    SafetyRuleDefinition(
        rule_id="HBNC-NB-004",
        guideline_source="IMNCI Neonatal Danger Signs",
        target_category="Newborn",
        danger_sign_title="Poor Suckling / Inability to Feed",
        clinical_criteria="Weak suckling, refusal of breastfeed, or vomiting everything",
        referral_severity="URGENT_PHC_REFERRAL",
        action_instructions="Critical danger sign for systemic infection. Refer immediately to Primary Health Centre."
    ),
    SafetyRuleDefinition(
        rule_id="HBNC-NB-005",
        guideline_source="IMNCI Acute Respiratory Infection Guidelines",
        target_category="Newborn",
        danger_sign_title="Fast Breathing / Chest Indrawing",
        clinical_criteria="Reported fast breathing (>60 breaths/min), grunting, or severe chest indrawing",
        referral_severity="URGENT_PHC_REFERRAL",
        action_instructions="Suspected neonatal pneumonia. Keep warm, avoid feeding during severe distress, urgent PHC referral."
    ),
    SafetyRuleDefinition(
        rule_id="HBNC-ANC-006",
        guideline_source="MoHFW Ante-Natal Care Protocol / Pradhan Mantri Surakshit Matritva Abhiyan",
        target_category="ANC",
        danger_sign_title="Suspected Maternal Pre-Eclampsia / Severe Hypertension",
        clinical_criteria="Severe headache, blurred vision, swelling of face/hands, or high BP mentioned in ANC notes",
        referral_severity="URGENT_ANC_REFERRAL",
        action_instructions="Suspected pre-eclampsia. Mobilize pregnant woman immediately to PHC/CHC for blood pressure measurement and medical evaluation."
    ),
    SafetyRuleDefinition(
        rule_id="HBNC-ANC-007",
        guideline_source="MoHFW Maternal Health Guidelines - Obstetric Emergencies",
        target_category="ANC",
        danger_sign_title="Antepartum / Postpartum Vaginal Bleeding",
        clinical_criteria="Vaginal bleeding or heavy lochia reported in ANC or PNC notes",
        referral_severity="EMERGENCY_MOH_REFERRAL",
        action_instructions="Obstetric emergency. Arrange immediate 108/102 ambulance transport to First Referral Unit (FRU)."
    )
]
