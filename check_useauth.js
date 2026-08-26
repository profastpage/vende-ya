const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\AuthProvider.tsx');
let text = fs.readFileSync(file, 'utf8');

const regex = /export function useAuth\(\)/;
if (text.match(regex)) {
    console.log("FOUND useAuth");
} else {
    console.log("NOT FOUND useAuth");
}