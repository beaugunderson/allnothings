'use strict';

var botUtilities = require('bot-utilities');
var isCool = require('iscool')();
var fs = require('fs');
var program = require('commander');
var sprintf = require('sprintf');
var Twit = require('twit');
var _ = require('lodash');

_.mixin(botUtilities.lodashMixins);

var adjectives = JSON.parse(fs.readFileSync('./data/adjectives.json')).adjs;
var nouns = require('./wordnet-js/Noun.js').data;
var verbs = JSON.parse(fs.readFileSync('./data/verbs.json')).verbs;

var states = _(nouns)
  .filter({lexname: 'noun.state'})
  .map('words')
  .map(_.first)
  .value();

// We only want past tense
var pastVerbs = _.map(verbs, 'past');

function coolSample(array) {
  var result;

  do {
    result = _.sample(array);
  } while (!isCool(result));

  return result;
}

var quoteFns = [
  function () {
    return sprintf('Everything was %s, and nothing %s.',
      coolSample(adjectives),
      coolSample(pastVerbs));
  },
  function () {
    var first = coolSample(adjectives);

    return sprintf('The best jokes are %s, and %s because they are in some way %s.',
      first,
      first,
      coolSample(adjectives));
  },
  function () {
    return sprintf('It is hard to adapt to %s, but it can be done.',
      coolSample(states));
  }
];

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

    var quote = _.sample(quoteFns)();

    T.post('statuses/update', {status: quote},
      function (err, data, response) {
        if (err || response.statusCode !== 200) {
          console.log('Error sending tweet', err, response.statusCode);

          return;
        }

        console.log('Done.');
      });
  });

program
  .command('candidates')
  .description('Generate tweet candidates')
  .action(function () {
    _.times(100, function () {
      console.log(_.sample(quoteFns)());
    });
  });

program.parse(process.argv);
