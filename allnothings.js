'use strict';

var botUtilities = require('bot-utilities');
var fs = require('fs');
var program = require('commander');
var Twit = require('twit');
var _ = require('lodash');

_.mixin(botUtilities.lodashMixins);

var adjectives = JSON.parse(fs.readFileSync('./data/adjectives.json')).adjs;
var verbs = JSON.parse(fs.readFileSync('./data/verbs.json')).verbs;

// We only want past tense
verbs = _.pluck(verbs, 'past');

function quote() {
  return 'Everything was ' + _.sample(adjectives) + ', and nothing ' +
    _.sample(verbs) + '.';
}

program
  .command('tweet')
  .description('Generate and tweet an image')
  .option('-r, --random', 'only post a percentage of the time')
  .action(function (options) {
    if (options.random) {
      if (_.percentChance(98)) {
        console.log('Skipping...');

        process.exit(0);
      }
    }

    var T = new Twit(botUtilities.getTwitterAuthFromEnv());

    T.post('statuses/update', {status: quote()},
        function (err, data, response) {
      if (err || response.statusCode !== 200) {
        console.log('Error sending tweet', err, response.statusCode);

        return;
      }

      console.log('Done.');
    });
  });

program.parse(process.argv);
