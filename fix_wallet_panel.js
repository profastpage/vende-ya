const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\dashboard\\page.tsx');
let text = fs.readFileSync(file, 'utf8');

// 1. Fix the useAuth import
text = text.replace(/import \{ useSession \} from '@\/components\/vendeda\/AuthProvider'/, '');

// 2. Add the state right after "function WalletPanel({"
text = text.replace(
  /function WalletPanel\(\{/,
  `function WalletPanel({\n  const [showPayout, setShowPayout] = React.useState(false);\n  const { user } = useAuth() as { user: any };\n  // DUMMY COMMENT TO FIX ARGUMENTS`
);
// Wait, that's not right. The arguments are after the open parenthesis.

text = text.replace(
  /function WalletPanel\([^\{]*\{[\s\S]*?\}\) \{/,
  `$&
  const [showPayout, setShowPayout] = React.useState(false);
  const { user } = useAuth() as { user: any };
`
);

fs.writeFileSync(file, text, 'utf8');