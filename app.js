var createError = require('http-errors');
// var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const express = require("express");
const dotenv = require('dotenv');
const cors = require("cors");
const HttpException = require('./app/utils/HttpException.utils');
const errorMiddleware = require('./app/middlewares/error.middleware');
const userRouter = require('./routes/user.route');

// Init express
const app = express();
// Init environment
dotenv.config();
// parse requests of content-type: application/json
// parses incoming requests with JSON payloads
app.use(express.json());
// enabling cors for all requests by using cors middleware
app.use(cors());
// Enable pre-flight
app.options("*", cors());



var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
//####################################
app.use(`/api/v1/users`, userRouter);

// Error middleware
app.use(errorMiddleware);

// starting the server
// app.listen(port, () => console.log(`🚀 Server running on port ${port}!`));
//####################################

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

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

module.exports = app;
