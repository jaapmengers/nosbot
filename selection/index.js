const botkit = require('botkit');
const readline = require('readline');
const spawn = require('child_process').spawn;
const Promise = require('bluebird');
const redis = require('redis'),
      client = Promise.promisifyAll(redis.createClient());

const controller = botkit.slackbot({ debug: false });
const bot = controller.spawn({
  token: process.env.token
});

const startRTM = Promise.promisify(bot.startRTM);
const startPrivateConversation = Promise.promisify(bot.startPrivateConversation);

controller.hears(['generate'], ['direct_message'], function(bot, msg) {
  spawn('bash', ['/src/generate/generate.sh'], {
    detached: true
  });
});

const conversationFnPromise = startRTM()
  .then(bot => Promise.promisify(bot.startPrivateConversation));

var busy = false;
setInterval(tick, 5000);

function tick() {
  if(busy) {
    return;
  }

Promise.reduce([getMessages, startConversation], (acc, currFn) => {
  return currFn().then(val => acc.concat([val]))
}, []).then(([messages, convo]) => {

    busy = true;
    const str = messages.map((msg, i) => `>${i}. ${msg}`).join('\n');
    convo.ask(str, (resp, conversation) => {
      try {
        if(resp.text == 'none') {
          conversation.say('Added no items to queue');
          conversation.next();
        } else {
          const indexes = resp.text
            .split(',')
            .map(x => x.trim())
            .map(parseIntOrThrow);

          indexes
            .map(i => messages.getOrThrow(i))
            .forEach(msg => {
              client.rpush('messages', msg);
            });

          conversation.say(`Added ${indexes.length} items to queue and cleared generated list`);
          conversation.next();
        }
        
        client.del('generated');
        busy = false;

      } catch(err) {
        console.error('Error', err);
        conversation.say('Invalid response, try again');
        conversation.repeat();
        conversation.next();
      }
    });
  });
}

function startConversation() {
  return conversationFnPromise.then(fn => fn({ user: 'U024QEVSU', channel: 'D5D6G8VMH' }));
}

function getMessages() {
  return client.smembersAsync('generated').then(msgs => {
    if(msgs.length < 1) {
      throw 'No new messages';
    }

    return msgs;
  });
}

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
