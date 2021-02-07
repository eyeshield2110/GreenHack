const express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const Challenge = require('./models/challengeSchema')

/* ----------------------- configuration of dir, templates, EJS, encoding & route overriding ------------------------- */
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'))
app.use(express.static(path.join(__dirname, './public')));
app.use(express.urlencoded({ extended:true }))
app.use(methodOverride('_method'))


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

/*---------------*/
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

app.get('/footprint', (req,res) => {
    res.render('carbon')
})

app.get('/profile', (req,res) => {
    res.render('profile', {user, me})
})



/* ============================================= connection to the port/localhost ============================================= */
const port = 3000
app.listen(port, () => {
    console.log('Connected to port', port)
})
