const request = require('request');
const cheerio = require('cheerio');
const moment = require('moment');
const Promise = require('bluebird');
const base64 = require('node-base64-image');

Date.prototype.addDays = function(days) {
    var dat = new Date(this.valueOf())
    dat.setDate(dat.getDate() + days);
    return dat;
}

function getRandomDate() {
  return new Date().addDays(-  Math.round(Math.random() * 1000))
}

function getHeadlineUrls() {
  return new Promise((resolve, reject) => {
    const url = `http://nos.nl/nieuws/archief/${moment(getRandomDate()).format('YYYY-MM-DD')}`

    request(url, (err, resp, html) => {
      const $ = cheerio.load(html);
      const headlines = $('.list-time__item').map((_, x) => $(x).find('a').attr('href')).get();

      resolve(headlines);
    });
  });
}

function getRandomHeadline(headlines) {
  return headlines[Math.floor(Math.random() * headlines.length)];
}

function getPictureFromPage(path) {
  return new Promise((resolve, reject) => {
    const url = `http://nos.nl${path}`;

    request(url, (err, resp, html) => {
      const re = /(http(s)?:\/\/nos.nl\/data\/image\/.*.jpg)/g;
      const match = re.exec(html);
      if(match && match[0]) {
        resolve(match[0]);
      } else {
        reject(new Error('No picture found'));
      }
    });
  });
}

function downloadPicture(url) {
  return new Promise((resolve, reject) => {
    base64.encode(url, { string: true }, (err, image) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(image);
    });
  });
}

function getRandomPicture() {
  return getHeadlineUrls()
    .then(getRandomHeadline)
    .then(getPictureFromPage)
    .then(downloadPicture)
    .catch(err => {
      console.error(err);
      console.log('Trying again');
      return getRandomPicture();
    });
}


exports.getPicture = getRandomPicture;
