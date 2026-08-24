const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\vender\\actions.ts');
let text = fs.readFileSync(file, 'utf8');

const newLogic = `
  try {
    // 0. Ensure Profile exists to prevent Foreign Key constraints
    let profile = await db.profile.findUnique({ where: { id: user.id } });
    if (!profile) {
      // Try to find by authId just in case
      profile = await db.profile.findUnique({ where: { authId: user.id } });
    }
    
    if (!profile) {
      // Create a default profile on the fly
      profile = await db.profile.create({
        data: {
          id: user.id, // Force ID to match Supabase for easier relations
          authId: user.id,
          username: \`user_\${user.id.substring(0,8)}\`,
          displayName: user.email?.split('@')[0] || 'Usuario',
        }
      });
    }

    // 1. Create dummy product for the stream
`;

text = text.replace(/  try \{\n    \/\/ 1\. Create dummy product for the stream/, newLogic.trim() + '\n');
fs.writeFileSync(file, text, 'utf8');
console.log('Fixed profile creation in actions.ts');