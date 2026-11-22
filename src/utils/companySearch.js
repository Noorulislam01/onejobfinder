import { companySearches } from '../data/companySearches.js';

const clean = value => String(value || '').toLocaleLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export function findCompanySearch(query) {
  const normalized = clean(query).replace(/\b(jobs?|careers?|at|in|india)\b/g, ' ').replace(/\s+/g, ' ').trim();
  return companySearches.find(company => company.aliases.some(alias => clean(alias) === normalized));
}

export function matchesCompanyQuery(job, query) {
  const company = findCompanySearch(query);
  if (!company) return false;
  const name = clean(job.company);
  return company.aliases.some(alias => name.includes(clean(alias)));
}
