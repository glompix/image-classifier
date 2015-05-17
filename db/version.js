var connection = require('./connection');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');

var _migrationsFolder = path.join(__dirname, 'migrations');

module.exports.migrate = function() {
  var c = connection.create({multipleStatements: true});
  c.connect();
  ifNeedToMigrate(c, doMigrate);
};

function ifNeedToMigrate(c, callback) {
  c.query('select top 1 * from version', function(err, rows, fields) {
    console.log('VERSION.CHECK - ', err, rows.length, rows.length > 0 ? rows[0] : null);
    if (err) throw err;
    var version;
    if (rows.length === 0) {
      c.query('insert into version (version, migrating) values (0, 0)');
      version = {
        version: 0,
        migrating: 0
      };
    } else {
      version = rows[0];
    }

    if (!version.migrating) {
      callback(c, version.version);
    } else {
      c.end();
    }
  });
}

function doMigrate(c, currentVersion) {
  c.query('update version set migrating = 1');
  try {
    var scripts = readScriptFolder();
    if (scripts.latest > currentVersion) {
      var ups = _.filter(scripts.ups, function (f) { return getNumber(f) > currentVersion; });
      runScripts(c, ups, endUpdates);
    } else if (scripts.latest < currentVersion) {
      // not going to be hit while target version is determined by scripts folder.
      var downs = _.filter(scripts.downs, function (f) { return getNumber(f) < currentVersion; }).reverse();
      runScripts(c, downs, endUpdates);
    } else {
      c.end();
    }
  }
  catch (err) {
    endUpdates(c);
    throw err;
  }
}

function readScriptFolder() {
  var files = fs.readdirSync(_migrationsFolder);
  var scripts = {
    ups: _.filter(files, function (f) { f.match(/up/i).sort(); }),
    downs: _filter(files, function (f) { f.match(/down/i).sort(); })
  };
  var latestUpFile = scripts.ups[scripts.ups.length - 1];
  scripts.latest = getNumber(latestUpFile);
  return scripts;
}

function runScripts(c, scripts, callback) {
  var script = '';
  var endVersion = getNumber(scripts[scripts.length - 1]);
  for (var i = 0; i < scripts.length; i++) {
    var scriptName = scripts[i];
    var version = getNumber(scriptName);
    script += fs.readfileSync(path.join(_migrationsFolder, script));
    script += ';\n\n';
  }
  c.query(script, function(err, rows, fields) {
    if (err) throw err;
    c.query('update version set version = ');
    callback(c, endVersion);
  });
}

function endUpdates(c, newVersion) {
  c.query('update version set migrating = 0, version = ?', [newVersion], function (err) {
    c.end();
    if (err) throw err;
  });
}

var _migrationNumberRegex = /^\d+/;
function getNumber(scriptName) {
  var match = _migrationNumberRegex.match(scriptName);
  if (match && match.length > 0) {
    return parseInt(match[0]);
  }
}
