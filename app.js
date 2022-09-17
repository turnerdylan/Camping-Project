if(process.env.NODE_ENV !== "production"){              //if in dev mode, require .env package, and add variables to node app
    require('dotenv').config();
}

console.log(process.env.SECRET, process.env.PASSWORD);

const express = require('express');                     //express app
const path = require('path')                            //provide modules for working with file/directory paths
const mongoose = require('mongoose');                   //mongoose
const ejsMate = require('ejs-mate');                    //allows use of ejs
const ExpressError = require('./utils/ExpressError')    //something with errors???
const methodOverride = require('method-override')       //allows us to make any http request from a get or post
const session = require('express-session');
const flash = require('connect-flash')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')
const mongoSanitize = require('express-mongo-sanitize')
const { default: helmet } = require('helmet');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/camp-app'
//import external files

const userRoutes = require('./routes/users')
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews');
const ExpressMongoSanitize = require('express-mongo-sanitize');
const MongoStore = require('connect-mongo');

mongoose.connect(dbUrl) //opens mongoose default connection to mongodb

mongoose.connection.on('error', console.error.bind(console, 'connection error')); //check if theres an error
mongoose.connection.once("open", () => { //if connected, print out database connected
    console.log('database connected');
})

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');//view, engine, the default engine extension to use when omitted, defines ejs
app.set('views', path.join(__dirname, 'views'))//views, the directories for application views

//on every request, mount the specified middleware at the specified path (path)
app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize())

const secret = process.env.SECRET || 'thisisasecret'

const store = MongoStore.create({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
})

store.on('error', (e) => {
    console.log('session store error', e);
})

const sessionConfig = {
    store,
    name: 'mySession',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

//app.use for tools
app.use(session(sessionConfig))
app.use(flash())

//use for passport
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

//use for storing and unstoring user in a session?
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error');
    next();
})

app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

//when there is no path specified, render home page. Route the 'get' request to specified path
app.get('/', (req, res) => {
    res.render('home')
})

//catch all paths, direct to page not found (404)
app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404))
})

//all errors direct to this function
app.use((err, req, res, next) => {
    const { statusCode = 500} = err;
    if(!err.message) err.message = 'Something went wrong!';
    res.status(statusCode).render('error', {err});
})

const port = process.env.PORT || 3000
//listen for connections on port 3000
app.listen(port, () => {
    console.log(`serving port ${port}`);
})