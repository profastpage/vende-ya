const fs = require('fs');
const path = require('path');

function removeCard(file) {
    let code = fs.readFileSync(file, 'utf8');
    
    const target = /className="rounded-3xl border border-border bg-card backdrop-blur-xl p-8 shadow-2xl shadow-black\/40"/;
    const replacement = `className="md:rounded-3xl md:border border-border md:bg-card md:backdrop-blur-xl p-6 md:p-8 md:shadow-2xl md:shadow-black/40 pb-32 md:pb-8"`;
    
    if (code.match(target)) {
        code = code.replace(target, replacement);
        fs.writeFileSync(file, code, 'utf8');
        console.log(`Updated ${file}`);
    } else {
        console.log(`Could not find target in ${file}`);
    }
}

removeCard(path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\registro\\page.tsx'));
removeCard(path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\login\\page.tsx'));