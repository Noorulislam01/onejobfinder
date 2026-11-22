const read=key=>{try{return JSON.parse(localStorage.getItem(key)||'[]');}catch{return [];}};
export const getSavedJobs=()=>read('techjob:saved');
export const saveJob=job=>{const jobs=getSavedJobs();if(!jobs.some(item=>item.id===job.id))localStorage.setItem('techjob:saved',JSON.stringify([...jobs,job]));};
export const removeSavedJob=id=>localStorage.setItem('techjob:saved',JSON.stringify(getSavedJobs().filter(job=>job.id!==id)));
export const getTheme=()=>localStorage.getItem('techjob:theme')||'light';
export const setTheme=theme=>localStorage.setItem('techjob:theme',theme);
