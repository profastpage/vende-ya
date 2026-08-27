const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace vendeya.pe -> vendeya.live
  content = content.replace(/vendeya\.pe/g, 'vendeya.live');
  // Replace vende-ya-phi.vercel.app -> vendeya.live
  content = content.replace(/vende-ya-phi\.vercel\.app/g, 'vendeya.live');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function walkSync(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkSync(fullPath);
    } else {
      if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.json')) {
        replaceInFile(fullPath);
      }
    }
  }
}

walkSync(path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src'));