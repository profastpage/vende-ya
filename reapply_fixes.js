const fs = require('fs');
const path = require('path');

// 1. DASHBOARD
const dashPath = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\dashboard\\page.tsx');
let dashText = fs.readFileSync(dashPath, 'utf8');

dashText = dashText.replace('<div className="min-h-screen bg-background text-foreground dark">', '<div className="min-h-screen bg-background text-foreground">');
dashText = dashText.replace('<div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-br from-amber-400 via-fuchsia-500 to-purple-500 blur-md opacity-60" />', '');
dashText = dashText.replace(/<div className="absolute[^>]*blur-3xl[^>]*\/>/g, '');
dashText = dashText.replace(/<div\s*className="absolute -top-14 -right-14 h-36 w-36 rounded-full blur-3xl opacity-40"\s*style=\{\{ background: colors\.gradient \}\}\s*\/>/g, '');

// Move QuickActions
dashText = dashText.replace(/\s*\{\/\* 🔥🔥🔥 QUICK ACTIONS FOOTER 🔥🔥🔥 \*\/\}\s*<QuickActionsFooter \/>/g, '');
const dashTarget = `        )}

        {/* 🔥🔥🔥 BENTO KPI GRID (stagger entrance) 🔥🔥🔥 */}
        <motion.section`;

// Wait, I need to put it AFTER the KPI Grid, which ends with `</motion.section>`.
// So let's find the FIRST `</motion.section>` in DashboardContent.
let replacedDash = false;
dashText = dashText.replace('</motion.section>', (m) => {
  if (!replacedDash) {
    replacedDash = true;
    return `</motion.section>\n\n        {/* QUICK ACTIONS */}\n        <div className="mt-5 md:mt-6">\n          <QuickActionsFooter />\n        </div>`;
  }
  return m;
});
fs.writeFileSync(dashPath, dashText, 'utf8');


// 2. VENDER
const venderPath = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\vender\\page.tsx');
let venderText = fs.readFileSync(venderPath, 'utf8');

venderText = venderText.replace(/color: 'text-amber-400'/g, "color: 'text-amber-600 dark:text-amber-400'");
venderText = venderText.replace(/bg: 'from-amber-400\/15 to-amber-500\/5'/g, "bg: 'from-amber-200/50 to-amber-100/30 dark:from-amber-400/15 dark:to-amber-500/5'");
venderText = venderText.replace(/color: 'text-fuchsia-400'/g, "color: 'text-fuchsia-600 dark:text-fuchsia-400'");
venderText = venderText.replace(/bg: 'from-fuchsia-400\/15 to-fuchsia-500\/5'/g, "bg: 'from-fuchsia-200/50 to-fuchsia-100/30 dark:from-fuchsia-400/15 dark:to-fuchsia-500/5'");
venderText = venderText.replace(/color: 'text-rose-400'/g, "color: 'text-rose-600 dark:text-rose-400'");
venderText = venderText.replace(/bg: 'from-rose-400\/15 to-rose-500\/5'/g, "bg: 'from-rose-200/50 to-rose-100/30 dark:from-rose-400/15 dark:to-rose-500/5'");
venderText = venderText.replace(/bg-black\/40 text-amber-300/g, 'bg-amber-100 dark:bg-black/40 text-amber-700 dark:text-amber-300');

venderText = venderText.replace('border-amber-400/30 bg-amber-400/10', 'border-amber-200 dark:border-amber-400/30 bg-amber-50 dark:bg-amber-400/10');
venderText = venderText.replace('text-amber-300', 'text-amber-700 dark:text-amber-300');
venderText = venderText.replace('text-amber-200/80', 'text-amber-800 dark:text-amber-200/80');
venderText = venderText.replace('text-amber-200/60', 'text-amber-700 dark:text-amber-200/60');
venderText = venderText.replace('text-amber-200', 'text-amber-900 dark:text-amber-200');
venderText = venderText.replace('bg-amber-400/15 border border-amber-400/30', 'bg-amber-200 dark:bg-amber-400/15 border border-amber-300 dark:border-amber-400/30');
venderText = venderText.replace('<div className="absolute right-[-30px] top-[-30px] w-40 h-40 bg-amber-500/20 blur-3xl rounded-full pointer-events-none" />', '<div className="hidden dark:block absolute right-[-30px] top-[-30px] w-40 h-40 bg-amber-500/20 blur-3xl rounded-full pointer-events-none" />');

const newButton = `
          {/* NATIVE STUDIO CTA */}
          <section className="px-4 md:px-0 mb-6">
            <Link href="/studio" className="w-full relative overflow-hidden bg-gradient-to-r from-rose-500 to-fuchsia-600 rounded-3xl p-6 flex flex-col items-center justify-center text-center group shadow-xl shadow-rose-500/20 active:scale-95 transition-all">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Video className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-white font-black text-2xl tracking-tight mb-1">Transmitir Ahora</h2>
              <p className="text-white/80 font-medium text-sm">Usa la cámara de tu celular. Cero configuración.</p>
            </Link>
          </section>

          {/*`;
          
venderText = venderText.replace('          {/* Mobile compact header */}', newButton + ' Mobile compact header */}');

fs.writeFileSync(venderPath, venderText, 'utf8');

console.log('Restored encoding and reapplied fixes!');