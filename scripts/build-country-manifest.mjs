import { readdir, readFile, writeFile } from 'node:fs/promises';

const folder = 'json';
const countries = [];
const countrySites = JSON.parse(await readFile(new URL('./flixpatrol-country-services.json', import.meta.url), 'utf8'));
let injectedServices = 0;
const siteKey = url => { try { return new URL(/^https?:/i.test(url) ? url : `https://${url}`).hostname.toLowerCase().replace(/^www\./, ''); } catch { return url; } };
const languageForCountry = code => { try { return new Intl.Locale(`und-${code}`).maximize().language; } catch { return 'en'; } };
const uniqueSites = sites => { const seen = new Set(); return sites.filter(site => site?.title && /^https?:\/\//i.test(site.country_official_url) && !seen.has(siteKey(site.country_official_url)) && seen.add(siteKey(site.country_official_url))); };
for (const file of await readdir(folder)) {
  if (!file.endsWith('.json') || file === 'manifest.json') continue;
  const payload = JSON.parse(await readFile(`${folder}/${file}`, 'utf8'));
  const compactCountries = (payload.countries || []).map(country => {
    const code = String(country.countryCode || '').toUpperCase();
    const officialUrl = [country.country_official_url, country.countryOfficialUrl, country.official_url, country.officialUrl, payload.country_official_url].find(value => typeof value === 'string' && value.trim());
    const title = country.title || country.country_title || country.country || code;
    const shared = countrySites.shared || {};
    const sites = uniqueSites([...(countrySites.countries?.[code] || countrySites[code] || []), ...(shared.global || []), ...(shared.languages?.[languageForCountry(code)] || []), ...(officialUrl ? [{ title, country_official_url:officialUrl }] : [])]);
    const siteDomains = new Set(sites.map(site => siteKey(site.country_official_url)));
    const records = (country.records || []).filter(record => {
      if (record.isCountryOfficial) return false;
      if (record.category !== 'Top 50') return true;
      const domain = siteKey(record.customParameter);
      if (siteDomains.has(domain)) return false;
      siteDomains.add(domain);
      return true;
    }).map(({ rank, category, customParameter, eventCount }) => ({ rank, category, customParameter, eventCount }));
    records.unshift(...sites.map((site, index) => ({ rank:`official-${index}`, category:'Top 50', title:site.title, country_official_url:site.country_official_url, customParameter:site.country_official_url, eventCount:0, isCountryOfficial:true })));
    injectedServices += sites.length;
    if (code) countries.push({ countryCode:code, file });
    return { countryCode:code, country:country.country || code, ...(title ? { title } : {}), ...(officialUrl ? { country_official_url:officialUrl } : {}), records };
  });
  await writeFile(`${folder}/${file}`, `${JSON.stringify({ countries:compactCountries })}\n`);
}
await writeFile(`${folder}/manifest.json`, `${JSON.stringify({ countries }, null, 2)}\n`);
console.log(`Built ${countries.length} country catalogs; injected ${injectedServices} country streaming services.`);
