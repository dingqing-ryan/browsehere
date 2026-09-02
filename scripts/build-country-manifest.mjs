import { readdir, readFile, writeFile } from 'node:fs/promises';

const folder = 'json';
const countries = [];
for (const file of await readdir(folder)) {
  if (!file.endsWith('.json') || file === 'manifest.json') continue;
  const payload = JSON.parse(await readFile(`${folder}/${file}`, 'utf8'));
  for (const country of payload.countries || []) {
    if (country.countryCode) countries.push({ countryCode:String(country.countryCode).toUpperCase(), file });
  }
}
await writeFile(`${folder}/manifest.json`, `${JSON.stringify({ countries }, null, 2)}\n`);
