const fs = require('fs');
const path = require('path');

// Update API Route
const apiFile = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\api\\seller\\dashboard\\route.ts');
let api = fs.readFileSync(apiFile, 'utf8');

if (!api.includes('notifications = await db.notification.findMany')) {
    api = api.replace(
        /const reviews = await db\.review\.findMany\(\{[\s\S]*?\}\);/,
        `const reviews = await db.review.findMany({
    where: { revieweeId: sellerId },
    include: { reviewer: true },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  const notifications = await db.notification.findMany({
    where: { userId: sellerId },
    orderBy: { createdAt: 'desc' },
    take: 6
  });`
    );
    api = api.replace(
        /reviews,\r?\n\s*\}\);/,
        `reviews,\n      notifications,\n    });`
    );
    fs.writeFileSync(apiFile, api, 'utf8');
}

// Update Dashboard Page
const pageFile = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\dashboard\\page.tsx');
let page = fs.readFileSync(pageFile, 'utf8');

// Remove ACTIVITY_ITEMS const
page = page.replace(/type ActivityItem = \{[\s\S]*?\}\r?\n/, '');
page = page.replace(/const ACTIVITY_ITEMS: ActivityItem\[\] = \[[\s\S]*?\]\r?\n/, '');

// Fix ActivityFeed definition
page = page.replace(/function ActivityFeed\(\) \{/, 'function ActivityFeed({ notifications }: { notifications: any[] }) {');
page = page.replace(/<ActivityFeed \/>/, '<ActivityFeed notifications={data?.notifications ?? []} />');

// Rewrite internal of ActivityFeed
const oldFeed = /\{ACTIVITY_ITEMS\.map\(\(item, i\) => \{[\s\S]*?\}\)\s*\}\s*<\/div>/;
const newFeed = `{(!notifications || notifications.length === 0) ? (
            <div className="text-center py-6 text-sm text-muted-foreground border border-dashed border-border rounded-xl">
              No hay actividad aún.
            </div>
          ) : notifications.map((item: any, i: number) => {
            return (
              <div
                key={i}
                className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-muted transition-colors"
              >
                <div className="rounded-lg p-1.5 bg-muted border border-border shrink-0">
                  <Bell className="h-4 w-4 text-fuchsia-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground leading-snug">{item.title}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{item.body || ''}</p>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0 mt-1">
                  {item.createdAt ? timeAgoEs(new Date(item.createdAt)) : ''}
                </span>
              </div>
            )
          })}
        </div>`;
page = page.replace(oldFeed, newFeed);

fs.writeFileSync(pageFile, page, 'utf8');
console.log('Fixed ActivityFeed to use real notifications with empty states');