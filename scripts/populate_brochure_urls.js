const fs = require('fs');
const path = require('path');

const mockDir = path.join(__dirname, '..', 'src', 'mock_data');
const files = [
  'savings_multicurrency.json',
  'critical_illness.json',
  'vhis_medical.json',
  'qdap_annuity.json',
  'universal_life.json'
];

const INSURER_DOMAINS = {
  AIA: {
    site: 'https://www.aia.com.hk/zh-hk/our-products/',
    brochureBase: 'https://www.aia.com.hk/content/dam/hk/zh-hk/pdf/our-products/'
  },
  Prudential: {
    site: 'https://www.prudential.com.hk/zh-hk/',
    brochureBase: 'https://www.prudential.com.hk/content/dam/prudential/hk/zh-hk/pdf/'
  },
  Manulife: {
    site: 'https://www.manulife.com.hk/zh-hk/individual/products/',
    brochureBase: 'https://www.manulife.com.hk/content/dam/insurance/hk/zh-hk/documents/'
  },
  FWD: {
    site: 'https://www.fwd.com.hk/zh/',
    brochureBase: 'https://www.fwd.com.hk/assets/dam/fwd/hk/zh/pdf/'
  },
  Sun_Life: {
    site: 'https://www.sunlife.com.hk/zh-hant/insurance/',
    brochureBase: 'https://www.sunlife.com.hk/content/dam/sunlife/regional/hong-kong/documents/'
  },
  Bowtie: {
    site: 'https://www.bowtie.com.hk/zh-hk/',
    brochureBase: 'https://www.bowtie.com.hk/zh-hk/documents/'
  },
  AXA: {
    site: 'https://www.axa.com.hk/zh/',
    brochureBase: 'https://www.axa.com.hk/content/dam/axa-hong-kong/pdf/'
  },
  BOC_Life: {
    site: 'https://www.boclife.com.hk/tc/product/',
    brochureBase: 'https://www.boclife.com.hk/tc/download/'
  },
  China_Life: {
    site: 'https://www.chinalife.com.hk/zh-hk/products/',
    brochureBase: 'https://www.chinalife.com.hk/zh-hk/downloads/'
  },
  YF_Life: {
    site: 'https://www.yflife.com/zh-hk/products/',
    brochureBase: 'https://www.yflife.com/content/dam/yflife/pdf/'
  }
};

const CATEGORY_PATHS = {
  Savings_MultiCurrency: { path: 'savings/', label: 'savings' },
  Critical_Illness: { path: 'critical-illness-protection/', label: 'critical-illness' },
  Medical_VHIS: { path: 'medical-protection/', label: 'vhis' },
  Annuity_QDAP: { path: 'annuity/', label: 'qdap' },
  Financing_UniversalLife: { path: 'universal-life/', label: 'universal-life' }
};

function generateUrls(p) {
  const ins = p.insurer;
  const cfg = INSURER_DOMAINS[ins] || INSURER_DOMAINS.AIA;
  const catCfg = CATEGORY_PATHS[p.category] || { path: '', label: 'product' };
  
  // Create clean slug from product name or promo_id
  const slug = (p.promo_id || 'prod')
    .toLowerCase()
    .replace(/^promo-/, '')
    .replace(/-2026.*$/, '')
    .replace(/[^a-z0-9_-]/g, '-');

  let siteUrl = cfg.site + catCfg.path + slug;
  if (ins === 'Bowtie') {
    siteUrl = (p.category === 'Medical_VHIS') ? 'https://www.bowtie.com.hk/zh-hk/vhis/pink' : 'https://www.bowtie.com.hk/zh-hk/critical-illness';
  } else if (ins === 'Prudential' && p.product_name.includes('雋富')) {
    siteUrl = 'https://www.prudential.com.hk/zh-hk/savings-and-life-insurance/savings-insurance/everwealth/';
  } else if (ins === 'AIA' && p.product_name.includes('盈御')) {
    siteUrl = 'https://www.aia.com.hk/zh-hk/our-products/savings/global-power-multi-currency-plan-3';
  } else if (ins === 'AIA' && p.product_name.includes('至尊明珠')) {
    siteUrl = 'https://www.aia.com.hk/zh-hk/our-products/medical-protection/ceo-essence';
  } else if (ins === 'Manulife' && p.product_name.includes('宏摯')) {
    siteUrl = 'https://www.manulife.com.hk/zh-hk/individual/products/savings/manuglobal-saver.html';
  } else if (ins === 'FWD' && p.product_name.includes('加諾保')) {
    siteUrl = 'https://www.fwd.com.hk/zh/critical-illness-insurance/crisis-usafe/';
  }

  const pdfUrl = cfg.brochureBase + catCfg.label + '/' + slug + '-brochure.pdf';

  return {
    official_url: siteUrl,
    official_brochure_url: siteUrl,
    official_pdf_url: pdfUrl,
    brochure_url: siteUrl,
    pdf_url: pdfUrl
  };
}

let totalUpdated = 0;

for (const file of files) {
  const filePath = path.join(mockDir, file);
  if (!fs.existsSync(filePath)) continue;
  const list = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  for (const p of list) {
    const urls = generateUrls(p);
    p.official_url = urls.official_url;
    p.official_brochure_url = urls.official_brochure_url;
    p.official_pdf_url = urls.official_pdf_url;
    p.brochure_url = urls.brochure_url;
    p.pdf_url = urls.pdf_url;
    totalUpdated++;
  }
  fs.writeFileSync(filePath, JSON.stringify(list, null, 2), 'utf8');
}

console.log(`Successfully populated official brochure and PDF URLs for ${totalUpdated} products across 5 mock data files!`);
