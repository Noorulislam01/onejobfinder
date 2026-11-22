export const isSafeUrl=value=>{try{return ['https:','http:'].includes(new URL(value).protocol);}catch{return false;}};
