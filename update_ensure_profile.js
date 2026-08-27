const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\api\\auth\\ensure-profile\\route.ts');
let text = fs.readFileSync(file, 'utf8');

const regex = /\/\/ --------------------------------------------------------------\n\s*\/\/ 1\. Asegurar perfil\n\s*\/\/ --------------------------------------------------------------\n\s*try \{[\s\S]*?\/\/ --------------------------------------------------------------\n\s*\/\/ 2\. Asegurar seller_wallet/g;

const replacement = `// --------------------------------------------------------------
  // 1. Asegurar perfil (PRISMA Profile + profiles)
  // --------------------------------------------------------------
  try {
    const { data: userData } = await admin.auth.admin.getUserById(user.id)
    const meta = userData?.user?.user_metadata ?? {}
    const rawEmail = userData?.user?.email ?? user.email ?? ''

    const displayName =
      meta?.full_name ||
      meta?.name ||
      meta?.display_name ||
      meta?.user_name ||
      (rawEmail ? rawEmail.split('@')[0] : 'Usuario')

    const avatarUrl = meta?.avatar_url || meta?.picture || meta?.photo || null
    const email = rawEmail

    let username = (meta?.username || (email ? email.split('@')[0] : 'user'))
      .toLowerCase()
      .replace(/[^a-z0-9_.-]/g, '')
      .slice(0, 30)
    if (!username) username = 'user'

    // Update Prisma Profile directly!
    await db.profile.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        authId: user.id,
        username: username,
        displayName: displayName,
        avatarUrl: avatarUrl,
      },
      update: {
        displayName: displayName,
        avatarUrl: avatarUrl,
      }
    });

    results.profile = 'updated'
  } catch (e: any) {
    results.profile = 'error'
    results.error = \`profile: \${e?.message ?? String(e)}\`
  }

  // --------------------------------------------------------------
  // 2. Asegurar seller_wallet`;

text = text.replace(regex, replacement);
fs.writeFileSync(file, text, 'utf8');