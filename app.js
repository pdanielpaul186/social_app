var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var mongo = require('./config/mongo');
var firebase = require('./config/firebase');

//router initialization
var profileRouter = require('./routes/profile.router');
var contentRouter = require('./routes/content.router');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//end points for router
app.use('/', profileRouter);
app.use('/content',contentRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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

//when pm2 is used uncomment this code
// app.listen(3200,()=>{
//   if(err){
//     console.log("PORT NOT AVAILABLE",err);
//   }
//   else{
//     console.log("LISTENNING AT 3200");
//   }
// })

module.exports = app;