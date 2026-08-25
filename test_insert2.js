const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    const user = await prisma.profile.findFirst();
    if (!user) return console.log("No users");
    try {
        const stream = await prisma.liveStream.create({
            data: {
                id: `stream-test-${Date.now()}`,
                sellerId: user.id,
                title: 'Test',
                streamKey: 'yt-test',
                status: 'live',
                youtubeLiveId: '-1TI2PtV06Q',
                kickUsername: null
            }
        });
        console.log("Success:", stream.id);
    } catch(e) {
        console.error(e);
    }
}
run();