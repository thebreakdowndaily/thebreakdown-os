const fs = require('fs');
const p = "C:\\Users\\nitin\\.gemini\\antigravity\\brain\\ae668bac-917d-488a-8ab8-1c9dbe98c495\\docs\\research\\implementation\\evidence-packet-lock.md";
let c = fs.readFileSync(p, 'utf8');
c = c.replace(/\*\*packetId:\*\* EP-AYO-001\r?\n\s*\*\*packetStatus:\*\* `LOCKED`/, "**packetId:** EP-AYO-001\n  **packetStatus:** `LOCKED WITH SEMANTIC GUARD`");
c = c.replace(/\*\*packetId:\*\* EP-KAI-001A\r?\n\s*\*\*packetStatus:\*\* `LOCKED`/, "**packetId:** EP-KAI-001A\n  **packetStatus:** `PROVISIONALLY_LOCKED — EXACT QUOTE VERIFICATION REQUIRED`");
c = c.replace(/\*\*packetId:\*\* EP-KAI-001B\r?\n\s*\*\*packetStatus:\*\* `LOCKED`/, "**packetId:** EP-KAI-001B\n  **packetStatus:** `PROVISIONALLY_LOCKED — EXACT QUOTE VERIFICATION REQUIRED`");
fs.writeFileSync(p, c);
console.log("Updated packets.");
