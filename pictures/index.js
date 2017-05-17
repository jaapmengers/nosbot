const request = require('request');
const cheerio = require('cheerio');
const moment = require('moment');
const Promise = require('bluebird');

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

function getPicture(path) {
  return new Promise((resolve, reject) => {
    const url = `http://nos.nl${path}`;

    request(url, (err, resp, html) => {
      const re = /(http(s)?:\/\/nos.nl\/data\/image\/.*.jpg)/g;
      const match = re.exec(html);
      if(match) {
        console.log(match[0]);
      } else {
        console.error('None found');
      }
    });
  });
}

getHeadlineUrls().then(getRandomHeadline).then(getPicture);
