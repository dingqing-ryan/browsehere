import { readdir, readFile, writeFile } from 'node:fs/promises';

const folder = 'json';
const countries = [];
const countrySites = JSON.parse(await readFile(new URL('./flixpatrol-country-services.json', import.meta.url), 'utf8'));
let injectedServices = 0;
for (const file of await readdir(folder)) {
  if (!file.endsWith('.json') || file === 'manifest.json') continue;
  const payload = JSON.parse(await readFile(`${folder}/${file}`, 'utf8'));
  const compactCountries = (payload.countries || []).map(country => {
    const code = String(country.countryCode || '').toUpperCase();
    const officialUrl = [country.country_official_url, country.countryOfficialUrl, country.official_url, country.officialUrl, payload.country_official_url].find(value => typeof value === 'string' && value.trim());
    const title = country.title || country.country_title || country.country || code;
    const records = (country.records || []).filter(record => !record.isCountryOfficial).map(({ rank, category, customParameter, eventCount }) => ({ rank, category, customParameter, eventCount }));
    const sites = countrySites[code] || (officialUrl ? [{ title, country_official_url:officialUrl }] : []);
    records.unshift(...sites.map((site, index) => ({ rank:`official-${index}`, category:'Top 50', title:site.title, country_official_url:site.country_official_url, customParameter:site.country_official_url, eventCount:0, isCountryOfficial:true })));
    injectedServices += sites.length;
    if (code) countries.push({ countryCode:code, file });
    return { countryCode:code, country:country.country || code, ...(title ? { title } : {}), ...(officialUrl ? { country_official_url:officialUrl } : {}), records };
  });
  await writeFile(`${folder}/${file}`, `${JSON.stringify({ countries:compactCountries })}\n`);
}
await writeFile(`${folder}/manifest.json`, `${JSON.stringify({ countries }, null, 2)}\n`);
console.log(`Built ${countries.length} country catalogs; injected ${injectedServices} country streaming services.`);
