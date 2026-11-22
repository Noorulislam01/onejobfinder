import { normalizeJob } from '../../utils/jobNormalizer.js';

const cachePrefix = 'techjob:linkedin:';
const cacheTtl = 20 * 60 * 1000;

function cached(key) {
  try {
    const entry = JSON.parse(localStorage.getItem(key) || 'null');
    return entry && Date.now() - entry.savedAt < cacheTtl ? entry.jobs : null;
  } catch { return null; }
}

function normalizeLinkedInJob(raw) {
  const address = raw.locations?.[0]?.address;
  const location = (raw.locations_derived || []).join(', ') || [address?.addressLocality, address?.addressRegion, address?.addressCountry].filter(Boolean).join(', ');
  const country = (raw.countries_derived || []).join(', ');
  const description = raw.description_text || raw.description || raw.ai_requirements_summary || '';
  const skills = Array.isArray(raw.ai_key_skills) ? raw.ai_key_skills : [];
  return normalizeJob({
    id: raw.id || raw.linkedin_id,
    title: raw.title,
    company: raw.organization,
    location: [location, country].filter(Boolean).join(', '),
    description,
    employment_type: Array.isArray(raw.employment_type) ? raw.employment_type.join(', ') : raw.employment_type,
    salary: raw.salary || (raw.ai_salary_min_value || raw.ai_salary_max_value ? `${raw.ai_salary_currency || ''} ${raw.ai_salary_min_value || ''}-${raw.ai_salary_max_value || ''} ${raw.ai_salary_unit_text || ''}`.trim() : ''),
    url: raw.url,
    created: raw.date_posted,
    remote: String(raw.ai_work_arrangement || '').toLowerCase() === 'remote',
    tags: skills
  }, 'LinkedIn');
}

export async function fetchLinkedInJobs({ title, location = 'India', organization = '', signal }) {
  const status = await fetch('/api/linkedin-jobs', { signal });
  if (!status.ok) throw new Error('Could not check LinkedIn jobs API configuration.');
  const configuration = await status.json();
  if (!configuration.configured) return [];

  const cacheKey = `${cachePrefix}${encodeURIComponent(`${title}|${organization}|${location}`)}`;
  const previous = cached(cacheKey);
  if (previous) return previous;

  const response = await fetch('/api/linkedin-jobs', {
    method: 'POST', signal,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ title, organization, location })
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || `LinkedIn jobs API returned ${response.status}.`);
  const jobs = (payload.jobs || []).map(normalizeLinkedInJob);
  try { localStorage.setItem(cacheKey, JSON.stringify({ savedAt: Date.now(), jobs })); }
  catch { /* Live results remain usable when browser storage is unavailable. */ }
  return jobs;
}
