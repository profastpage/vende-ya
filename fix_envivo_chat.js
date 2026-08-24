const fs = require('fs');
const path = require('path');

const filePath = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\page.tsx');
let text = fs.readFileSync(filePath, 'utf8');

// Replace the entire chat array to be safe
const oldChatRegex = /const INITIAL_CHAT: ChatMessage\[\] = \[\s*\{[\s\S]*?\]/m;
const newChat = `const INITIAL_CHAT: ChatMessage[] = [
  { id: '1', username: 'María', text: '¡Mío! Reservo talla M en terracota 🔥', color: 'text-amber-400' },
  { id: '2', username: 'YaBot AI', text: 'Quedan 25 unidades en stock. Envío a todo Perú desde S/.8 🚚', color: 'text-purple-400', isBot: true },
  { id: '3', username: 'Diego', text: 'S/. 38! 🔥 voy por más', color: 'text-sky-400' },
  { id: '4', username: 'Carla', text: 'Yape listo, ¿aceptan Plin también?', color: 'text-lime-400' },
  { id: '5', username: 'YaBot AI', text: 'Sí Carla, aceptamos Yape, Plin y tarjeta. Pago 100% protegido 💖', color: 'text-purple-400', isBot: true },
]`;
text = text.replace(oldChatRegex, newChat);

const oldEmojisRegex = /const LIVE_EMOJIS = \[\s*\{[\s\S]*?\] as const/m;
const newEmojis = `const LIVE_EMOJIS = [
  { id: 'fire',      char: '🔥', label: 'Fuego'    },
  { id: 'lightning', char: '⚡', label: 'Trueno'   },
  { id: 'heart',     char: '💖', label: 'Corazón'  },
  { id: 'clap',      char: '👏', label: 'Aplauso'  },
  { id: 'star',      char: '🌟', label: 'Estrella' },
] as const`;
text = text.replace(oldEmojisRegex, newEmojis);

// Fix isolated corrupted characters (be very specific to avoid replacing code!)
text = text.replace(/username: 'T[^']+'/g, "username: 'Tú'");
text = text.replace(/Envo desde/g, "Envío desde");
text = text.replace(/instantneo/g, "instantáneo");
text = text.replace(/mǭs compacto/g, "más compacto");
text = text.replace(/Mo!/g, "¡Mío!");
text = text.replace(/Perǧ/g, "Perú");
text = text.replace(/crculo/g, "círculo");

// Fix bottom console comment
text = text.replace(/Bottom console mǭs compacto/g, "Bottom console más compacto");

fs.writeFileSync(filePath, text, 'utf8');
console.log('Fixed chat, emojis, and specific strings');