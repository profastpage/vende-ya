const fs = require('fs');
const path = require('path');

// 1. Update Schema
const schemaFile = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\prisma\\schema.prisma');
let schema = fs.readFileSync(schemaFile, 'utf8');
if (!schema.includes('isLiveOnly')) {
    schema = schema.replace(
        /shippingCost Float   @default\(0\)/,
        `shippingCost Float   @default(0)\n  isLiveOnly   Boolean @default(false)`
    );
    fs.writeFileSync(schemaFile, schema, 'utf8');
    console.log('Updated schema.prisma');
}

// 2. Update actions.ts
const actionsFile = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\vender\\actions.ts');
let actions = fs.readFileSync(actionsFile, 'utf8');
if (!actions.includes('isLiveOnly: true')) {
    actions = actions.replace(
        /stock: 1,/,
        `stock: 1,\n          isLiveOnly: true,`
    );
    fs.writeFileSync(actionsFile, actions, 'utf8');
    console.log('Updated actions.ts');
}

// 3. Update marketplace/page.tsx
const mpFile = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\marketplace\\page.tsx');
let mp = fs.readFileSync(mpFile, 'utf8');
if (!mp.includes('isLiveOnly: false')) {
    mp = mp.replace(
        /where: \{ status: 'active' \}/,
        `where: { status: 'active', isLiveOnly: false }`
    );
    fs.writeFileSync(mpFile, mp, 'utf8');
    console.log('Updated marketplace/page.tsx');
}