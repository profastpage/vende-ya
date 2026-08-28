const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\LiveHubClient.tsx');
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/import \{ DynamicHubPlayer \} from '@\/components\/vendeda\/DynamicLivePlayer';\r?\n/, '');

fs.writeFileSync(file, code, 'utf8');