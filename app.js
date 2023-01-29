var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const passport = require('passport');
const localPass = require('passport-local');
const bcrypt = require('bcrypt');
const flash = require('express-flash');
const session = require('express-session');

const multer = require('multer');
const bodyParser = require('body-parser');

var indexRouter = require('./routes/index');
var gostRouter = require('./routes/gost');
var predavacRouter = require('./routes/predavac');
var adminRouter = require('./routes/admin')

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(function (req, res, next) {
  console.info("Ovo se uvijek poziva, koja god ruta?")
  console.log(req.cookies.ime_predavaca+ " "+ " "+ req.cookies.id_predavaca);
  next();
});

// mongodb povezivaneje
const mongoose = require ("mongoose");
mongoose.connect(
    "mongodb://localhost:27017/slidodb",
    {useNewUrlParser:true}
);
mongoose.set('strictQuery', true);
const db = mongoose.connection;

db.once("open", () => {
  console.log("uspjesno uspostavljena veza ");
})


const httpProxy = require("http-proxy");

httpProxy
    .createProxyServer({
      target: "http://localhost:3000",
      ws: true,
    })
    .listen(80);



app.use('/', indexRouter);
app.use('/gost', gostRouter);
app.use('/predavac', predavacRouter);
app.use('/admin', adminRouter);

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
