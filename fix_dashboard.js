const fs = require('fs');
const path = require('path');

const filePath = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\dashboard\\page.tsx');
let text = fs.readFileSync(filePath, 'utf8');

// 1. Remove all injected Quick Actions
const quickActionsRegex = /\s*\{\/\*\s*(?:🔥|\?\?)*\s*QUICK ACTIONS\s*(?:🔥|\?\?)*\s*\*\/\}\s*<div className="mt-5 md:mt-6">\s*<QuickActionsFooter \/>\s*<\/div>/g;
text = text.replace(quickActionsRegex, '');

// 2. Also remove the corrupted one at line 250 with weird characters if any
const corruptedRegex = /\s*\{\/\*.*QUICK ACTIONS FOOTER.*\*\/\}/;
text = text.replace(corruptedRegex, '');

// 3. Find the DashboardContent function, locate the KPI grid, and insert QuickActionsFooter
// The KPI grid ends with `</motion.section>` inside `DashboardContent`.
// Let's find:
//        </motion.section>
//
//        {/* 🔥🔥🔥 2-COL: STREAM ENGINE + WALLET
const targetSpot = `</motion.section>

        {/*`;
        
const replacement = `</motion.section>

        {/* QUICK ACTIONS */}
        <div className="mt-5 md:mt-6">
          <QuickActionsFooter />
        </div>

        {/*`;

// Ensure we only replace the FIRST occurrence (which is inside DashboardContent)
let replaced = false;
text = text.replace(targetSpot, (match) => {
  if (!replaced) {
    replaced = true;
    return replacement;
  }
  return match;
});

fs.writeFileSync(filePath, text, 'utf8');
console.log('Fixed page.tsx');