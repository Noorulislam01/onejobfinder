import { normalizeJob } from '../../utils/jobNormalizer.js';

const cachePrefix = 'techjob:jooble:';
const cacheTtl = 60 * 60 * 1000;

function cached(key) {
  try {
    const entry = JSON.parse(localStorage.getItem(key) || 'null');
    return entry && Date.now() - entry.savedAt < cacheTtl ? entry.jobs : null;
  } catch { return null; }
}

export async function fetchJooble({ keywords, location = 'India', companySearch = false, signal }) {
  const status = await fetch('/api/jooble', { signal });
  if (!status.ok) throw new Error('Could not check Jooble configuration.');
  const configuration = await status.json();
  if (configuration.error) throw new Error(configuration.error);
  if (!configuration.configured) return [];

  const cacheKey = `${cachePrefix}${encodeURIComponent(`${keywords}|${location}|company:${companySearch}`)}`;
  const previous = cached(cacheKey);
  if (previous) return previous;

  const response = await fetch('/api/jooble', {
    method: 'POST', signal,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ keywords, location, companySearch })
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || `Jooble returned ${response.status}.`);
  const jobs = (payload.jobs || []).map(job => normalizeJob(job, 'Jooble'));
  try { localStorage.setItem(cacheKey, JSON.stringify({ savedAt: Date.now(), jobs })); }
  catch { /* Results remain usable if browser storage is unavailable. */ }
  return jobs;
}
