const fs = require('fs');
const path = require('path');
const filePath = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\login\\page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. We need to import Script from next/script
if (!content.includes("import Script from 'next/script'")) {
  content = content.replace("import * as React from 'react'", "import * as React from 'react'\nimport Script from 'next/script'");
}

// 2. We need to add the GIS handle credential logic inside LoginContent
const credentialHandler = `
  const handleGoogleCredential = React.useCallback(async (response: any) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.credential,
      })
      if (error) throw error;
      toast({ title: 'Sesión iniciada', description: 'Bienvenido de vuelta a Vende Ya.' });
      router.push(searchParams.get('redirect') || ROUTES.dashboard);
    } catch (err: any) {
      toast({ title: 'Error de Google', description: err.message, variant: 'destructive' });
      setLoading(false);
    }
  }, [supabase, router, searchParams, toast])

  React.useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).google) {
      (window as any).google.accounts.id.initialize({
        client_id: '520579680195-v6loj4ijvqkdt9qk10k2rhkt0tj2gnkp.apps.googleusercontent.com',
        callback: handleGoogleCredential
      });
      (window as any).google.accounts.id.renderButton(
        document.getElementById('google-btn-container'),
        { theme: 'filled_blue', size: 'large', width: 320, text: 'continue_with' }
      );
    }
  }, [handleGoogleCredential])
`;

// wait, supabase client is not in LoginContent directly! It's in useAuth, but useAuth doesn't expose supabase client directly. Let's create browser client.
const importSupabase = `import { createBrowserClient } from '@supabase/ssr'`;
if(!content.includes(importSupabase)) {
  content = content.replace("import { useAuth }", `${importSupabase}\nimport { useAuth }`);
}

const supabaseInstance = `const supabase = React.useMemo(() => createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!), [])`;

content = content.replace(
  /const router = useRouter\(\)/,
  `${supabaseInstance}\n  const router = useRouter()`
);

content = content.replace(
  /const handleOAuth = React\.useCallback\(/,
  `${credentialHandler}\n  const handleOAuth = React.useCallback(`
);

// 3. Replace the GoogleButton component with the container and Script
content = content.replace(
  /<GoogleButton[\s\S]*?disabled=\{loading \|\| oauthProvider !== null\}[\s\S]*?\/>/,
  `<div id="google-btn-container" className="flex justify-center min-h-[44px]"></div>
                  <Script 
                    src="https://accounts.google.com/gsi/client" 
                    strategy="lazyOnload" 
                    onLoad={() => {
                      if (typeof window !== 'undefined' && (window as any).google) {
                        (window as any).google.accounts.id.initialize({
                          client_id: '520579680195-v6loj4ijvqkdt9qk10k2rhkt0tj2gnkp.apps.googleusercontent.com',
                          callback: handleGoogleCredential
                        });
                        (window as any).google.accounts.id.renderButton(
                          document.getElementById('google-btn-container'),
                          { theme: 'outline', size: 'large', type: 'standard', text: 'continue_with', width: '100%' }
                        );
                      }
                    }} 
                  />`
);

fs.writeFileSync(filePath, content, 'utf8');