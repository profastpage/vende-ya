const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\dashboard\\page.tsx');
let text = fs.readFileSync(file, 'utf8');

// 1. Remove MOCK_PROFILES import
text = text.replace(/import \{ MOCK_PROFILES \} from '@\/lib\/vendeda\/mock-data'\r?\n/, '');

// 2. Fix the user fallback logic
text = text.replace(
    /const user: Profile = authUser\s*\?\s*\{[\s\S]*?\:\s*MOCK_PROFILES\[5\]/,
    `const user: Profile = authUser as Profile`
);

// 3. Fix KPI values to not use 1247
text = text.replace(/const ventasHoy = data\?\.summary\?\.totalSales \?\? 1247/, 'const ventasHoy = data?.summary?.totalSales ?? 0');
text = text.replace(/const ingresosDelta = '\+18% mes'/, 'const ingresosDelta = "0% mes"');
text = text.replace(/const subastasActivas = 3/, 'const subastasActivas = 0');

// 4. Fix RecentOrdersCard mocks
const mockOrdersRegex = /const MOCK_ORDERS: RecentOrder\[\] = \[[^\]]*\]\r?\n/;
text = text.replace(mockOrdersRegex, '');
text = text.replace(/const list = orders\.length > 0 \? orders\.slice\(0, 6\) : MOCK_ORDERS/, 'const list = orders;');
// Replace the map of list inside RecentOrdersCard
text = text.replace(
    /\{list\.map\(\(o\) => \{/,
    `{list.length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground border border-dashed border-border rounded-xl">
                Aún no tienes órdenes. ¡Empieza a vender/comprar!
              </div>
            ) : list.map((o) => {`
);

// 5. Fix ShalomDropoffCard mocks
text = text.replace(/const mockRows: ShipmentRow\[\] = \[[\s\S]*?\]\r?\n/, '');
text = text.replace(/const rows = realRows\.length > 0 \? realRows\.slice\(0, 6\) : mockRows/, 'const rows = realRows;');
text = text.replace(
    /\{rows\.map\(\(row, i\) => \(/,
    `{rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-sm text-muted-foreground border-t border-dashed border-border">
                    No tienes envíos pendientes.
                  </td>
                </tr>
              ) : rows.map((row, i) => (`
);

// 6. Add ReputationCard
const reputationCard = `
function ReputationCard({ user, reviews }: { user: Profile; reviews: any[] }) {
  return (
    <motion.div
      {...SECTION_MOTION}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
      className="relative overflow-hidden rounded-3xl bg-card/80 border border-border backdrop-blur-xl p-5 md:p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="rounded-xl p-2 bg-muted border border-border">
          <Heart className="h-4 w-4 text-rose-400" />
        </div>
        <div>
          <h3 className="text-base font-black text-foreground">Reputación</h3>
        </div>
      </div>
      
      <div className="flex items-center gap-4 mb-4 p-4 rounded-xl bg-muted border border-border">
        <div className="text-4xl font-black text-foreground">{user?.rating?.toFixed(1) || '0.0'}</div>
        <div className="flex flex-col">
          <div className="flex text-amber-400 text-lg">
            {'★'.repeat(Math.round(user?.rating || 0))}{'☆'.repeat(5 - Math.round(user?.rating || 0))}
          </div>
          <span className="text-xs text-muted-foreground">{user?.ratingsCount || 0} calificaciones</span>
        </div>
      </div>

      <div className="space-y-3">
        {(!reviews || reviews.length === 0) ? (
          <div className="text-center py-4 text-xs text-muted-foreground border border-dashed border-border rounded-xl">
            Aún no tienes reseñas.
          </div>
        ) : reviews.map((r: any) => (
          <div key={r.id} className="p-3 rounded-xl bg-background border border-border text-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-foreground">{r.reviewer?.displayName}</span>
              <span className="text-amber-400 text-xs">{'★'.repeat(r.rating)}</span>
            </div>
            <p className="text-muted-foreground text-xs">{r.comment}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
`;

// Inject ReputationCard below RecentOrdersCard
text = text.replace(
    /<ActivityFeed \/>/,
    `<ReputationCard user={user} reviews={data?.reviews ?? []} />\n          <ActivityFeed />`
);

if (!text.includes('function ReputationCard')) {
    text += '\n' + reputationCard;
}

fs.writeFileSync(file, text, 'utf8');
console.log('Cleaned up mocks and added ReputationCard');