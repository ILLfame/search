#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const getNumberOfBytes = strValue => {
  let k;
  switch (strValue.slice(-1)) {
    case 'B':
      k = 1;
      break;
    case 'K':
      k = 2 ** 10;
      break;
    case 'M':
      k = 2 ** 20;
      break;
    case 'G':
      k = 2 ** 30;
      break;
    default:
      throw new Error(`invalid SIZE value '${strValue}'`);
  }
  return (parseInt(strValue) || 1) * k;
};

const arguments = process.argv.reduce((obj, item, index, array) => {
  if (item.slice(0, 2) === '--') {
    const [flag, value] = item.split('=', 2);
    switch (flag) {
      case '--DIR':
        obj[flag] = value;
        break;
      case '--PATTERN':
        obj[flag] = value;
        break;
      case '--TYPE':
        if (value === 'F' || value === 'D') {
          obj[flag] = value;
          break;
        }
        throw new Error(`invalid value '${value}' of flag '--TYPE'`);
      case '--MIN-SIZE':
        obj[flag] = getNumberOfBytes(value);
        break;
      case '--MAX-SIZE':
        obj[flag] = getNumberOfBytes(value);
        break;
      default:
        throw new Error(`invalid flag '${flag}'`)
    }
  } else if (index > 1) {
    throw new Error(`invalid argument '${item}'`);
  }
  if (index === array.length - 1 && !obj['--DIR']) {
    throw new Error("missing path required argument with '--DIR' flag")
  }
  return obj;
}, {});

const isTypeOfItem = (value, stats) => !value || value === 'F' && stats.isFile() ||
  value === 'D' && stats.isDirectory();
const isPatternOfItem = (value, item) => !value ||
  !(path.parse(item).base.toUpperCase().search(value.toUpperCase()) === -1);
const maxOrMinSize = sign => (value, stats) => !value || stats.isFile() && ((stats.size - value) * sign) < 0;
const isMinSizeOfItem = maxOrMinSize(-1);
const isMaxSizeOfItem = maxOrMinSize(1);

const search = rule => (filesPath, done) => {
    let results = [];
    fs.readdir(filesPath, (err, data) => {
      if (err) throw new Error(`Invalid PATH ${filesPath}`);
      let pending = data.length;
      if (!pending) return done(null, results);
      data.forEach(item => {
        const newPath = path.join(filesPath, item);
        fs.stat(newPath, (err, itemStats) => {
          if (rule(newPath, itemStats)) {
            results.push({path: newPath, stats: itemStats});
          }
          if (itemStats && itemStats.isDirectory()) {
            search(rule)(newPath, (err, res) => {
              results = results.concat(res);
              if (!--pending) done(null, results);
            });
          } else {
            if (!--pending) done(null, results);
          }
        })
      })
    })
  };

const predicate = (itemPath, itemStats) =>  isMinSizeOfItem(arguments['--MIN-SIZE'], itemStats) &&
  isMaxSizeOfItem(arguments['--MAX-SIZE'], itemStats) && isTypeOfItem(arguments['--TYPE'], itemStats) &&
  isPatternOfItem(arguments['--PATTERN'], itemPath);

const sortSize = (result, trend) => result.sort((a, b) => (a.stats['size'] - b.stats['size']) * trend);

const view = result => {
  const maxPathLength = result.reduce((prev, curr) => prev < curr.path.length ? curr.path.length : prev, 0);
  const directory = result.filter(item => item.stats.isDirectory());
  const files = result.filter(item => !item.stats.isDirectory());
  const sortedFiles = sortSize(files, -1);

  directory.forEach(item => console.log(item.path.padEnd(maxPathLength + 5, ' ') + 'DIR'));
  sortedFiles.forEach(item => console.log(item.path.padEnd(maxPathLength + 5, ' ') +
    (item.stats['size'] / 2 ** 20).toFixed(3) + ' Mb'));
};

search(predicate)(arguments['--DIR'], (err, result) => view(result));