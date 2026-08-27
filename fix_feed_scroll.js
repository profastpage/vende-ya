const fs = require('fs');
const path = require('path');

// 1. Fix page.tsx
const pageFile = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\page.tsx');
let pageText = fs.readFileSync(pageFile, 'utf8');

pageText = pageText.replace(
  /<main className="w-full h-\[100dvh\] bg-black">/g,
  `<main className="w-full h-[calc(100dvh-152px)] md:h-[calc(100dvh-64px)] bg-black overflow-hidden flex flex-col">`
);

pageText = pageText.replace(
  /<div className="flex w-full h-\[100dvh\] items-center justify-center text-white\/50 text-sm p-4 text-center">/g,
  `<div className="flex w-full h-full items-center justify-center text-white/50 text-sm p-4 text-center">`
);

fs.writeFileSync(pageFile, pageText, 'utf8');

// 2. Fix SocialVideoFeed.tsx
const feedFile = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\SocialVideoFeed.tsx');
let feedText = fs.readFileSync(feedFile, 'utf8');

feedText = feedText.replace(
  /<div className="flex w-full h-\[100dvh\] bg-background text-foreground overflow-hidden">/g,
  `<div className="flex w-full h-full bg-background text-foreground overflow-hidden">`
);

feedText = feedText.replace(
  /className="relative w-full md:w-auto h-\[100dvh\] md:h-\[calc\(100vh-64px\)\] snap-center snap-always flex justify-center shrink-0 md:py-4"/g,
  `className="relative w-full md:w-auto h-full snap-center snap-always flex justify-center shrink-0 md:py-4"`
);

// 3. Prevent overscroll and fix snap container touch events
feedText = feedText.replace(
  /<div className="flex-1 w-full h-full snap-y snap-mandatory overflow-y-scroll no-scrollbar relative flex flex-col items-center">/g,
  `<div className="flex-1 w-full h-full snap-y snap-mandatory overflow-y-auto overscroll-none no-scrollbar relative flex flex-col items-center touch-pan-y">`
);

fs.writeFileSync(feedFile, feedText, 'utf8');

// 4. Fix layout.tsx body to prevent bounce
const layoutFile = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\app\\layout.tsx');
let layoutText = fs.readFileSync(layoutFile, 'utf8');
layoutText = layoutText.replace(
  /antialiased bg-background text-foreground min-h-screen flex flex-col/,
  `antialiased bg-background text-foreground h-[100dvh] flex flex-col overflow-hidden overscroll-none`
);
layoutText = layoutText.replace(
  /<main className="flex-1 w-full pt-14 md:pt-16 pb-24 md:pb-0 bg-background text-foreground">/,
  `<main className="flex-1 w-full pt-14 md:pt-16 pb-24 md:pb-0 bg-background text-foreground overflow-y-auto overscroll-none">`
);
// Write to LayoutClientWrapper instead since it has the main tag
const wrapperFile = path.join('C:\\dev\\CLIENTES\\VENDE YA\\vende-ya-main\\src\\components\\vendeda\\LayoutClientWrapper.tsx');
let wrapperText = fs.readFileSync(wrapperFile, 'utf8');
wrapperText = wrapperText.replace(
  /<main className="flex-1 w-full pt-14 md:pt-16 pb-24 md:pb-0 bg-background text-foreground">/,
  `<main className="flex flex-col flex-1 w-full pt-14 md:pt-16 pb-24 md:pb-0 bg-background text-foreground overflow-y-auto overscroll-none">`
);
fs.writeFileSync(wrapperFile, wrapperText, 'utf8');
fs.writeFileSync(layoutFile, layoutText, 'utf8');