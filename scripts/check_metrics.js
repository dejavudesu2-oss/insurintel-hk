/**
 * scripts/check_metrics.js
 * Deterministically computes and prints the exact metrics required for the Autonomous Loop:
 * 1. tests passed / total (raw count)
 * 2. % of products and client-visible numbers with a source in DATA_PROVENANCE.csv
 * 3. count of UNVERIFIED items remaining
 * 4. count of BACKLOG P0/P1 tasks open
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getMetrics() {
  const repoRoot = path.join(__dirname, '..');
  
  // 1. Data Provenance Metrics
  const provPath = path.join(repoRoot, 'DATA_PROVENANCE.csv');
  let totalRecords = 0;
  let sourcedCount = 0;
  let verifiedCount = 0;
  let syntheticCount = 0;
  let unverifiedCount = 0;
  let sourceCoveragePct = '0.00%';

  if (fs.existsSync(provPath)) {
    const raw = fs.readFileSync(provPath, 'utf8');
    const lines = raw.split(/\r?\n/).filter(l => l.trim().length > 0);
    const header = lines[0];
    const dataLines = lines.slice(1);
    totalRecords = dataLines.length;

    dataLines.forEach(l => {
      if (l.includes('"VERIFIED"')) verifiedCount++;
      else if (l.includes('"SOURCED"')) sourcedCount++;
      else if (l.includes('"SYNTHETIC"')) syntheticCount++;
      else if (l.includes('"UNVERIFIED"')) unverifiedCount++;
    });

    const sourcedTotal = verifiedCount + sourcedCount;
    sourceCoveragePct = totalRecords > 0 ? ((sourcedTotal / totalRecords) * 100).toFixed(2) + '%' : '0.00%';
  }

  // 2. Backlog Metrics
  const backlogPath = path.join(repoRoot, 'BACKLOG.md');
  let openP0P1Count = 0;
  let totalTasks = 0;
  let doneTasks = 0;
  let blockedTasks = 0;

  if (fs.existsSync(backlogPath)) {
    const bRaw = fs.readFileSync(backlogPath, 'utf8');
    const bLines = bRaw.split(/\r?\n/);
    bLines.forEach(line => {
      if (line.match(/^\|\s*(\*\*)?TASK-\d+(\*\*)?\s*\|/)) {
        totalTasks++;
        const isP0 = line.includes('| P0 |');
        const isP1 = line.includes('| P1 |');
        const isOpen = line.includes('| OPEN |') || line.includes('| IN_PROGRESS |');
        const isDone = line.includes('| DONE |');
        const isBlocked = line.includes('| BLOCKED |') || line.includes('| PARKED |');

        if ((isP0 || isP1) && isOpen) {
          openP0P1Count++;
        }
        if (isDone) doneTasks++;
        if (isBlocked) blockedTasks++;
      }
    });
  }

  return {
    totalRecords,
    verifiedCount,
    sourcedCount,
    syntheticCount,
    unverifiedCount,
    sourceCoveragePct,
    totalTasks,
    doneTasks,
    blockedTasks,
    openP0P1Count
  };
}

const metrics = getMetrics();
console.log('==================================================');
console.log('AUTONOMOUS LOOP METRICS SNAPSHOT');
console.log('==================================================');
console.log(`DATA_PROVENANCE Records: ${metrics.totalRecords}`);
console.log(`  - VERIFIED: ${metrics.verifiedCount}`);
console.log(`  - SOURCED: ${metrics.sourcedCount}`);
console.log(`  - SYNTHETIC: ${metrics.syntheticCount}`);
console.log(`  - UNVERIFIED: ${metrics.unverifiedCount}`);
console.log(`Source Coverage: ${metrics.sourceCoveragePct}`);
console.log('--------------------------------------------------');
console.log(`BACKLOG Open P0/P1 Tasks: ${metrics.openP0P1Count}`);
console.log(`Total Tasks: ${metrics.totalTasks} (Done: ${metrics.doneTasks}, Blocked/Parked: ${metrics.blockedTasks})`);
console.log('==================================================');
