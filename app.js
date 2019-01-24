const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');

//mongoose.connect("mongodb://article1:article2@ds163044.mlab.com:63044/articleapp");
mongoose.connect(config.database);
let db = mongoose.connection;

//Check Connection
db.once('open', function() {
    console.log("Connected to Database");
});

//Database Error
db.on('err', function(error) {
    console.log(error);
});

const pug = require('pug');

//Init App
const app = express();

//Bring in Model
let Article = require('./models/article');

//Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Body Parser Middleware 
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

//Express Session Middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));

//Express Validator Middleware
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.'),
            root = namespace.shift(),
            formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

//Express Message Middleware
app.use(require('connect-flash')());
app.use(function(req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

//Passport Config
require('./config/passport')(passport);

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next) {
    console.log("Local User : " + req.user);
    res.locals.user = req.user || null;
    next();
});

//Home Route
app.get('/', function(req, res) {
    Article.find({}, function(err, articles) {
        if (err) {
            console.log(err);
        } else {
            res.render('index', {
                title: 'Articles',
                articles: articles
            });
        }
    });
    /* articles = [{
         id: 1,
         title: 'Article One',
         author: 'Foram U Shah',
         body: 'This is Article One'
     }, {
         id: 2,
         title: 'Article Two',
         author: 'Komal B Gandhi',
         body: 'This is Article Two'
     }, {
         id: 3,
         title: 'Article Three',
         author: 'Umang J Shah',
         body: 'This is Article Three'
     }, {
         id: 4,
         title: 'Article Four',
         author: 'Biren J Gandhi',
         body: 'This is Article Four'
     }];*/

});

//Route Files
let articles = require('./routes/articles');
let users = require('./routes/users');
app.use('/articles', articles);
app.use('/users', users);

app.listen(3599, function() {
    console.log("Server started on server 3599");
});