const fs = require('fs');
const path = require('path');
const file = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\prisma\\schema.prisma');
let text = fs.readFileSync(file, 'utf8');

const chatModel = `
// ---------------------------------------------------------------------
// CHAT MESSAGES
// ---------------------------------------------------------------------
model ChatMessage {
  id        String   @id @default(cuid())
  streamId  String
  userId    String?  // nullable for anonymous
  username  String
  text      String
  color     String?
  isBot     Boolean  @default(false)
  createdAt DateTime @default(now())

  stream    LiveStream @relation(fields: [streamId], references: [id], onDelete: Cascade)
}
`;

text += chatModel;

text = text.replace(
    /auctions        Auction\[\]/,
    `auctions        Auction[]
  chatMessages    ChatMessage[]`
);

fs.writeFileSync(file, text, 'utf8');
console.log('Added ChatMessage model to Prisma');