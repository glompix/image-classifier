var mysql = require('mysql');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var config = require('../config.json');

var _migrationsFolder = path.join(__dirname, 'migrations');

module.exports.migrate = function() {
  var c = mysql.createConnection(_.extend(config.database, {
    multipleStatements: true
  }));
  c.connect();
  ifNeedToMigrate(c, doMigrate);
};

function ifNeedToMigrate(c, callback) {
  bootstrap(c, function(err) {
    if (err) throw err;
    c.query('select * from version limit 1', function(err, rows, fields) {
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
  });
}

function bootstrap(c, callback) {
  var scriptPath = path.join(_migrationsFolder, 'bootstrap.sql');
  var script = fs.readFileSync(scriptPath).toString();
  c.query(script, callback);
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
    endUpdates(c, currentVersion);
    throw err;
  }
}

function readScriptFolder() {
  var files = fs.readdirSync(_migrationsFolder);
  var scripts = {
    ups: _.filter(files, function (f) { return f.match(/up/i); }).sort(),
    downs: _.filter(files, function (f) { return f.match(/down/i); }).sort()
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
    console.log('Migrating ' + scriptName + '...');
    var version = getNumber(scriptName);
    var scriptPath = path.join(_migrationsFolder, scriptName);
    script += fs.readFileSync(scriptPath).toString();
    script += ';\n\n';
  }
  c.query(script, function(err, rows, fields) {
    if (err) throw err;
    callback(c, endVersion);
  });
}

function endUpdates(c, newVersion) {
  c.query('update version set migrating = 0, version = ?', [newVersion], function (err) {
    c.end();
    if (err) throw err;
    else console.log('Set database version to ' + newVersion + '.');
  });
}

var _migrationNumberRegex = /^\d+/;
function getNumber(scriptName) {
  var match = scriptName.match(_migrationNumberRegex);
  if (match && match.length > 0) {
    return parseInt(match[0]);
  }
}
