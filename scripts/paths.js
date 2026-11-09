/**
 * scripts/paths.js
 * Single source of truth for repository document and data paths (Run 5 U1).
 */

const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');

const PATHS = {
  REPO_ROOT,

  // Root files (kept at root)
  README: path.join(REPO_ROOT, 'README.md'),
  HANDOFF: path.join(REPO_ROOT, 'HANDOFF.md'),
  COST_MODEL: path.join(REPO_ROOT, 'cost_model.json'),
  DATA_PROVENANCE: path.join(REPO_ROOT, 'DATA_PROVENANCE.csv'),

  // docs/owner/
  HUMAN_AUDIT_KIT: path.join(REPO_ROOT, 'docs', 'owner', 'HUMAN_AUDIT_KIT.md'),
  INTERVIEW_LOG: path.join(REPO_ROOT, 'docs', 'owner', 'INTERVIEW_LOG.csv'),

  // docs/business/
  SINGLE_SOURCE_OF_TRUTH_PRICING: path.join(REPO_ROOT, 'docs', 'business', 'SINGLE_SOURCE_OF_TRUTH_PRICING.md'),
  SINGLE_LAUNCH_OFFER: path.join(REPO_ROOT, 'docs', 'business', 'SINGLE_LAUNCH_OFFER.md'),
  PILOT_PLAN_14_DAYS: path.join(REPO_ROOT, 'docs', 'business', 'PILOT_PLAN_14_DAYS.md'),
  VALIDATION_PLAN_AND_INTERVIEW_SCRIPT: path.join(REPO_ROOT, 'docs', 'business', 'VALIDATION_PLAN_AND_INTERVIEW_SCRIPT.md'),

  // docs/legal/
  LEGAL_BRIEF_HK_COMPLIANCE: path.join(REPO_ROOT, 'docs', 'legal', 'LEGAL_BRIEF_HK_COMPLIANCE.md'),
  LEGAL_BRIEF_CITATION_AUDIT: path.join(REPO_ROOT, 'docs', 'legal', 'LEGAL_BRIEF_CITATION_AUDIT.md'),

  // docs/sales/
  MORNING_ASSEMBLY_PACK_AND_RUNSHEET: path.join(REPO_ROOT, 'docs', 'sales', 'MORNING_ASSEMBLY_PACK_AND_RUNSHEET.md'),

  // docs/audit/
  EVIDENCE_TABLE: path.join(REPO_ROOT, 'docs', 'audit', 'EVIDENCE_TABLE.md'),
  RUN3_CLOSEOUT: path.join(REPO_ROOT, 'docs', 'audit', 'RUN3_CLOSEOUT.md'),
  SCREENSHOT_REVIEW: path.join(REPO_ROOT, 'docs', 'audit', 'SCREENSHOT_REVIEW.md'),
  SCREENSHOT_ASSERTIONS: path.join(REPO_ROOT, 'docs', 'audit', 'SCREENSHOT_ASSERTIONS.txt'),
  SKEPTIC_COUNCIL_REVIEW: path.join(REPO_ROOT, 'docs', 'audit', 'SKEPTIC_COUNCIL_REVIEW.md'),
  TEST_RUN_RAW: path.join(REPO_ROOT, 'docs', 'audit', 'TEST_RUN_RAW.txt'),
  FIX_LOG_AND_TEST_RESULTS: path.join(REPO_ROOT, 'docs', 'audit', 'FIX_LOG_AND_TEST_RESULTS.md'),

  // docs/loop/
  BACKLOG: path.join(REPO_ROOT, 'docs', 'loop', 'BACKLOG.md'),
  LOOP_STATE: path.join(REPO_ROOT, 'docs', 'loop', 'LOOP_STATE.md'),
  LOOP_LOG: path.join(REPO_ROOT, 'docs', 'loop', 'LOOP_LOG.md'),
  NEEDS_FROM_OWNER: path.join(REPO_ROOT, 'docs', 'loop', 'NEEDS_FROM_OWNER.md'),
  BLOCKED: path.join(REPO_ROOT, 'docs', 'loop', 'BLOCKED.md'),

  // docs/archive/superseded/
  ARCHIVE_SUPERSEDED_DIR: path.join(REPO_ROOT, 'docs', 'archive', 'superseded'),
  EXECUTIVE_COMPREHENSIVE_MASTER_REPORT: path.join(REPO_ROOT, 'docs', 'archive', 'superseded', 'EXECUTIVE_COMPREHENSIVE_MASTER_REPORT.md'),
  FINAL_COUNCIL_REPORT: path.join(REPO_ROOT, 'docs', 'archive', 'superseded', 'FINAL_COUNCIL_REPORT.md'),
  FULL_AUDIT_AND_COMMERCIAL_MASTER_REPORT: path.join(REPO_ROOT, 'docs', 'archive', 'superseded', 'FULL_AUDIT_AND_COMMERCIAL_MASTER_REPORT.md'),
  INSURINTEL_COMMERCIAL_MASTER_REPORT: path.join(REPO_ROOT, 'docs', 'archive', 'superseded', 'INSURINTEL_COMMERCIAL_MASTER_REPORT.md'),
  COMMERCIALIZATION_AND_PRODUCT_PERFECTION_PLAN: path.join(REPO_ROOT, 'docs', 'archive', 'superseded', 'COMMERCIALIZATION_AND_PRODUCT_PERFECTION_PLAN.md'),
  MORNING_ASSEMBLY_PACK: path.join(REPO_ROOT, 'docs', 'archive', 'superseded', 'MORNING_ASSEMBLY_PACK.md'),
  MULTIAGENT_REVIEW_COMMENTS_AND_IMPROVEMENT_REPORT: path.join(REPO_ROOT, 'docs', 'archive', 'superseded', 'MULTIAGENT_REVIEW_COMMENTS_AND_IMPROVEMENT_REPORT.md'),
  DEPLOY_MERGE_PLAN: path.join(REPO_ROOT, 'docs', 'archive', 'superseded', 'DEPLOY_MERGE_PLAN.md'),
  INSURINTEL_IMPROVEMENT_ROADMAP_100: path.join(REPO_ROOT, 'docs', 'archive', 'superseded', 'INSURINTEL_IMPROVEMENT_ROADMAP_100.md'),
  SIMULATION_100_DAILY_SCENARIOS_REPORT: path.join(REPO_ROOT, 'docs', 'archive', 'superseded', 'SIMULATION_100_DAILY_SCENARIOS_REPORT.md')
};

module.exports = { PATHS, ...PATHS, default: PATHS };
