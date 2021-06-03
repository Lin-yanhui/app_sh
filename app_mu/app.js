var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var faceplus = require('./routes/faceplus');
var workdataRouter = require('./routes/workdata');
var https = require('https');

var app = express();

//var privateKey  = fs.readFileSync(path.join(__dirname, './config/ssl/privateKey.pem'), 'utf8');
//var certificate = fs.readFileSync(path.join(__dirname, './config/ssl/certificate.pem'), 'utf8');
//var credentials = {key: privateKey, cert: certificate};
//
//var httpsServer = https.createServer(credentials, app);
//var SSLPORT = 3100;
//
//httpsServer.listen(SSLPORT, function() {
//    console.log('HTTPS Server is running on: %s', SSLPORT);
//});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/face', faceplus);
app.use('/workdata', workdataRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
