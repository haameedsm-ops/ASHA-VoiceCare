/**
 * Synthetic Beneficiary and Clinical Data for ASHA VoiceCare
 * Represents realistic village catchment records for an ASHA sub-centre
 */

export const INITIAL_BENEFICIARIES = [
  {
    id: 'BEN-101',
    name: 'Meena Sharma',
    age: 24,
    category: 'ANC',
    categoryDetail: 'ANC (8 Months - 3rd Trimester)',
    hamlet: 'Rampur - Purva Tola',
    contact: '+91 98765 43210',
    currentWeight: 54.5,
    edd: '2026-12-28',
    lastVisitDate: '2026-11-04',
    registeredDate: '2026-04-15',
    recentAlert: null,
    visits: [
      {
        visitId: 'VIS-903',
        date: '2026-11-04',
        type: 'ANC Visit (3rd Trimester)',
        weight: '54.5 kg',
        vaccinationsDue: 'TT-2 Booster',
        nextVisitDate: '2026-11-20',
        notes: 'BP normal (118/78), fetal movement active. Advised 100 IFA tablets intake.',
        hasAlert: false,
      },
      {
        visitId: 'VIS-850',
        date: '2026-10-06',
        type: 'ANC Visit (2nd Trimester)',
        weight: '52.0 kg',
        vaccinationsDue: 'TT-1',
        nextVisitDate: '2026-11-04',
        notes: 'Weight gain on track (+2kg). Consuming IFA regularly.',
        hasAlert: false,
      }
    ]
  },
  {
    id: 'BEN-102',
    name: 'Pooja Verma (Baby of Pooja)',
    age: 0,
    category: 'Newborn',
    categoryDetail: 'Newborn (Day 14)',
    hamlet: 'Rampur - Main Basti',
    contact: '+91 98765 11223',
    currentWeight: 2.80,
    dob: '2026-10-29',
    lastVisitDate: '2026-11-09',
    registeredDate: '2026-10-29',
    recentAlert: null,
    visits: [
      {
        visitId: 'VIS-901',
        date: '2026-11-09',
        type: 'HBNC Home Visit (Day 14)',
        weight: '2.80 kg',
        vaccinationsDue: 'BCG, OPV-0, Hepatitis B-0',
        nextVisitDate: '2026-11-23',
        notes: 'Baby feeding well at breast, no fever, umbilical cord stump dry and detached.',
        hasAlert: false,
      },
      {
        visitId: 'VIS-888',
        date: '2026-11-01',
        type: 'HBNC Home Visit (Day 3)',
        weight: '2.65 kg',
        vaccinationsDue: 'Birth doses pending verification',
        nextVisitDate: '2026-11-09',
        notes: 'Breastfeeding established. Keeping baby warm with KMC.',
        hasAlert: false,
      }
    ]
  },
  {
    id: 'BEN-103',
    name: 'Anita Devi',
    age: 28,
    category: 'PNC',
    categoryDetail: 'PNC (Day 28)',
    hamlet: 'Rampur - Harijan Basti',
    contact: '+91 98765 99887',
    currentWeight: 52.0,
    dob: '2026-10-15',
    lastVisitDate: '2026-10-28',
    registeredDate: '2026-03-10',
    recentAlert: null,
    visits: [
      {
        visitId: 'VIS-890',
        date: '2026-10-28',
        type: 'PNC Home Visit (Day 14)',
        weight: '52.0 kg',
        vaccinationsDue: 'None',
        nextVisitDate: '2026-11-26',
        notes: 'Lochia normal, mother recovering well. Exclusive breastfeeding advised.',
        hasAlert: false,
      }
    ]
  },
  {
    id: 'BEN-104',
    name: 'Sunita Yadav (Baby of Sunita)',
    age: 0,
    category: 'Newborn',
    categoryDetail: 'Newborn (Day 3) - Low Birth Weight',
    hamlet: 'Rampur - Patel Nagar',
    contact: '+91 98765 33445',
    currentWeight: 1.95,
    dob: '2026-11-09',
    lastVisitDate: '2026-11-11',
    registeredDate: '2026-11-09',
    recentAlert: {
      ruleId: 'HBNC-NB-001',
      title: 'Low Birth Weight (< 2.0 kg)',
      detail: 'Measured 1.95 kg. Immediate PHC evaluation & Kangaroo Mother Care required.',
      severity: 'IMMEDIATE_PHC_REFERRAL'
    },
    visits: [
      {
        visitId: 'VIS-902',
        date: '2026-11-11',
        type: 'HBNC Home Visit (Day 3)',
        weight: '1.95 kg',
        vaccinationsDue: 'Hepatitis B-0, OPV-0',
        nextVisitDate: '2026-11-14',
        notes: 'Low birth weight observed (1.95 kg). Advised immediate Kangroo Mother Care and PHC consultation.',
        hasAlert: true,
        alertText: 'Low Birth Weight (< 2.0 kg) - Immediate PHC Referral Flagged'
      }
    ]
  },
  {
    id: 'BEN-105',
    name: 'Kavita Singh',
    age: 22,
    category: 'ANC',
    categoryDetail: 'ANC (4 Months - 2nd Trimester)',
    hamlet: 'Rampur - Purva Tola',
    contact: '+91 98765 66778',
    currentWeight: 48.0,
    edd: '2027-04-10',
    lastVisitDate: '2026-11-02',
    registeredDate: '2026-09-01',
    recentAlert: null,
    visits: [
      {
        visitId: 'VIS-875',
        date: '2026-11-02',
        type: 'ANC Visit (16 Weeks)',
        weight: '48.0 kg',
        vaccinationsDue: 'TT-1 Due',
        nextVisitDate: '2026-12-02',
        notes: 'First ANC visit registered. Prescribed folic acid and iron supplements.',
        hasAlert: false,
      }
    ]
  },
  {
    id: 'BEN-106',
    name: 'Radha Kumari (Baby of Radha)',
    age: 1,
    category: 'Child',
    categoryDetail: 'Infant (9 Months)',
    hamlet: 'Rampur - Main Basti',
    contact: '+91 98765 77889',
    currentWeight: 7.40,
    dob: '2026-02-14',
    lastVisitDate: '2026-10-20',
    registeredDate: '2026-02-14',
    recentAlert: {
      ruleId: 'IMNCI-IM-002',
      title: 'Measles-Rubella (MR-1) Due',
      detail: 'Child completed 9 months. MR-1 & Vitamin A dose due at upcoming VHND.',
      severity: 'VACCINATION_DUE'
    },
    visits: [
      {
        visitId: 'VIS-840',
        date: '2026-10-20',
        type: 'Child Immunisation Check',
        weight: '7.40 kg',
        vaccinationsDue: 'MR-1, Vit-A (at 9 months)',
        nextVisitDate: '2026-11-18',
        notes: 'Growth monitoring normal. Complementary feeding ongoing.',
        hasAlert: true,
        alertText: 'Vaccination Due: MR-1 & Vitamin A dose at 9 months'
      }
    ]
  }
];
