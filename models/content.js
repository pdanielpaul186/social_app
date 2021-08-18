const mongoose = require('mongoose');

const Content = new mongoose.Schema({
    post : {data: Buffer ,type: String, required: false},
    email : {type: String, required: true},
    text : {type: String, required: false},
    status: {type: String, required: false},
    likes : {type: Number, required: false},
    comments: [String],
    createdAt: {type: Date, required: false}
});

module.exports = mongoose.model('content',Content);