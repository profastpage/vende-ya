const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\dashboard\\page.tsx');
let text = fs.readFileSync(file, 'utf8');

// 1. Fix ventasHoy
text = text.replace(
    /ventasHoy\.toLocaleString\('es-PE'\)/g,
    "(ventasHoy || 0).toLocaleString('es-PE')"
);

// 2. Fix espectadoresHoy
text = text.replace(
    /espectadoresHoy\.toLocaleString\('es-PE'\)/g,
    "(espectadoresHoy || 0).toLocaleString('es-PE')"
);

// 3. Fix followerCount, salesCount, rating
text = text.replace(
    /\{user\.followerCount\.toLocaleString\('es-PE'\)\}/g,
    "{(user?.followerCount || 0).toLocaleString('es-PE')}"
);
text = text.replace(
    /\{user\.salesCount\}/g,
    "{user?.salesCount || 0}"
);
text = text.replace(
    /\{user\.rating\.toFixed\(1\)\}/g,
    "{(user?.rating || 0).toFixed(1)}"
);

// 4. Reputation Card: fix ratingsCount
text = text.replace(
    /\{user\?\.ratingsCount \|\| 0\} calificaciones/g,
    "{(user?.ratingsCount || 0)} calificaciones"
);

// Write changes
fs.writeFileSync(file, text, 'utf8');
console.log('Fixed toLocaleString crashes');