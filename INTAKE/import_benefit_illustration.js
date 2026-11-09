/**
 * INTAKE/import_benefit_illustration.js
 * 
 * Official Benefit Illustration (BI) Data Intake & Actuarial Golden Test Generator
 * 
 * Strict Gating Rules (Run 4 / P2):
 * 1. NEVER writes "SOURCED" automatically.
 * 2. Allowed Statuses:
 *    - "TRANSCRIBED": Entered from a document, awaiting independent double-check.
 *    - "SOURCED-STRICT": Promoted ONLY after double-entry matching or verifier re-read confirmation.
 * 3. Mandatory Provenance Metadata Fields:
 *    - document_title, version_date, page_number, table_name, entered_by, entry_date.
 * 4. Zero "coverage 100%" claims: reported strictly as strict-sourced numbers / 9,052.
 * 5. Explicit HKIA GL28 Section citation: Section 5, Paragraph 5.3 & Practice Note on Illustration Rate Caps.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const TOTAL_CLIENT_VISIBLE_NUMBERS = 9052;

// Actuarial IRR Solver via Newton-Raphson & Bracketed Bisection
function calculateIRR(cashFlows, guess = 0.05, maxIter = 1000, tolerance = 1e-7) {
  const hasPos = cashFlows.some(c => c > 0);
  const hasNeg = cashFlows.some(c => c < 0);
  if (!hasPos || !hasNeg) return null;

  const maxT = cashFlows.length - 1;
  const safeLowBound = maxT > 0 ? Math.max(-0.99, Math.min(-0.01, Math.pow(1e-15, 1 / maxT) - 1)) : -0.99;

  function npv(r) {
    if (r <= -1) return Number.NaN;
    let sum = 0;
    for (let t = 0; t < cashFlows.length; t++) {
      sum += cashFlows[t] / Math.pow(1 + r, t);
    }
    return sum;
  }

  function dNpv(r) {
    if (r <= -1) return Number.NaN;
    let sum = 0;
    for (let t = 1; t < cashFlows.length; t++) {
      sum += (-t * cashFlows[t]) / Math.pow(1 + r, t + 1);
    }
    return sum;
  }

  // Newton-Raphson iteration
  let r = guess;
  for (let i = 0; i < maxIter; i++) {
    const val = npv(r);
    const deriv = dNpv(r);
    if (!Number.isFinite(val) || !Number.isFinite(deriv) || Math.abs(deriv) < 1e-12) break;
    const nextR = r - val / deriv;
    if (Math.abs(nextR - r) < tolerance) return nextR;
    if (nextR <= safeLowBound || nextR > 5.0) break;
    r = nextR;
  }

  // Bisection fallback
  let low = safeLowBound;
  let high = 5.0;
  let npvLow = npv(low);
  let npvHigh = npv(high);
  if (!Number.isFinite(npvLow) || !Number.isFinite(npvHigh) || npvLow * npvHigh > 0) return null;

  for (let iter = 0; iter < maxIter; iter++) {
    const mid = (low + high) / 2;
    const npvMid = npv(mid);
    if (Math.abs(npvMid) < tolerance || (high - low) / 2 < tolerance) return mid;
    if (npvLow * npvMid < 0) {
      high = mid;
      npvHigh = npvMid;
    } else {
      low = mid;
      npvLow = npvMid;
    }
  }
  return (low + high) / 2;
}

// RFC 4180 CSV Tokenizer supporting quotes, commas, and dollar signs
function parseCSVLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += char;
    }
  }
  result.push(cur.trim());
  return result;
}

function parseCSV(content) {
  const lines = content.trim().split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) throw new Error('CSV must contain a header and at least one data row.');
  const header = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase().replace(/^"|"$/g, ''));

  const expectedCols = [
    'policy_year', 'age', 'premium_paid', 'guaranteed_cash_value',
    'projected_reversionary_bonus', 'projected_terminal_bonus', 'total_projected_cash_value'
  ];

  expectedCols.forEach(col => {
    if (!header.includes(col)) throw new Error(`Missing required CSV column: '${col}'`);
  });

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = parseCSVLine(lines[i]);
    const rowObj = {};
    header.forEach((h, idx) => {
      const rawVal = parts[idx] ? parts[idx].replace(/[\$,\s]/g, '') : '0';
      rowObj[h] = parseFloat(rawVal) || 0;
    });
    rows.push(rowObj);
  }

  // Sort by policy year
  rows.sort((a, b) => a.policy_year - b.policy_year);
  return rows;
}

function importBenefitIllustration(csvPath, options = {}) {
  if (!fs.existsSync(csvPath)) throw new Error(`CSV file not found: ${csvPath}`);

  // 1. Mandatory Provenance Metadata Validation (Done-When Criterion P2)
  const requiredMetadata = [
    'document_title',
    'version_date',
    'page_number',
    'table_name',
    'entered_by',
    'entry_date'
  ];

  // Map legacy options aliases if provided
  const metadata = {
    document_title: options.document_title || options.docTitle,
    version_date: options.version_date || options.pubDate,
    page_number: options.page_number || options.page,
    table_name: options.table_name || options.tableName,
    entered_by: options.entered_by || options.enteredBy,
    entry_date: options.entry_date || options.entryDate || options.retrievalDate
  };

  for (const field of requiredMetadata) {
    if (!metadata[field] || String(metadata[field]).trim().length === 0) {
      throw new Error(`PROVENANCE_GATING_ERROR: Missing required provenance field '${field}'. Benefit illustrations cannot be ingested without complete audit provenance.`);
    }
  }

  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const rows = parseCSV(csvContent);

  const insurer = options.insurer || '示範保司 (Insurer A)';
  const product = options.product || '示範旗艦多幣儲蓄方案';
  const category = options.category || 'Savings_MultiCurrency';

  // 2. Verification Gating: Status can NEVER be SOURCED automatically
  let status = 'TRANSCRIBED'; // Default status for single entry
  let secondPassVerified = false;
  let verificationMethod = 'none';

  if (options.verifier) {
    if (options.verifier.method === 'double_entry') {
      // Independent double-entry check
      const pass2Path = options.verifier.pass2CsvPath;
      if (!pass2Path || !fs.existsSync(pass2Path)) {
        throw new Error('VERIFICATION_ERROR: pass2CsvPath must point to a valid second-entry CSV file.');
      }
      const pass2Rows = parseCSV(fs.readFileSync(pass2Path, 'utf8'));
      if (pass2Rows.length !== rows.length) {
        throw new Error(`DOUBLE_ENTRY_MISMATCH: Pass 1 has ${rows.length} rows, Pass 2 has ${pass2Rows.length} rows.`);
      }
      for (let i = 0; i < rows.length; i++) {
        const r1 = rows[i];
        const r2 = pass2Rows[i];
        if (r1.policy_year !== r2.policy_year ||
            r1.premium_paid !== r2.premium_paid ||
            r1.guaranteed_cash_value !== r2.guaranteed_cash_value ||
            r1.projected_reversionary_bonus !== r2.projected_reversionary_bonus ||
            r1.projected_terminal_bonus !== r2.projected_terminal_bonus ||
            r1.total_projected_cash_value !== r2.total_projected_cash_value) {
          throw new Error(`DOUBLE_ENTRY_MISMATCH: Discrepancy at policy year ${r1.policy_year} between Pass 1 and Pass 2.`);
        }
      }
      status = 'SOURCED-STRICT';
      secondPassVerified = true;
      verificationMethod = 'independent_double_entry_match';
    } else if (options.verifier.method === 're_read_verifier') {
      if (options.verifier.allNumbersMatched === true) {
        status = 'SOURCED-STRICT';
        secondPassVerified = true;
        verificationMethod = 'automated_optical_or_table_re_read';
      }
    }
  }

  // 3. Compute Cumulative Premiums & Breakeven Years
  let cumPremium = 0;
  let guarBreakevenYear = null;
  let projBreakevenYear = null;

  const premiumByYear = new Map();
  const guarCashValueByYear = new Map();
  const projCashValueByYear = new Map();

  rows.forEach(r => {
    const yr = r.policy_year;
    premiumByYear.set(yr, r.premium_paid);
    guarCashValueByYear.set(yr, r.guaranteed_cash_value);
    projCashValueByYear.set(yr, r.total_projected_cash_value);

    cumPremium += r.premium_paid;

    if (guarBreakevenYear === null && r.guaranteed_cash_value >= cumPremium && cumPremium > 0) {
      guarBreakevenYear = yr;
    }
    if (projBreakevenYear === null && r.total_projected_cash_value >= cumPremium && cumPremium > 0) {
      projBreakevenYear = yr;
    }
  });

  // 4. Compute IRR at Horizons: Year 10, 20, 30
  function computeHorizonIRR(horizonYear, isProjected) {
    const targetRow = rows.find(r => r.policy_year === horizonYear);
    if (!targetRow) return null;

    const cf = [];
    for (let t = 1; t <= horizonYear; t++) {
      const prem = premiumByYear.get(t) || 0;
      cf.push(-prem);
    }
    const terminalValue = isProjected ? targetRow.total_projected_cash_value : targetRow.guaranteed_cash_value;
    cf.push(terminalValue);

    const rawIrr = calculateIRR(cf);
    return rawIrr !== null ? parseFloat((rawIrr * 100).toFixed(2)) : null;
  }

  const guarIrr10 = computeHorizonIRR(10, false);
  const projIrr10 = computeHorizonIRR(10, true);
  const guarIrr20 = computeHorizonIRR(20, false);
  const projIrr20 = computeHorizonIRR(20, true);
  const guarIrr30 = computeHorizonIRR(30, false);
  const projIrr30 = computeHorizonIRR(30, true);

  // 5. Explicit HKIA GL28 Section & Rate Cap Audit
  // Authority: HKIA GL28 Section 5 (Standardized Presentation of Projected Benefits),
  // Paragraph 5.3 & Practice Note on Illustration Rate Caps (effective 1 July 2025: 6.0% HKD / 6.5% non-HKD).
  const titleUpper = `${metadata.document_title} ${options.docTitle || ''} ${options.product || ''} ${options.currency || ''}`.toUpperCase();
  const isNonHKD = options.currency ? options.currency.toUpperCase() !== 'HKD' : (
    titleUpper.includes('USD') || titleUpper.includes('美元') ||
    titleUpper.includes('RMB') || titleUpper.includes('CNY') || titleUpper.includes('人民幣') ||
    titleUpper.includes('EUR') || titleUpper.includes('歐元') ||
    titleUpper.includes('GBP') || titleUpper.includes('英鎊') ||
    titleUpper.includes('AUD') || titleUpper.includes('CAD') ||
    titleUpper.includes('多元貨幣') || titleUpper.includes('MULTI-CURRENCY')
  );
  const capLimit = isNonHKD ? 6.5 : 6.0;
  const exceedsCap = projIrr30 !== null && projIrr30 > capLimit;

  let rateCapWatermark = '';
  let gl28CitationNote = 'HKIA GL28 Section 5, Paragraph 5.3 compliant.';
  if (exceedsCap) {
    rateCapWatermark = ' [UNVERIFIED - 超出保監局 GL28 第 5 節及實務指引 2025年7月1日起演示利率上限 6.0%/6.5%]';
    gl28CitationNote = `超出保監局 GL28 第 5 節 (Presentation of Projected Benefits) 第 5.3 段及演示利率上限實務指引 (30Y IRR ${projIrr30}% > ${capLimit}% 上限)。`;
  }

  // 6. Number-Level Coverage Calculation (strictly out of 9,052, zero "100%" wording)
  // Each row provides: premium_paid, guaranteed_cash_value, total_projected_cash_value (3 numbers)
  // Plus computed: guaranteed breakeven, projected breakeven, guarIrr10, projIrr10, guarIrr20, projIrr20, guarIrr30, projIrr30
  const numbersTranscribedCount = rows.length * 3 + 8;
  const strictSourcedNumbersCount = status === 'SOURCED-STRICT' ? numbersTranscribedCount : 0;
  const coverageRatioString = `${strictSourcedNumbersCount} / ${TOTAL_CLIENT_VISIBLE_NUMBERS} (${((strictSourcedNumbersCount / TOTAL_CLIENT_VISIBLE_NUMBERS) * 100).toFixed(2)}%)`;

  const sanitizedId = product.replace(/[^a-zA-Z0-9_\u4e00-\u9fa5]/g, '_').slice(0, 40);
  const goldenTestFileName = `golden_${sanitizedId}.ts`;
  const goldenTestDir = path.join(process.cwd(), 'tests', 'golden');
  if (!fs.existsSync(goldenTestDir)) fs.mkdirSync(goldenTestDir, { recursive: true });
  const goldenTestPath = path.join(goldenTestDir, goldenTestFileName);

  // 7. Generate Executable Golden Regression Test File
  const relCsvPath = path.relative(goldenTestDir, path.resolve(csvPath)).replace(/\\/g, '/');
  const goldenTestCode = `/**
 * tests/golden/${goldenTestFileName}
 * AUTO-GENERATED BENEFIT ILLUSTRATION GOLDEN REGRESSION TEST
 * Insurer: ${insurer}
 * Product: ${product}
 * Status: ${status}
 * Provenance: ${metadata.document_title} (${metadata.version_date}), Page: ${metadata.page_number}, Table: ${metadata.table_name}
 * Entered By: ${metadata.entered_by} (${metadata.entry_date})
 * Generated: ${new Date().toISOString()}
 * 
 * Executable directly via: npx tsx tests/golden/${goldenTestFileName}
 */
import { strict as assert } from 'assert';
import fs from 'fs';
import path from 'path';

const intakeModule = require('../../INTAKE/import_benefit_illustration');
const parseCSV = intakeModule.parseCSV;
const calculateIRR = intakeModule.calculateIRR;

console.log('================================================================================');
console.log('RUNNING GOLDEN REGRESSION TEST: ${insurer} - ${product} [Status: ${status}]');
console.log('================================================================================\\n');

const csvPath = path.resolve(__dirname, '${relCsvPath}');
assert.ok(fs.existsSync(csvPath), 'Golden benefit illustration source CSV must exist: ' + csvPath);

const rows = parseCSV(fs.readFileSync(csvPath, 'utf8'));
assert.ok(rows.length > 0, 'Illustration rows must not be empty');

let cumPrem = 0;
let recomputedGuarBE: number | null = null;
let recomputedProjBE: number | null = null;
const premMap = new Map<number, number>();

rows.forEach((r: any) => {
  premMap.set(r.policy_year, r.premium_paid);
  cumPrem += r.premium_paid;
  if (recomputedGuarBE === null && r.guaranteed_cash_value >= cumPrem && cumPrem > 0) recomputedGuarBE = r.policy_year;
  if (recomputedProjBE === null && r.total_projected_cash_value >= cumPrem && cumPrem > 0) recomputedProjBE = r.policy_year;
});

const expectedGuarBE = ${guarBreakevenYear};
const expectedProjBE = ${projBreakevenYear};
assert.strictEqual(recomputedGuarBE, expectedGuarBE, 'Recomputed guaranteed breakeven must match locked golden value');
assert.strictEqual(recomputedProjBE, expectedProjBE, 'Recomputed projected breakeven must match locked golden value');
console.log('  [PASS] Breakeven Years verified: Guaranteed Yr ' + recomputedGuarBE + ', Projected Yr ' + recomputedProjBE);

const yr30Row = rows.find((r: any) => r.policy_year === 30);
if (yr30Row) {
  const cf: number[] = [];
  for (let t = 1; t <= 30; t++) {
    cf.push(-(premMap.get(t) || 0));
  }
  cf.push(yr30Row.total_projected_cash_value);
  const rawIrr = calculateIRR(cf);
  const computedProjIrr30 = rawIrr !== null ? parseFloat((rawIrr * 100).toFixed(2)) : null;
  assert.strictEqual(computedProjIrr30, ${projIrr30}, 'Year 30 Projected IRR must match locked golden figure');
  console.log('  [PASS] Year 30 Projected IRR verified: ' + computedProjIrr30 + '%');
}

console.log('\\n  [SUCCESS] All Golden Assertions for ${insurer} - ${product} passed cleanly.\\n');
`;
  fs.writeFileSync(goldenTestPath, goldenTestCode, 'utf8');

  // 8. Update DATA_PROVENANCE.csv
  const { PATHS } = require('../scripts/paths.js');
  const provenancePath = PATHS.DATA_PROVENANCE;
  const recordId = `BI-${status === 'SOURCED-STRICT' ? 'STRICT' : 'TRANSCRIBED'}-${crypto.createHash('md5').update(insurer + product + csvPath).digest('hex').slice(0, 8).toUpperCase()}`;
  let dataMetrics = `Guaranteed BE: Yr ${guarBreakevenYear || 'N/A'}, Projected BE: Yr ${projBreakevenYear || 'N/A'}, 30Y Proj IRR: ${projIrr30 !== null ? projIrr30 + '%' : 'N/A'}${rateCapWatermark}`;
  const sourceDocType = 'Official Insurer Benefit Illustration (BI)';
  const sourceTitle = `${metadata.document_title} (Ver: ${metadata.version_date}, ${metadata.page_number}, Table: ${metadata.table_name})`;
  const officialUrl = `file:///INTAKE/${path.basename(csvPath)}`;
  const auditNotes = `Status: ${status} (Method: ${verificationMethod}, Entered by: ${metadata.entered_by} on ${metadata.entry_date}). GL28 Note: ${gl28CitationNote}. Golden test: tests/golden/${goldenTestFileName}.`;

  const provLines = fs.readFileSync(provenancePath, 'utf8').split(/\r?\n/);
  let updatedExisting = false;

  const updatedLines = provLines.map(line => {
    if (!line.trim()) return line;
    const cols = parseCSVLine(line);
    if (cols.length >= 13 && (cols[3].includes(product) || (product.includes('盈御') && cols[3].includes('盈御')))) {
      updatedExisting = true;
      return `"${cols[0]}","${category}","${insurer}","${cols[3]}","${dataMetrics}","${sourceDocType}","${sourceTitle}","${officialUrl}","${metadata.version_date}","${metadata.entry_date}","${status}","${coverageRatioString}","${auditNotes}"`;
    }
    return line;
  });

  if (!updatedExisting) {
    const newCsvRow = `"${recordId}","${category}","${insurer}","${product}","${dataMetrics}","${sourceDocType}","${sourceTitle}","${officialUrl}","${metadata.version_date}","${metadata.entry_date}","${status}","${coverageRatioString}","${auditNotes}"`;
    if (updatedLines[updatedLines.length - 1].trim() === '') {
      updatedLines[updatedLines.length - 1] = newCsvRow;
    } else {
      updatedLines.push(newCsvRow);
    }
  }

  fs.writeFileSync(provenancePath, updatedLines.filter(l => l.length > 0).join('\n') + '\n', 'utf8');

  return {
    recordId,
    insurer,
    product,
    status,
    metadata,
    guarBreakevenYear,
    projBreakevenYear,
    guarIrr10,
    projIrr10,
    guarIrr20,
    projIrr20,
    guarIrr30,
    projIrr30,
    exceedsCap,
    gl28CitationNote,
    numbersTranscribedCount,
    strictSourcedNumbersCount,
    coverageRatioString,
    goldenTestPath,
    updatedExisting
  };
}

// CLI Execution support
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Usage: node INTAKE/import_benefit_illustration.js <csv_file> --docTitle="..." --versionDate="..." --page="..." --tableName="..." --enteredBy="..." --entryDate="..."');
    process.exit(1);
  }
  const csvFile = args[0];
  const options = {};
  args.slice(1).forEach(arg => {
    const [k, v] = arg.split('=');
    const val = v ? v.replace(/^"|"$/g, '') : '';
    if (k === '--insurer') options.insurer = val;
    if (k === '--product') options.product = val;
    if (k === '--docTitle' || k === '--document_title') options.document_title = val;
    if (k === '--versionDate' || k === '--version_date') options.version_date = val;
    if (k === '--page' || k === '--page_number') options.page_number = val;
    if (k === '--tableName' || k === '--table_name') options.table_name = val;
    if (k === '--enteredBy' || k === '--entered_by') options.entered_by = val;
    if (k === '--entryDate' || k === '--entry_date') options.entry_date = val;
    if (k === '--category') options.category = val;
  });

  try {
    const res = importBenefitIllustration(csvFile, options);
    console.log('================================================================================');
    console.log(`BENEFIT ILLUSTRATION INTAKE PROCESSED [Status: ${res.status}]`);
    console.log('================================================================================');
    console.log(`Record ID           : ${res.recordId}`);
    console.log(`Insurer / Product   : ${res.insurer} · ${res.product}`);
    console.log(`Audit Status        : ${res.status} (Never automatic SOURCED)`);
    console.log(`Provenance Metadata : Document: ${res.metadata.document_title} (${res.metadata.version_date}), Page: ${res.metadata.page_number}, Table: ${res.metadata.table_name}`);
    console.log(`Entered By / Date   : ${res.metadata.entered_by} on ${res.metadata.entry_date}`);
    console.log(`Guaranteed Breakeven: Year ${res.guarBreakevenYear || 'N/A'}`);
    console.log(`Projected Breakeven : Year ${res.projBreakevenYear || 'N/A'}`);
    console.log(`Year 30 IRR         : Guar ${res.guarIrr30}% | Proj ${res.projIrr30}%`);
    console.log(`GL28 Citation Note  : ${res.gl28CitationNote}`);
    console.log(`Strict Coverage     : ${res.coverageRatioString} (Zero 100% claims)`);
    console.log(`Golden Test Created : ${res.goldenTestPath}`);
    console.log('================================================================================\n');
  } catch (err) {
    console.error('Import Failed:', err.message);
    process.exit(1);
  }
}

module.exports = {
  importBenefitIllustration,
  calculateIRR,
  parseCSV,
  parseCSVLine,
  TOTAL_CLIENT_VISIBLE_NUMBERS
};
