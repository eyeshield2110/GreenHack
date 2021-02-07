const mongoose = require('mongoose')
const Challenge = require('../models/challengeSchema')

const randomChallenge = async(callback) => {
    const numOfChallenges = await Challenge.countDocuments({})
    const randomIndex = Math.floor((Math.random() * numOfChallenges) + 1)
    const challenges = await Challenge.find({})
    const challengeDoc = challenges[randomIndex]
    callback(challengeDoc)
}

module.exports = randomChallenge
