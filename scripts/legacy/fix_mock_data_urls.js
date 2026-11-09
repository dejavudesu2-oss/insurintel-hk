/**
 * scripts/fix_mock_data_urls.js
 * Corrects misattributed insurer official URLs across mock data catalogs
 * so that no insurer points to a competitor's domain.
 */

const fs = require('fs');
const path = require('path');

const domainMap = {
  HSBC: 'https://www.hsbc.com.hk/zh-hk/insurance/products/',
  Generali: 'https://www.generali.com.hk/zh-hk/our-products/',
  ChinaLife: 'https://www.chinalife.com.hk/zh-hk/products/',
  BlueCross: 'https://www.bluecross.com.hk/zh-hk/products/',
  Cigna: 'https://www.cigna.com.hk/zh-hant/health-insurance/',
  Bupa: 'https://www.bupa.com.hk/zh-hk/individual/health-insurance/',
  Bowtie: 'https://www.bowtie.com.hk/zh-hk/',
  YF_Life: 'https://www.yflife.com/zh-hk/products/',
  BOC_Life: 'https://www.boclife.com.hk/tc/product/',
  Sun_Life: 'https://www.sunlife.com.hk/zh-hant/insurance/',
  AXA: 'https://www.axa.com.hk/zh/',
  FWD: 'https://www.fwd.com.hk/zh/',
  Manulife: 'https://www.manulife.com.hk/zh-hk/individual/products/',
  Prudential: 'https://www.prudential.com.hk/zh-hk/',
  AIA: 'https://www.aia.com.hk/zh-hk/our-products/'
};

const categoryPathMap = {
  Savings_MultiCurrency: 'savings/',
  Critical_Illness: 'critical-illness-protection/',
  Medical_VHIS: 'medical-protection/',
  Annuity_QDAP: 'annuity/',
  Financing_UniversalLife: 'universal-life/'
};

const files = [
  { file: 'savings_multicurrency.json', catKey: 'savings/' },
  { file: 'critical_illness.json', catKey: 'critical-illness/' },
  { file: 'vhis_medical.json', catKey: 'medical/' },
  { file: 'qdap_annuity.json', catKey: 'annuities/' },
  { file: 'universal_life.json', catKey: 'universal-life/' }
];

let totalFixed = 0;

files.forEach(({ file, catKey }) => {
  const filePath = path.join(__dirname, '../src/mock_data', file);
  if (!fs.existsSync(filePath)) return;
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  data.forEach(item => {
    const ins = item.insurer || item.company;
    if (!ins) return;

    // Check if official_url is pointing to wrong insurer
    if (item.official_url && !item.official_url.includes(domainMap[ins] ? new URL(domainMap[ins]).hostname.replace('www.', '') : '')) {
      const slug = item.product_name
        ? item.product_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        : 'plan';
      const base = domainMap[ins] || `https://www.${ins.toLowerCase().replace('_', '')}.com.hk/products/`;
      item.official_url = `${base}${catKey}${slug}`;
      totalFixed++;
    }
  });

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
});

console.log(`Successfully audited and corrected ${totalFixed} misattributed URLs in mock datasets.`);
