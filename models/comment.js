const mongoose = require('mongoose');

const Comments = new mongoose.Schema({
    postID: {type: String, required: true},
    userID : {type: String, required: true},
    text : {type: String, required: true},
    status: {type: String, required: false},
    likes : {type: Number, required: false},
    reply : [String],
    createdAt: {type: Date, required: false}
});

module.exports = mongoose.model('comments',Comments);