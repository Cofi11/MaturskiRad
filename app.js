const express = require('express');
const bodyParser = require('body-parser'); //submit form body
const methodOverride = require('method-override');//PUT, DELETE requests iz forma
const mongoose = require('mongoose'); //database
const passport = require('passport'); //za user authetication
const flash = require('express-flash'); //za poruke kroz redirect
const session = require('express-session');//za odrzavanje ulogovanog usera kroz ceo website
const port = 3000;

require('dotenv').config()

const initializePassport = require('./passport-config');
initializePassport(passport);

const app = express();

app.set('view engine', 'ejs');
app.set('views',__dirname + '/views');

app.use('/public',express.static('public'));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(methodOverride('_method'));

app.use(flash());
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());

//connect to database
mongoose.connect(process.env.DATABASE_URL,{useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', function(error){
    console.error(error);
});
db.once('open', function(){
    console.log('Connected to Mongoose');
});


//Routes
const indexRouter = require('./routes/index');
const testRouter = require('./routes/tests');
const questionRouter = require('./routes/questions');
const groupRouter = require('./routes/groups');

app.use('/', indexRouter);
app.use('/tests', testRouter);
app.use('/questions',questionRouter);
app.use('/groups',groupRouter);


//PORT
app.listen(port, function(error){
    if(error){
        console.log('greska', error);
    }
    else{
        console.log('Server is listening on port ' + port);
    }
});