const mongoose = require('mongoose')
const User = require('../models/challengeSchema')

const a = async () => {
    const arr = await User.find({}).sort({points: 'desc'}).limit(5)
    console.log(arr)
}

module.exports = a
