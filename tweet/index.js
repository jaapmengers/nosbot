const Twitter = require('twitter');
const Promise = require('bluebird');
const picture = require('./picture.js');
const redis = require('redis'),
      redisClient = redis.createClient();

const client = new Twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

function getFirstMessage() {
  console.log('Getting first message');
  return new Promise((resolve, reject) => {
    redisClient.lpop('messages', (err, msg) => {
      if(!msg) {
        reject(new Error('There\'s no new messages to tweet'))
      }
      else if(err) {
        reject(err);
      } else {
        console.log('Got first message', msg);
        resolve(msg);
      }
    });
  });
}

function tweet(text, picture) {
  console.log('Tweeting');
  return new Promise((resolve, reject) => {
    if(!text) {
      reject(new Error('No message is provided for tweet'));
      return;
    }

    client.post('statuses/update', { status: text, media_ids: picture },  function(error, tweet, response) {
      if(error) {
        reject(error);
      } else {
        console.log('Tweet successfull');
        resolve();
      }
    });
  });
}

function uploadPicture(pictureData) {
  console.log('Uploading picture');
  return new Promise((resolve, reject) => {
    client.post('media/upload', { media_data: pictureData }, function(error, media, response) {
      if(error) {
        reject(error);
      } else {
        resolve(media.media_id_string);
        console.log('Uploaded picture');
      }
    });
  });
}

function closeConnection() {
  console.log('Closing connection');
  redisClient.quit();
}

getFirstMessage()
  .then(msg => picture.getPicture()
    .then(uploadPicture)
    .then(pic => ({ msg: msg, pic: pic }))
  )
  .tap(console.log)
  .then(obj => tweet(obj.msg, obj.pic))
  .catch(console.error)
  .finally(closeConnection);
