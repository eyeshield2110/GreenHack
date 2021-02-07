const mongoose = require('mongoose');
const Challenge = require('./challengeSchema')
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: [true, "Username required"]
    },
    password: {
        type: String,
        required: [true, "Password required"]
    },
    challenges: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Challenge'
        }
    ],
    numOfChallenge: {
        type: Number,
        enum: [1, 2, 3],
        default: 2
    },
    day: {
        type: Date,
        default: undefined // ? or Date.now() ?
    },
    points: {
        type: Number,
        default: 0
    },
    level: {
        type: Number,
        default: 0
    }
})

// middleware: verify user login



module.exports = mongoose.model('User', userSchema);

// when creating user:
// (1) fetch 2 random challenges
// {username, password, 2 challenges
