const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\vender\\page.tsx');
let text = fs.readFileSync(file, 'utf8');
const searchString = 'switch (step)';
const index = text.indexOf(searchString);
if(index !== -1) {
  console.log(text.substring(index - 50, index + 2000));
} else {
  const index2 = text.indexOf('if (step ===');
  if (index2 !== -1) {
    console.log(text.substring(index2 - 50, index2 + 2000));
  } else {
    console.log("Could not find step logic");
  }
}