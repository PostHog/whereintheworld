const { App } = require('@slack/bolt')
const { PrismaClient } = require("@prisma/client");
const { askUpdateLocation } = require('./askUpdateLocation');

// Initializes your app with your bot token and signing secret
const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true, // add this
    appToken: process.env.SLACK_APP_TOKEN // add this
  });


const prisma = new PrismaClient();



(async () => {

    let city = await prisma.city.findFirst()
    let users = await prisma.user.findMany()
  // Start your app
  await app.start(process.env.PORT || 3000);
  let list = await app.client.users.list()
  let channel = await app.client.conversations.members({'channel': 'CSPHFDZH8'})
  let filtered_members = list.members.filter(member => channel.members.indexOf(member.id) > -1)
  let other_list = filtered_members.map((member) => {
        prisma.user.upda
        prisma.user.update({
            where: { email: member.email },
            data: { avatar: member.profile.image_1024}
        })
  })
  console.log('hi');
  console.log('⚡️ Bolt app is running!');
})();
