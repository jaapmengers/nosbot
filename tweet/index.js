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
  return new Promise((resolve, reject) => {
    redisClient.lpop('messages', (err, msg) => {
      if(err) {
        reject(err);
      } else {
        resolve(msg);
      }
    });
  });
}

function tweet(text, picture) {
  return new Promise((resolve, reject) => {
    if(!text) {
      reject(new Error('No message is provided for tweet'));
      return;
    }

    client.post('statuses/update', { status: text, media_ids: picture },  function(error, tweet, response) {
      if(error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

function uploadPicture(pictureData) {
  return new Promise((resolve, reject) => {
    client.post('media/upload', { media_data: pictureData }, function(error, media, response) {
      if(error) {
        reject(error);
      } else {
        resolve(media.media_id_string);
      }
    });
  });
}

function closeConnection() {
  redisClient.quit();
}

getFirstMessage()
  .then(msg => picture.getPicture()
    .then(uploadPicture)
    .then(pic => ({ msg: msg, pic: pic }))
  )
  .then(obj => tweet(obj.msg, obj.pic))
  .catch(console.error)
  .finally(closeConnection);
