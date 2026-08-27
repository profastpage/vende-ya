const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[username]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

text = text.replace(
  /PowerOff, ChevronLeft, ChevronRight, Flame, Eye, Heart, Share2, ShoppingBag,/,
  "PowerOff, ChevronLeft, ChevronRight, Flame, Eye, EyeOff, Heart, Share2, ShoppingBag,"
);

fs.writeFileSync(file, text, 'utf8');