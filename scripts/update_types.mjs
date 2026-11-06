import fs from 'fs';

let content = fs.readFileSync('src/types/insurance.ts', 'utf8');

const target1 = '  | "Cigna"\r\n  | string;';
const replace1 = '  | "Cigna"\r\n  | "HSBC"\r\n  | "HSBC_Life"\r\n  | "Generali"\r\n  | "BlueCross"\r\n  | "ChinaLife"\r\n  | string;';

const target2 = '  audit_metadata: {\r\n    source_type: "Official_Circular" | "Broker_Notice" | "Social_Media" | "Crowd_Upload";\r\n    confidence_level: "Verified" | "Provisional" | "Under_Review";\r\n    verified_by_editor: boolean;\r\n    created_at: string;\r\n  };';
const replace2 = '  clause_highlights?: string[];\r\n  clause_pitfalls?: string[];\r\n  last_updated?: string;\r\n\r\n  audit_metadata: {\r\n    source_type: "Official_Circular" | "Broker_Notice" | "Social_Media" | "Crowd_Upload";\r\n    confidence_level: "Verified" | "Provisional" | "Under_Review";\r\n    verified_by_editor: boolean;\r\n    created_at: string;\r\n    official_source_attribution?: string;\r\n  };';

if (!content.includes(target1)) {
  console.error('target1 not found');
  process.exit(1);
}
if (!content.includes(target2)) {
  console.error('target2 not found');
  process.exit(1);
}

content = content.replace(target1, replace1).replace(target2, replace2);
fs.writeFileSync('src/types/insurance.ts', content, 'utf8');
console.log('src/types/insurance.ts successfully updated');
