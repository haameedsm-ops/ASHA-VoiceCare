/**
 * REST API client for ASHA VoiceCare FastAPI backend
 */

const API_BASE_URL = 'http://localhost:8000/api/v1';

export async function fetchHealthStatus() {
  const res = await fetch(`${API_BASE_URL}/health`);
  return res.json();
}

export async function fetchBeneficiaries(query = '') {
  const url = query ? `${API_BASE_URL}/beneficiaries?q=${encodeURIComponent(query)}` : `${API_BASE_URL}/beneficiaries`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch beneficiaries');
  return res.json();
}

export async function createBeneficiary(data) {
  const res = await fetch(`${API_BASE_URL}/beneficiaries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create beneficiary');
  return res.json();
}

export async function fetchVisits(beneficiaryId = null) {
  const url = beneficiaryId ? `${API_BASE_URL}/visits?beneficiary_id=${encodeURIComponent(beneficiaryId)}` : `${API_BASE_URL}/visits`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch visits');
  return res.json();
}

export async function saveVerifiedVisit(visitData) {
  const res = await fetch(`${API_BASE_URL}/visits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(visitData),
  });
  if (!res.ok) throw new Error('Failed to save visit record');
  return res.json();
}

export async function fetchSafetyAlerts() {
  const res = await fetch(`${API_BASE_URL}/safety/alerts`);
  if (!res.ok) throw new Error('Failed to fetch safety alerts');
  return res.json();
}

export async function fetchFollowups(status = null) {
  const url = status ? `${API_BASE_URL}/followups?status=${status}` : `${API_BASE_URL}/followups`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch followups');
  return res.json();
}

export async function updateFollowupStatus(followupId, status) {
  const res = await fetch(`${API_BASE_URL}/followups/${followupId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update followup status');
  return res.json();
}
