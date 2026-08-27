const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\dashboard\\page.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(/function WalletPanel\(\{[\s\S]*?\}\) \{/, `function WalletPanel({
  wallet,
  summary,
  escrow,
  isLoading,
  error,
}: {
  wallet: WalletInfo | null
  summary: SellerDashboardData['summary'] | null
  escrow: SellerDashboardData['escrow'] | null
  isLoading: boolean
  error: string | null
}) {`);

text = text.replace(/<WalletPanel[\s\S]*?\/>/, `<WalletPanel
              wallet={data?.wallet ?? null}
              summary={data?.summary ?? null}
              escrow={data?.escrow ?? null}
              isLoading={isLoading}
              error={error}
            />`);

text = text.replace(/formatPEN\(data\.escrow\.availableBalance\)/g, `formatPEN(escrow?.availableBalance || 0)`);
text = text.replace(/formatPEN\(data\.escrow\.frozenBalance\)/g, `formatPEN(escrow?.frozenBalance || 0)`);
text = text.replace(/data\.escrow\.availableBalance > 0/g, `escrow && escrow.availableBalance > 0`);

fs.writeFileSync(file, text, 'utf8');