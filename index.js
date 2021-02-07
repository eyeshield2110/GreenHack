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
const leadingUsers = require('./.utils/leading')
const pointSystem = require('./.utils/pointSystem')

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

const fake =[{phrase: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam feugiat et libero in bibendum."},
    {phrase: "Sed rhoncus risus iaculis, aliquam nulla ac, egestas nunc. Nunc rutrum in quam at blandit"},
    {phrase: "Nullam facilisis, turpis non dapibus pharetra, purus elit porttitor odio"}]

/* ==================================================== RESTFUL ROUTES & MONGOOSE CRUD  ====================================================  */

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/challenges', async (req, res) => {
/*    const numOfChallenges = await Challenge.countDocuments({})
    const randomIndex = Math.floor((Math.random() * numOfChallenges) + 1)
    const challenges = await Challenge.find({})
    const { challenge, category } = challenges[randomIndex]*/
    let arrChallenges;
    if (req.session.user_id) {
        const user = await User.findById(req.session.user_id).populate("challenges")
        arrChallenges = user.challenges
    }
    console.log(user)
    randomChallenge(({challenge, category}) => {
        res.render('challenges', {  challenge, arrChallenges })
    })
})

app.get('/footprint', (req,res) => {
    res.render('carbon')
})

app.get('/profile', async (req,res) => {
    if (!req.session.user_id)
        return res.redirect('/login')
    const leadingUsers = await User.find({}).sort({level: 'desc'}).limit(5)
    // console.log(leadingUsers)
    const { user_id } = req.session
    let currentUser = await User.findById(user_id)
    console.log(currentUser)
    let goal = -1
    if (currentUser)
        goal = pointSystem(parseInt(currentUser.level))
    else
        return res.send('Error 404: User profile not found')
    res.render('profile', {user:leadingUsers, goal, me:currentUser})
})
/* Changing the challenges settings for user */
app.post('/profile', async (req, res) => {
    let allChallenges = []

    console.log("\n REQ.BODY: \n", req.body)
    const category = req.body.options
    const numOfChallenges = req.body.a
    if (category !== "default" )
        allChallenges = await Challenge.find({category})
    const newChallenges = []
    for (let i = 0; i < numOfChallenges; i++) {
        const rand = Math.floor((Math.random() * allChallenges.length))
        console.log('random num ', i, ': ', rand)
        newChallenges.push(allChallenges[rand])
    }
    //console.log(newChallenges)

    // update challenges for user, and number of challenges
    const usr = await User.findById(req.session.user_id)
    usr.challenges = newChallenges
    usr.numOfChallenge = numOfChallenges
    await usr.save()
    res.send('posted to profile!')
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
    // create 2 challenges for user
    const numOfChallenges = await Challenge.countDocuments({})
    const challenges = await Challenge.find({})
    for (let i=0; i<2; i++){
        const randomIndex = Math.floor((Math.random() * numOfChallenges))
        const newCh = challenges[randomIndex]
        newUser.challenges.push(newCh)
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

app.get('/level/:username/:incr', async (req, res) => {
    const { username, incr } = req.params
    const user = await User.findOneAndUpdate({username}, {level: parseInt(incr)}, {new: true})
    res.send(JSON.stringify(user))
})
app.get('/points/:username/:incr', async (req, res) => {
    const { username, incr } = req.params
    const user = await User.findOneAndUpdate({username}, {points: parseInt(incr)}, {new: true})
    res.send(JSON.stringify(user))
})

/* ============================================= connection to the port/localhost ============================================= */
const port = 3000
app.listen(port, () => {
    console.log('Connected to port', port)
})
