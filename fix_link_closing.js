const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\MarketplaceGrid.tsx');
let code = fs.readFileSync(file, 'utf8');

// The bottom of the file is currently:
//       </div>
//     </div>
//   )
// }
// We want it to be:
//       </div>
//     </Link>
//   )
// }

code = code.replace(/<\/div>\r?\n\s*\)\r?\n\}/, `</Link>\n  )\n}`);

fs.writeFileSync(file, code, 'utf8');