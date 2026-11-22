import { companySearches } from '../data/companySearches.js';

export function SearchBar(onSearch, compact = false) {
  const widget = document.createElement('div');
  widget.className = `search-widget${compact ? ' search-compact' : ''}`;
  const form = document.createElement('form');
  form.className = 'search-form';
  const input = document.createElement('input');
  input.type = 'search';
  input.placeholder = 'Job title, company, skills…';
  input.setAttribute('aria-label', 'Search jobs');
  input.setAttribute('list', 'employer-search-options');
  const options = document.createElement('datalist');
  options.id = 'employer-search-options';
  companySearches.forEach(company => {
    const option = document.createElement('option');
    option.value = company.name;
    options.append(option);
  });
  const button = document.createElement('button');
  button.className = 'button button-primary';
  button.textContent = 'Search';
  form.append(input, options, button);
  form.onsubmit = event => { event.preventDefault(); onSearch(input.value.trim()); };

  const direct = document.createElement('div');
  direct.className = 'external-search';
  const label = document.createElement('span');
  label.textContent = 'Also search directly:';
  const indeed = document.createElement('a');
  indeed.textContent = 'Indeed ↗';
  indeed.target = '_blank';
  indeed.rel = 'noopener noreferrer';
  indeed.setAttribute('aria-label', 'Search jobs on Indeed in a new tab');
  const linkedIn = document.createElement('a');
  linkedIn.textContent = 'LinkedIn ↗';
  linkedIn.target = '_blank';
  linkedIn.rel = 'noopener noreferrer';
  linkedIn.setAttribute('aria-label', 'Search jobs on LinkedIn in a new tab');
  const updateLinks = () => {
    const query = encodeURIComponent(input.value.trim() || 'software developer');
    indeed.href = `https://in.indeed.com/jobs?q=${query}`;
    linkedIn.href = `https://www.linkedin.com/jobs/search/?keywords=${query}`;
  };
  input.addEventListener('input', updateLinks);
  updateLinks();
  direct.append(label, indeed, linkedIn);
  widget.append(form, direct);
  return widget;
}
