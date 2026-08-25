const https = require('https');
https.get('https://player.twitch.tv/?channel=mrgozustrike&parent=vende-ya-phi.vercel.app', (res) => {
  console.log('Headers:', res.headers['content-security-policy']);
});