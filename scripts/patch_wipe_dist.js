const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'tests', 'adversarial_challenge_r2_2.ts');
let content = fs.readFileSync(filePath, 'utf8');

const target = 'if (file === "morning_assembly_deck.pptx" || file === "screenshots" || file === "waitlist.html") continue;';
const replacement = 'if (file === "morning_assembly_deck.pptx" || file === "screenshots" || file === "waitlist.html" || file === "sw.js") continue;';

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully patched wipeDist in tests/adversarial_challenge_r2_2.ts to preserve sw.js');
} else {
  console.log('Target not found in tests/adversarial_challenge_r2_2.ts');
}
