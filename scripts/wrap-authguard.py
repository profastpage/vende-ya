#!/usr/bin/env python3
"""Wrap protected pages with AuthGuard — robust version."""
import re
from pathlib import Path

PAGES = [
    '/home/z/my-project/src/app/notificaciones/page.tsx',
    '/home/z/my-project/src/app/mensajes/page.tsx',
    '/home/z/my-project/src/app/configuracion/page.tsx',
    '/home/z/my-project/src/app/pagos/page.tsx',
    '/home/z/my-project/src/app/envios/page.tsx',
]

for path in PAGES:
    p = Path(path)
    content = p.read_text()

    # First, strip any existing broken AuthGuard additions
    content = content.replace("\n    </AuthGuard>\n\n  </AuthGuard>\n  )\n}", "\n  )\n}")
    content = content.replace("\n    </AuthGuard>\n  )\n}", "\n  )\n}")
    content = content.replace("\n  </AuthGuard>\n  )\n}", "\n  )\n}")
    # Remove the import if present
    content = content.replace("\nimport { AuthGuard } from '@/components/vendeda/AuthGuard'", "")

    # Now find the FIRST `  return (\n    <AppShell` after the default export function declaration
    # and insert `<AuthGuard>` before `<AppShell`. Then find the matching `</AppShell>` and
    # add `</AuthGuard>` after it.

    # Find the default export function and the first return ( after it
    m = re.search(r'(export default function \w+Page\([^)]*\)\s*\{)', content)
    if not m:
        print(f"FAIL {p.name}: no default export found")
        continue
    fn_start = m.end()
    # Find the FIRST `  return (` after fn_start
    return_match = re.search(r'\n  return \(\n', content[fn_start:])
    if not return_match:
        print(f"FAIL {p.name}: no return ( found")
        continue
    return_idx = fn_start + return_match.end()
    # Insert <AuthGuard> right after the return (
    content = content[:return_idx] + '    <AuthGuard>\n' + content[return_idx:]

    # Now find the matching `  )\n}` (the LAST one in the file is the function close)
    # Search from the end backwards
    last_close = content.rfind('\n  )\n}')
    if last_close < 0:
        print(f"FAIL {p.name}: no closing ) found")
        continue
    # Insert </AuthGuard> before the closing )
    content = content[:last_close] + '\n    </AuthGuard>\n  )\n}' + content[last_close + len('\n  )\n}'):]

    # Add the import after the AppShell import
    content = content.replace(
        "import { AppShell, type Breadcrumb } from '@/components/vendeda/AppShell'",
        "import { AppShell, type Breadcrumb } from '@/components/vendeda/AppShell'\nimport { AuthGuard } from '@/components/vendeda/AuthGuard'",
    )

    p.write_text(content)
    print(f"OK {p.name}")
