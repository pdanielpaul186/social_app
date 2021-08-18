const mongoose = require('mongoose');

const Content = new mongoose.Schema({
    post : {data: Buffer ,type: String, required: true},
    userID : {type: String, required: true},
    text : {type: String, required: false},
    fileType:{type: String, required: false},
    firebaseFile:{type: String, required: false},
    status: {type: String, required: false},
    likes : {type: Number, required: false},
    commentID: [String],
    createdAt: {type: Date, required: false}
});

module.exports = mongoose.model('content',Content);