const mongoose = require('mongoose')
let db_name = "hack"
const Challenge = require('./models/challengeSchema')
const User = require('./models/userSchema')

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

/* Testing how to sort 5 leading users for the leader board */
const a = async () => {
    const arr = await User.find({}).sort({level: 'desc'}).limit(5)
    console.log(arr)
}

module.exports = a
