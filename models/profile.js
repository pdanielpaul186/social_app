const mongoose = require('mongoose');

const profileSchema = mongoose.Schema({
    name : {type: String, required: true},
    email : {type: String, required: true},
    age : {type: Number, required: false},
    gender : {type: String, required: false},
    dateOfBirth : {type: Date, required: false},
    location : {type:{type: String, default: 'Point'}, coordinates:[Number],required: false},
    friends : [String],
    createdAt: {type: Date, required: false}
});

profileSchema.method("toJSON",()=>{
    const { _id, ...object } = this.toObject();
    object.id = _id;
    return object;
})

module.exports = mongoose.model('Profile',profileSchema);