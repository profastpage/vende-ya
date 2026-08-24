const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\page.tsx');
let text = fs.readFileSync(file, 'utf8');

const replacement = `  // If no live streams exist yet, show a clean fallback
  const displayFeed = feed.length > 0 ? feed : [
    {
      id: 'empty',
      videoUrl: 'https://via.placeholder.com/1080x1920',
      thumbnailUrl: 'https://via.placeholder.com/1080x1920',
      seller: { displayName: 'Vende Ya Oficial' },
      description: '¡Pronto más streams en vivo!',
      likes: 0,
      comments: 0,
      shares: 0,
      liveComments: []
    }
  ]

  return (
    <div className="bg-background w-full h-full">
      <SocialVideoFeed feed={displayFeed} />
    </div>
  )
}`;

text = text.replace(/  \/\/ If no live streams exist yet in the database, show a fallback array[\s\S]*\}\n$/, replacement);
fs.writeFileSync(file, text, 'utf8');
console.log('Removed xqc mock data from homepage');