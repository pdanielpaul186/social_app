const mongoose = require('mongoose');

const getContent = new mongoose.Schema({
    post : {data: Buffer ,type: String, required: true},
    email : {type: String, required: true},
    text : {type: String, required: false},
    status: {type: String, required: true},
    likes : {type: Number, required: false},
    comments: {type: Array, required: false}
});

module.exports = mongoose.model('getCont',getContent);