const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const challengeSchema = new Schema({
    challenge: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['recycling and reduce waste', 'transport', 'local products', 'reducing water and electricity consumption']
    }
})

module.exports = mongoose.model('Challenge', challengeSchema);
