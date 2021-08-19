const mongoose = require('mongoose');

const Likes = new mongoose.Schema({
    postID: {type: String, required: true},
    userID : {type: String, required: true}
});

module.exports = mongoose.model('likes',Likes);