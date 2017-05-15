const botkit = require('botkit');
const readline = require('readline');
const redis = require('redis'),
      client = redis.createClient();

var newMessageHandler;

setInterval(processMessages, 5000);

function processMessages() {
  if(newMessageHandler) {
    client.smembers('generated', (err, msgs) => {
      if(msgs) {
        newMessageHandler(msgs);
        client.del('generated');
      }
    });
  }
}

const controller = botkit.slackbot({ debug: false });

const bot = controller.spawn({
  token: process.env.token
})

bot.startRTM(function(err,bot,payload) {
  if (err) {
    throw new Error('Could not connect to Slack');
  }

  newMessageHandler = (messages) => {
    bot.startPrivateConversation({
      user: 'U024QEVSU',
      channel: 'D5D6G8VMH'
    }, (err, convo) => {
      const str = messages.map((msg, i) => `>${i}. ${msg}`).join('\n');
      convo.ask(str, (resp, conversation) => {
        try {
          const indexes = resp.text
            .split(',')
            .map(x => x.trim())
            .map(parseIntOrThrow);

          indexes
            .map(i => messages.getOrThrow(i))
            .forEach(msg => {
              client.rpush('messages', msg);
            });

          conversation.say(`Added ${indexes.length} items to queue`);
          conversation.next();
        } catch(err) {
          console.error('Error', err);
          conversation.say('Invalid response, try again');
          conversation.repeat();
          conversation.next();
        }
      });
    });
  }
});

Array.prototype.getOrThrow = function(i) {
  console.log(i, this.length);
  if(i < 0 || i > this.length) {
    throw 'Index out of bounds'
  }

  return this[i];
}

function parseIntOrThrow(str) {
  const res = parseInt(str);
  if(isNaN(res)) {
    throw `${str} is not a number`;
  }

  return res;
}
