const fs = require('fs');
const path = require('path');

const filePath = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\dashboard\\page.tsx');
let text = fs.readFileSync(filePath, 'utf8');

// Strip out ALL quick actions footer blocks
const blockRegex = /\s*\{\/\*.*?QUICK ACTIONS.*?\*\/\}\s*<div className="mt-5 md:mt-6">\s*<QuickActionsFooter \/>\s*<\/div>/g;
text = text.replace(blockRegex, '');

// Verify if any are left
if (text.includes('<QuickActionsFooter />')) {
  // It's still there! Wait, the actual component definition function QuickActionsFooter() is in the file.
  // I only want to remove the JSX instantiation: <QuickActionsFooter />
  text = text.replace(/\s*\{\/\*.*?\*\/\}\s*<div className="mt-5 md:mt-6">\s*<QuickActionsFooter \/>\s*<\/div>/g, '');
  text = text.replace(/\s*<div className="mt-5 md:mt-6">\s*<QuickActionsFooter \/>\s*<\/div>/g, '');
}

// Now insert it in DashboardContent exactly after CopyrightReportsCard
// The end of DashboardContent looks like this:
//         {/* 🔥🔥🔥 COPYRIGHT REPORTS (conditional) 🔥🔥🔥 */}
//         {data && data.copyrightReports.length > 0 && (
//           <CopyrightReportsCard reports={data.copyrightReports} />
//         )}
//       </main>
//     </div>
//   )
// }

const target = `        )}`;
const replacement = `        )}

        {/* QUICK ACTIONS */}
        <div className="mt-5 md:mt-6">
          <QuickActionsFooter />
        </div>`;

// We'll replace the first occurrence of this in the file (which is in DashboardContent)
let replaced = false;
text = text.replace(target, (m) => {
  if (!replaced) {
    replaced = true;
    return replacement;
  }
  return m;
});

fs.writeFileSync(filePath, text, 'utf8');
console.log("Cleanup complete");