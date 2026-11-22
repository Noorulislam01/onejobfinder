import {categorizeJob} from './jobCategorizer.js';
function plainText(value){const parsed=new DOMParser().parseFromString(String(value||''),'text/html');return (parsed.body.textContent||'').replace(/\s+/g,' ').trim();}
export function normalizeJob(raw,source='Other') {
  const description=plainText(raw.description||raw.snippet||'');
  const location=String(raw.location||raw.candidate_required_location||'Not specified');
  const type=String(raw.contract_type||raw.employment_type||raw.job_type||raw.type||'').replaceAll('_',' ');
  const title=String(raw.title||raw.position||'Untitled role');
  const sourceUrl=String(raw.url||raw.job_url||raw.link||'');
  return {id:String(raw.id||raw.job_id||`${source}-${title}-${raw.company||''}`),title,company:String(raw.company||raw.company_name||'Company not specified'),location,description,category:categorizeJob({title,description:`${description} ${(raw.tags||[]).join(' ')} ${raw.category||''}`}),experienceMin:Number.isFinite(raw.experience_min)?raw.experience_min:null,experienceMax:Number.isFinite(raw.experience_max)?raw.experience_max:null,salaryMin:Number.isFinite(raw.salary_min)?raw.salary_min:null,salaryMax:Number.isFinite(raw.salary_max)?raw.salary_max:null,salaryText:String(raw.salary||''),employmentType:type,remote:source==='Remote OK'||raw.remote===true||/remote|worldwide/i.test(`${location} ${title}`),source,sourceUrl,applicationUrl:String(raw.apply_url||sourceUrl||raw.redirect_url||''),postedAt:raw.created||raw.posted_at||raw.publication_date||raw.date||'',fetchedAt:new Date().toISOString(),isActive:true};
}
