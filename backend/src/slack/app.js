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

  // Start your app
  let list = await app.client.users.list()
  let channel = await app.client.conversations.members({'channel': 'CSPHFDZH8'})
  let filtered_members = list.members.filter(member => channel.members.indexOf(member.id) > -1)
  let other_list = filtered_members.map(async (member) => {
        console.log(member.profile.email) 
        try {
        await prisma.user.update({
            where: { email: member.profile.email },
            data: { avatar: member.profile.image_1024}
        })
    } catch {}
  })
  console.log('hi');
  console.log('⚡️ Bolt app is running!');
})();
