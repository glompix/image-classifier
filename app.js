var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();
var exphbs = require('express-handlebars');

// view engine setup
app.engine('hbs', exphbs({
	defaultLayout: 'main',
	extname: '.hbs',
	helpers: {
		section: function(name, options) {
			if (!this._sections) {
				this._sections = {};
			}
			this._sections[name] = options.fn(this);
			return null;
		},
    menu: function(name, options) {
      // Need to strip whitespace between tags out or else small-form submenus break lines...
      if (!this._menu) {
        this._menus = {};
      }
      if (!this._menus[name]) {
        this._menus[name] = '';
      }
      var html = options.fn(this);
      html = html.replace(/>\s*</g, '><');
      this._menus[name] += html;
      return null;
    },
		appClass: function(name, options) {
			this._appClass = name;
			return null;
		}
	}
}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

var env = process.env.NODE_ENV || 'development';
app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env == 'development';

// app.use(favicon(__dirname + '/public/img/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({
	extended: false
}));

app.use('/', require('./routes/index'));
app.use('/classify', require('./routes/classify'));
app.use('/users', require('./routes/user'));
app.use('/sets', require('./routes/set'));

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

/// error handlers

// development error handler
// will print stacktrace

if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message,
			error: err,
			title: 'error'
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: {},
		title: 'error'
	});
});


module.exports = app;
