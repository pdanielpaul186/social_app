const mongoose = require('mongoose');

const friend = new mongoose.Schema({
    friendID: {type: String, required: true},
    userID : {type: String, required: true}
});

module.exports = mongoose.model('friends',friend);