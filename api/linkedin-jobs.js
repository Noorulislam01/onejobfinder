function sendJson(res, status, data) {
  if (typeof res.status === 'function') return res.status(status).json(data);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(data));
}

function parseBody(body) {
  if (typeof body === 'string') return JSON.parse(body || '{}');
  if (body && typeof body === 'object') return body;
  return {};
}

export default async function handler(req, res, env = process.env) {
  const apiKey = env.LINKEDIN_JOBS_RAPIDAPI_KEY;
  const apiHost = env.LINKEDIN_JOBS_RAPIDAPI_HOST || 'linkedin-job-search-api.p.rapidapi.com';
  const configured = Boolean(apiKey && apiHost === 'linkedin-job-search-api.p.rapidapi.com');

  if (req.method === 'GET') return sendJson(res, 200, { configured });
  if (req.method !== 'POST') {
    res.setHeader?.('Allow', 'GET, POST');
    return sendJson(res, 405, { error: 'Method not allowed.' });
  }
  if (!configured) return sendJson(res, 503, { error: 'LinkedIn jobs API is not configured.' });

  let body;
  try { body = parseBody(req.body); }
  catch { return sendJson(res, 400, { error: 'Invalid JSON request body.' }); }

  const title = typeof body.title === 'string' ? body.title.trim().slice(0, 120) : '';
  const organization = typeof body.organization === 'string' ? body.organization.trim().slice(0, 120) : '';
  const location = typeof body.location === 'string' ? body.location.trim().slice(0, 100) : 'India';
  if ((!title && !organization) || !location) return sendJson(res, 400, { error: 'A job title or company and location are required.' });

  const url = new URL(`https://${apiHost}/active-jb`);
  url.searchParams.set('time_frame', '7d');
  url.searchParams.set('limit', '100');
  url.searchParams.set('offset', '0');
  if (title) url.searchParams.set('title', title);
  if (organization) url.searchParams.set('organization', organization);
  url.searchParams.set('location', location);
  url.searchParams.set('description_format', 'text');

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': apiHost
      },
      signal: AbortSignal.timeout(20000)
    });
    if (!response.ok) {
      if (response.status === 429) return sendJson(res, 429, { error: 'RapidAPI request limit reached for LinkedIn jobs.' });
      if (response.status === 401 || response.status === 403) return sendJson(res, 502, { error: 'RapidAPI rejected the LinkedIn jobs key or subscription.' });
      return sendJson(res, 502, { error: `LinkedIn jobs search failed (${response.status}).` });
    }
    const data = await response.json();
    const jobs = Array.isArray(data) ? data : Array.isArray(data.jobs) ? data.jobs : Array.isArray(data.data) ? data.data : null;
    if (!jobs) return sendJson(res, 502, { error: 'LinkedIn jobs API returned an unsupported response.' });
    return sendJson(res, 200, { jobs });
  } catch (error) {
    const timeout = error.name === 'TimeoutError';
    return sendJson(res, timeout ? 504 : 502, { error: timeout ? 'LinkedIn jobs search timed out.' : 'Could not reach RapidAPI for LinkedIn jobs.' });
  }
}
