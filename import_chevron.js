const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\en-vivo\\[id]\\LiveRoomClient.tsx');
let text = fs.readFileSync(file, 'utf8');

if (!text.includes("ChevronRight")) {
  text = text.replace(/ChevronLeft,/, "ChevronLeft, ChevronRight,");
  if (!text.includes("ChevronRight,")) { // If ChevronLeft wasn't there in a list
    text = text.replace(/import \{([\s\S]*?)\} from 'lucide-react'/, (match, p1) => {
        return `import { ChevronRight, ${p1} } from 'lucide-react'`;
    });
  }
}

fs.writeFileSync(file, text, 'utf8');