const express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const Challenge = require('./models/challengeSchema')
const User = require('./models/userSchema')
const bcrypt = require('bcrypt')
const session = require('express-session') // session
const flash = require('connect-flash')
const randomChallenge = require('./.utils/randomChallenge') // function that select random challenge

/* ----------------------- configuration of dir, templates, EJS, encoding & route overriding ------------------------- */
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'))
app.use(express.static(path.join(__dirname, './public')));
app.use(express.urlencoded({ extended:true }))
app.use(methodOverride('_method'))
/* Session */ /* Session object: req.session */
app.use(session({
    secret: 'badly_kept_secret',
    resave: true,
    saveUninitialized: true,
    cookies: {
        httpOnly: true, // avoid client cross site access (security)
        expires: Date.now() +60 * 60 * 24 * 7,
        maxAge: 60 * 60 * 24 * 7 // session expires after a week
    }
}))
app.use(flash())

/* ---------------------------------------------------- MongoDB connection ---------------------------------------------------- */
let db_name = "hack"

mongoose.connect('mongodb://localhost:27017/' + db_name, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false     /* remove findAndModify deprecation warning */
}).then()

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})


app.use(express.static(__dirname + '/public'));
/* ====================================================  Testing / TO DELETE ==================================================== */

const user = [{username: "Jana", points:"3"}, {username: "Noah", points:"8"},{username: "Melissa", points:"64"},
    {username: "Rowan", points:"46"}, {username: "Sam", points:"63"}]

const me = [{username: "Jana", level: "2", points: "10"}]

/* ==================================================== RESTFUL ROUTES & MONGOOSE CRUD  ====================================================  */

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/challenges', async (req, res) => {
    const numOfChallenges = await Challenge.countDocuments({})
    const randomIndex = Math.floor((Math.random() * numOfChallenges) + 1)
    const challenges = await Challenge.find({})
    const { challenge, category } = challenges[randomIndex]
    res.render('challenges', {  challenge })
})

// Testing 'Daily Challenge'
app.get('/challenges2', async (req, res) => {
    const numOfChallenges = await Challenge.countDocuments({})
    const randomIndex = Math.floor((Math.random() * numOfChallenges) + 1)
    const challenges = await Challenge.find({})
    const { challenge, category } = challenges[randomIndex]
    res.render('challenges', {  challenge })
})


app.get('/footprint', (req,res) => {
    res.render('carbon')
})

app.get('/profile', async (req,res) => {
    // return the top 5 users in decreasing points order
    const top5 = await User.find
    res.render('profile', {user, me})
})


app.get('/register', (req, res) => {
    res.render('register', {msg: req.flash('userExist')})
})

app.post('/register', async (req, res) => {
    const { username, password } = req.body

    // if username exists already, redirect to /register + flash message
    const db_user = await User.findOne({username})
    if (db_user) {
        req.flash('userExist', "This username is already taken.")
        return res.redirect('/register')
    }
    // hash password before storing
    const hash = await bcrypt.hash(password, 12)
    const newUser = new User({username, password:hash})

    const numOfChallenges = await Challenge.countDocuments({})
    for (let i = 0; i < 2; i++) {
        const randomIndex = Math.floor((Math.random() * numOfChallenges) + 1)
        const challenges = await Challenge.find({})
        const challengeDoc = challenges[randomIndex]
        newUser.challenges.push(challengeDoc)
    }

    await newUser.save()
    res.redirect('/')
})
app.get('/login', (req, res) => {
    res.render('login', {msg: req.flash('failedLogin')})
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body
    // search username
    const searchUser = await User.findOne({ username })
    if (!searchUser) {
        console.log('Failed login')
        req.flash('failedLogin', "Wrong username and/or password.")
        return res.redirect('/login') // implement wrong username/pw message
    }
    // match to password
    const validPw = await bcrypt.compare(password, searchUser.password)

    if (validPw) {
        // if success login, store user._id in session
        req.session.user_id = searchUser._id
        console.log("success login") // implement success login message
        res.redirect('/')
    }
    else {
        console.log('Failed login')
        req.flash('failedLogin', "Wrong username and/or password.")
        res.redirect('/login') // implement wrong username/pw message
    }
})
// !!!! LOGOUT FORM: To implement: a hidden form-button in the user profile to Logout
app.post('/logout', (req, res) => {
    req.session.user_id = null
    req.session.destroy() // completely any information stored in session
    res.redirect('/')
})

/* ----------------- Test route: only accessible when the user is login ----------------- */
app.get('/secret', (req, res) => {
    if (req.session.user_id)
        res.send('<h1>Secret</h1>' +
            '<form action="/logout" method="post"><button>Sign out</button></form>')
    else
        res.redirect('/')

})
app.get('/level/:name', async (req, res) => {
    await User.find({name: req.params.name})
})

/* ============================================= connection to the port/localhost ============================================= */
const port = 3000
app.listen(port, () => {
    console.log('Connected to port', port)
})
