const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\page.tsx');

const content = `import { db } from '@/lib/db'
import LiveHubClient from './LiveHubClient'

export const dynamic = 'force-dynamic'

export default async function LivePage() {
  let streams = []
  try {
    // Fetch all active/scheduled streams from DB
    streams = await db.liveStream.findMany({
      where: {
        // We fetch live and scheduled to populate the 'upcoming' tab if needed.
        status: { in: ['live', 'scheduled'] }
      },
      include: {
        seller: true
      },
      orderBy: { createdAt: 'desc' }
    })
  } catch (error) {
    console.error('Failed to fetch live streams', error)
  }

  // Ensure 'isLive' flag matches 'status === live' just in case
  const formattedStreams = streams.map(s => ({
    ...s,
    isLive: s.status === 'live' || s.isLive
  }))

  return <LiveHubClient initialStreams={formattedStreams} />
}
`;

fs.writeFileSync(file, content, 'utf8');
console.log('Created new page.tsx Server Component');