import fs from 'fs';

// 1. briefing_generator.ts
let bg = fs.readFileSync('src/engine/briefing_generator.ts', 'utf8');
const bgTarget = '  Bupa: "保柏 (Bupa)"\r\n};';
const bgReplace = '  Bupa: "保柏 (Bupa)",\r\n  HSBC: "滙豐保險 (HSBC Life)",\r\n  HSBC_Life: "滙豐保險 (HSBC Life)",\r\n  Generali: "忠意保險 (Generali)",\r\n  BlueCross: "藍十字 (Blue Cross)",\r\n  ChinaLife: "中國人壽海外 (China Life Overseas)"\r\n};';
if (bg.includes(bgTarget)) {
  bg = bg.replace(bgTarget, bgReplace);
  fs.writeFileSync('src/engine/briefing_generator.ts', bg, 'utf8');
  console.log('briefing_generator.ts updated');
} else {
  console.log('briefing_generator.ts target not found with CRLF, checking LF');
  const bgTargetLF = bgTarget.replace(/\r\n/g, '\n');
  const bgReplaceLF = bgReplace.replace(/\r\n/g, '\n');
  if (bg.includes(bgTargetLF)) {
    bg = bg.replace(bgTargetLF, bgReplaceLF);
    fs.writeFileSync('src/engine/briefing_generator.ts', bg, 'utf8');
    console.log('briefing_generator.ts updated (LF)');
  }
}

// 2. counter_pitch.ts
let cp = fs.readFileSync('src/engine/counter_pitch.ts', 'utf8');
const cpTarget = '      Bupa: ["保柏", "bupa"]\r\n    };';
const cpReplace = '      Bupa: ["保柏", "bupa"],\r\n      HSBC: ["滙豐", "hsbc", "hsbc life"],\r\n      HSBC_Life: ["滙豐", "hsbc", "hsbc life"],\r\n      Generali: ["忠意", "generali"],\r\n      BlueCross: ["藍十字", "blue cross", "bluecross"],\r\n      ChinaLife: ["中國人壽海外", "國壽海外", "china life", "chinalife"]\r\n    };';
if (cp.includes(cpTarget)) {
  cp = cp.replace(cpTarget, cpReplace);
  fs.writeFileSync('src/engine/counter_pitch.ts', cp, 'utf8');
  console.log('counter_pitch.ts updated');
} else {
  const cpTargetLF = cpTarget.replace(/\r\n/g, '\n');
  const cpReplaceLF = cpReplace.replace(/\r\n/g, '\n');
  if (cp.includes(cpTargetLF)) {
    cp = cp.replace(cpTargetLF, cpReplaceLF);
    fs.writeFileSync('src/engine/counter_pitch.ts', cp, 'utf8');
    console.log('counter_pitch.ts updated (LF)');
  }
}

// 3. gemini_pipeline.ts
let gp = fs.readFileSync('src/extractor/gemini_pipeline.ts', 'utf8');
const gpTarget = '    } else if (text.includes("BUPA") || text.includes("保柏")) {\r\n      detectedInsurer = "Bupa";\r\n    } else if (text.includes("AIA") || text.includes("友邦") || text.includes("盈御")) {';
const gpReplace = '    } else if (text.includes("BUPA") || text.includes("保柏")) {\r\n      detectedInsurer = "Bupa";\r\n    } else if (text.includes("HSBC") || text.includes("滙豐") || text.includes("汇丰")) {\r\n      detectedInsurer = "HSBC";\r\n    } else if (text.includes("GENERALI") || text.includes("忠意")) {\r\n      detectedInsurer = "Generali";\r\n    } else if (text.includes("BLUE CROSS") || text.includes("BLUECROSS") || text.includes("藍十字") || text.includes("蓝十字")) {\r\n      detectedInsurer = "BlueCross";\r\n    } else if (text.includes("CHINA LIFE") || text.includes("CHINALIFE") || text.includes("中國人壽") || text.includes("中国人寿") || text.includes("國壽海外") || text.includes("国寿海外")) {\r\n      detectedInsurer = "ChinaLife";\r\n    } else if (text.includes("AIA") || text.includes("友邦") || text.includes("盈御")) {';
if (gp.includes(gpTarget)) {
  gp = gp.replace(gpTarget, gpReplace);
  fs.writeFileSync('src/extractor/gemini_pipeline.ts', gp, 'utf8');
  console.log('gemini_pipeline.ts updated');
} else {
  const gpTargetLF = gpTarget.replace(/\r\n/g, '\n');
  const gpReplaceLF = gpReplace.replace(/\r\n/g, '\n');
  if (gp.includes(gpTargetLF)) {
    gp = gp.replace(gpTargetLF, gpReplaceLF);
    fs.writeFileSync('src/extractor/gemini_pipeline.ts', gp, 'utf8');
    console.log('gemini_pipeline.ts updated (LF)');
  }
}
