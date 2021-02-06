const express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const methodOverride = require('method-override')

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


/* ==================================================== RESTFUL ROUTES & MONGOOSE CRUD  ====================================================  */

app.get('/', (req, res) => {
    res.send("Hackathon Homepage")
})


/* ============================================= connection to the port/localhost ============================================= */
const port = 3000
app.listen(port, () => {
    console.log('Connected to port', port)
})
