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
  // Start your app
  await app.start(process.env.PORT || 3000);
  let list = await app.client.users.list()
  let other_list = list.members.map((member) => {
      if(member.profile.email == 'tim@posthog.com') {
          askUpdateLocation(app, member)
      }
      return {
            email: member.profile.email,
            image: member.profile.image_1024,
            current_tz: member.tz,
      }
  })
  console.log('hi');
  console.log('⚡️ Bolt app is running!');
})();
