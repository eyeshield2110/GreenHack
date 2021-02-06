const Challenge = require('./challengeSchema')
const challenges_list = require('./challenges')
const mongoose = require('mongoose')

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
/* --------------------------------- Seeding db and closing --------------------------------- */
const seedDB = async () => {
    await Challenge.deleteMany({})
    for (const c of challenges_list) {
        const newChallenge = new Challenge(c)
        await newChallenge.save()
    }

}

seedDB().then(() => {
    mongoose.connection.close()
        .then(() => { console.log("Seeding done.") });
})
