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
  const apiKey = env.JOOBLE_API_KEY;
  const apiHost = env.JOOBLE_API_HOST || 'in.jooble.org';
  const configured = Boolean(apiKey && apiHost === 'in.jooble.org');

  if (req.method === 'GET') return sendJson(res, 200, {
    configured,
    error: apiKey && apiHost !== 'in.jooble.org' ? 'India-only searches require an India Jooble key and the in.jooble.org host.' : ''
  });
  if (req.method !== 'POST') {
    res.setHeader?.('Allow', 'GET, POST');
    return sendJson(res, 405, { error: 'Method not allowed.' });
  }
  if (!configured) return sendJson(res, 503, { error: 'Jooble is not configured yet.' });

  let body;
  try { body = parseBody(req.body); }
  catch { return sendJson(res, 400, { error: 'Invalid JSON request body.' }); }

  const keywords = typeof body.keywords === 'string' ? body.keywords.trim().slice(0, 120) : '';
  const location = typeof body.location === 'string' ? body.location.trim().slice(0, 100) : '';
  const companySearch = body.companySearch === true;
  const page = Number.isInteger(Number(body.page)) ? Math.min(10, Math.max(1, Number(body.page))) : 1;
  if (!keywords || !location) return sendJson(res, 400, { error: 'Keywords and location are required.' });

  try {
    const response = await fetch(`https://${apiHost}/api/${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ keywords, location, page: String(page), ResultOnPage: 20, companysearch: companySearch }),
      signal: AbortSignal.timeout(12000)
    });
    if (!response.ok) {
      if (response.status === 429) return sendJson(res, 429, { error: 'Jooble daily API limit reached.' });
      if (response.status === 403 || response.status === 401) {
        return sendJson(res, 502, { error: 'Jooble rejected this key for the India endpoint. Create or use a key from in.jooble.org/api/about.' });
      }
      return sendJson(res, 502, { error: `Jooble search failed (${response.status}). Check the India API key and try again.` });
    }
    const data = await response.json();
    if (!Array.isArray(data.jobs)) return sendJson(res, 502, { error: 'Jooble returned an unsupported response.' });
    return sendJson(res, 200, { totalCount: Number(data.totalCount) || data.jobs.length, jobs: data.jobs });
  } catch (error) {
    return sendJson(res, error.name === 'TimeoutError' ? 504 : 502, { error: error.name === 'TimeoutError' ? 'Jooble search timed out.' : 'Could not reach Jooble.' });
  }
}
