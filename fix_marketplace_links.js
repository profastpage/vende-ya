const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\MarketplaceGrid.tsx');
let code = fs.readFileSync(file, 'utf8');

const target = `<div className="group flex flex-col cursor-pointer">`;
const replacement = `<Link href={\`/productos/\${product.id}\`} className="group flex flex-col cursor-pointer block">`;
code = code.replace(target, replacement);

const targetClose = `    </div>
  )
}`;
const replacementClose = `    </Link>
  )
}`;
code = code.replace(targetClose, replacementClose);

fs.writeFileSync(file, code, 'utf8');