import React, { useState } from 'react';
import Header from './components/common/Header';
import Navbar from './components/common/Navbar';
import DashboardPage from './pages/DashboardPage';
import BeneficiaryPage from './pages/BeneficiaryPage';
import VoiceAssistantPage from './pages/VoiceAssistantPage';
import VerificationPage from './pages/VerificationPage';
import HistoryPage from './pages/HistoryPage';
import FollowupPage from './pages/FollowupPage';
import LoginPage from './pages/LoginPage';
import { INITIAL_BENEFICIARIES } from './data/mockBeneficiaries';

export default function App() {
  const [user, setUser] = useState({
    name: 'Sunita Devi',
    workerId: 'ASHA-RMP-04',
    subCentre: 'Rampur Sub-Centre',
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedLanguage, setSelectedLanguage] = useState('hi-IN');
  const [beneficiaries, setBeneficiaries] = useState(INITIAL_BENEFICIARIES);
  const [targetBeneficiaryForVisit, setTargetBeneficiaryForVisit] = useState(null);
  
  // Live voice session visit data passed to verification
  const [currentVisitData, setCurrentVisitData] = useState(null);

  // Confirmed visits list
  const [confirmedVisits, setConfirmedVisits] = useState([
    {
      visitId: 'VIS-901',
      beneficiaryId: 'BEN-102',
      name: 'Pooja Verma (Baby of Pooja)',
      visitType: 'HBNC Home Visit (Day 14)',
      weight: '2.80 kg',
      vaccinationsDue: 'BCG, OPV-0, Hepatitis B-0',
      nextVisitDate: '2026-11-23',
      confirmedAt: '2026-11-09 11:30 AM',
      hasAlert: false,
    },
    {
      visitId: 'VIS-902',
      beneficiaryId: 'BEN-104',
      name: 'Sunita Yadav (Baby of Sunita)',
      visitType: 'HBNC Home Visit (Day 3)',
      weight: '1.95 kg',
      vaccinationsDue: 'Hepatitis B-0, OPV-0',
      nextVisitDate: '2026-11-14',
      confirmedAt: '2026-11-11 02:15 PM',
      hasAlert: true,
      alertText: 'Low Birth Weight (< 2.0 kg) - Immediate PHC Referral Flagged',
    },
    {
      visitId: 'VIS-903',
      beneficiaryId: 'BEN-101',
      name: 'Meena Sharma',
      visitType: 'ANC Visit (3rd Trimester)',
      weight: '54.5 kg',
      vaccinationsDue: 'TT-2 Booster',
      nextVisitDate: '2026-11-20',
      confirmedAt: '2026-11-04 10:45 AM',
      hasAlert: false,
    },
  ]);

  // Active referral alerts
  const [activeAlerts, setActiveAlerts] = useState([
    {
      id: 'ALT-001',
      beneficiaryId: 'BEN-104',
      beneficiaryName: 'Sunita Yadav (Baby of Sunita)',
      severity: 'IMMEDIATE_PHC_REFERRAL',
      triggerReason: 'Low Birth Weight (< 2.0 kg) detected: 1.95 kg',
      guidance: 'Immediate referral to PHC/SNCU for thermal care, KMC, and feeding evaluation per MoHFW HBNC Module 6 & 7.',
      ruleId: 'HBNC-NB-001',
    },
    {
      id: 'ALT-002',
      beneficiaryId: 'BEN-106',
      beneficiaryName: 'Radha Kumari (Baby of Radha)',
      severity: 'VACCINATION_DUE',
      triggerReason: 'Child age 9 months with MR-1 dose due',
      guidance: 'Mobilize mother to upcoming Village Health & Nutrition Day (VHND) for Measles-Rubella-1 & Vitamin A.',
      ruleId: 'IMNCI-IM-002',
    },
  ]);

  const handleAddBeneficiary = (newBeneficiary) => {
    setBeneficiaries((prev) => [newBeneficiary, ...prev]);
  };

  const handleSelectBeneficiaryForVisit = (beneficiary) => {
    setTargetBeneficiaryForVisit(beneficiary);
  };

  const handleExtractionComplete = (extractedDataPayload) => {
    setCurrentVisitData(extractedDataPayload);
  };

  const handleVisitConfirmed = (savedVisit) => {
    const formattedRecord = {
      visitId: savedVisit.visit_id || `VIS-${Math.floor(100 + Math.random() * 900)}`,
      beneficiaryId: savedVisit.beneficiary_id,
      name: savedVisit.name || `Beneficiary ${savedVisit.beneficiary_id}`,
      visitType: savedVisit.visit_type,
      weight: `${savedVisit.weight} kg`,
      vaccinationsDue: savedVisit.vaccinations_due,
      nextVisitDate: savedVisit.next_visit_date,
      confirmedAt: new Date().toLocaleString(),
      hasAlert: savedVisit.hasAlert || false,
      alertText: savedVisit.hasAlert ? 'Danger Sign Flagged per HBNC Guidelines' : null
    };

    setConfirmedVisits((prev) => [formattedRecord, ...prev]);

    // Update beneficiary's weight and last visit date
    setBeneficiaries((prev) =>
      prev.map((b) => {
        if (b.id === savedVisit.beneficiary_id) {
          return {
            ...b,
            currentWeight: savedVisit.weight,
            lastVisitDate: new Date().toISOString().split('T')[0],
            visits: [
              {
                visitId: formattedRecord.visitId,
                date: new Date().toISOString().split('T')[0],
                type: savedVisit.visit_type,
                weight: `${savedVisit.weight} kg`,
                vaccinationsDue: savedVisit.vaccinations_due,
                nextVisitDate: savedVisit.next_visit_date,
                notes: savedVisit.visit_notes || 'Confirmed field visit notes.',
                hasAlert: savedVisit.hasAlert
              },
              ...(b.visits || [])
            ]
          };
        }
        return b;
      })
    );
  };

  if (!user) {
    return <LoginPage onLogin={(userData) => setUser(userData)} />;
  }

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardPage
            onNavigate={setActiveTab}
            beneficiaries={beneficiaries}
            visits={confirmedVisits}
            alerts={activeAlerts}
          />
        );
      case 'beneficiaries':
        return (
          <BeneficiaryPage
            beneficiaries={beneficiaries}
            onAddBeneficiary={handleAddBeneficiary}
            onSelectBeneficiaryForVisit={handleSelectBeneficiaryForVisit}
            onNavigate={setActiveTab}
          />
        );
      case 'voice':
        return (
          <VoiceAssistantPage
            onNavigate={setActiveTab}
            selectedLanguage={selectedLanguage}
            targetBeneficiary={targetBeneficiaryForVisit}
            onExtractionComplete={handleExtractionComplete}
          />
        );
      case 'verification':
        return (
          <VerificationPage
            onNavigate={setActiveTab}
            visitData={currentVisitData}
            onVisitConfirmed={handleVisitConfirmed}
          />
        );
      case 'history':
        return <HistoryPage onNavigate={setActiveTab} visits={confirmedVisits} />;
      case 'followups':
        return <FollowupPage onNavigate={setActiveTab} alerts={activeAlerts} />;
      default:
        return (
          <DashboardPage
            onNavigate={setActiveTab}
            beneficiaries={beneficiaries}
            visits={confirmedVisits}
            alerts={activeAlerts}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-health-bgSoft flex flex-col text-health-navy">
      <Header
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        {renderActivePage()}
      </main>
    </div>
  );
}
