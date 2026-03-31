var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('express-handlebars')
var fileUpload = require('express-fileupload');
const db = require('./config/connection')
var session = require('express-session')

var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.engine('hbs', hbs.engine({
    extname: 'hbs',
    defaultLayout: 'layout',
    layoutsDir: __dirname + '/views/layout/',
    partialsDir: __dirname + '/views/partials/',
    helpers: {
        increment: function(value) {
            return value + 1
        },
        eq: function(a, b) {
            return a === b
        }
    }
}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());
app.use(session({
    secret: process.env.SESSION_SECRET || "key",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}))

app.use('/', userRouter);
app.use('/admin', adminRouter);

app.use(function(req, res, next) {
    next(createError(404));
});

app.use(function(err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

// ✅ add db.connect here
db.connect((err) => {
    if (err) {
        console.log('DB Connection Failed')
        process.exit(1)
    } else {
        console.log('DB Connected Successfully')
    }
})

module.exports = app;