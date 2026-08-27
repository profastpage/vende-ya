const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\dashboard\\page.tsx');
let text = fs.readFileSync(file, 'utf8');

const typeReplace = /interface SellerDashboardData \{[\s\S]*?summary: \{/;
text = text.replace(typeReplace, `interface SellerDashboardData {
  wallet: {
    id: string;
    gatewaySellerId: string;
    isVerified: boolean;
    status: string;
  };
  escrow: {
    id: string;
    availableBalance: number;
    frozenBalance: number;
    payouts: any[];
  };
  summary: {`);

// Order type needs `status` so we can render action buttons.
text = text.replace(/recentOrders: Array<\{/, `recentOrders: Array<{
    status: string;`);

// Replace the KPI values for Escrow
text = text.replace(/title="Fondos Retenidos"[\s\S]*?value=\{formatPEN\(data\.summary\.pendingEscrow\)\}/, `title="Saldo Retenido (Escrow)"
                value={formatPEN(data.escrow.frozenBalance)}`);

text = text.replace(/title="Total Neto Ganado"[\s\S]*?value=\{formatPEN\(data\.summary\.totalNet\)\}/, `title="Disponible para Retiro"
                value={formatPEN(data.escrow.availableBalance)}`);

// We want to add a button for withdrawal under "Disponible para Retiro"
text = text.replace(/(title="Disponible para Retiro"[\s\S]*?value=\{formatPEN\(data\.escrow\.availableBalance\)\}[\s\S]*?subtitle=".*?")[^]*?(icon=\{<Wallet className="h-4 w-4 text-emerald-400" \/>\}\s*\/>)/, 
  `$1 action={
                  <button onClick={() => alert("Retiro en desarrollo")} className="mt-2 w-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 py-1.5 rounded-lg hover:bg-emerald-500/30 transition-colors">Retirar Fondos</button>
                } $2`);
                
// Add 'action' prop to KPIBlock
text = text.replace(/function KPIBlock\(\{ title, value, subtitle, icon, highlight = false \}: \{.*?\}\) \{/, 
  `function KPIBlock({ title, value, subtitle, icon, highlight = false, action }: { title: string; value: string; subtitle: string; icon: React.ReactNode; highlight?: boolean; action?: React.ReactNode }) {`);
text = text.replace(/<p className="text-xs text-muted-foreground mt-2">\{subtitle\}<\/p>\n\s*<\/div>/, 
  `<p className="text-xs text-muted-foreground mt-2">{subtitle}</p>
      {action}
    </div>`);


fs.writeFileSync(file, text, 'utf8');