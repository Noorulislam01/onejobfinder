const indiaPlace = /\b(india|bengaluru|bangalore|mumbai|delhi|new delhi|hyderabad|pune|chennai|kolkata|calcutta|ahmedabad|jaipur|noida|gurugram|gurgaon|kochi|cochin|coimbatore|lucknow|indore|bhopal|chandigarh|nagpur|thiruvananthapuram|trivandrum|visakhapatnam|vizag|mysuru|mysore|surat|vadodara|guwahati|patna|ranchi|bhubaneswar|dehradun|rajkot|ludhiana|faridabad|ghaziabad|nashik|mohali|tiruchirappalli|trichy)\b/i;

export function isIndiaJob(job) {
  if (job.source === 'Jooble' && job.remote) return true;
  return indiaPlace.test(job.location || '');
}
