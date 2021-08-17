const Profile = require('../models/profile');

var createProfile = function (req,res){
    
    if(!req.body.name && !req.body.email){
        res.send({
            status: "Error Occurred !!!",
            message: "Important Details Not Provided !!! \n Kindly Check !!!!"
        })
    }
    else{
        
        Profile.countDocuments({email:req.body.email})
            .then(data =>{
                if(data > 0 ){
                    res.send({
                        status: "Error Occurred !!!",
                        message: "Email ID already present !!! \n Please Sign-in !!!!" 
                    })
                }
                else{
                    console.log(new Date(req.body.dateOfBirth))
                    const user_profile = new Profile({
                        name: req.body.name, 
                        email: req.body.email,
                        age: req.body.age,
                        gender: req.body.gender,
                        dateOfBirth: new Date(req.body.dateOfBirth),
                        location: req.body.location,
                        createdAt: new Date()
                    });
                    user_profile
                        .save(user_profile)
                        .then(data =>{
                            res.send({
                                status: "Success",
                                message: "Profile created successfully"
                            })
                        })
                        .catch(err =>{
                            res.send({
                                status: "Error Occurred !!!",
                                message: "can't create the profile due to error !!!!",
                                error: err
                            })        
                        })
                }
            })
    }
}

var profSugg = function (req,res){
    let profSuggestion = {
        name : req.query.name,
        coordinates : req.query.coordinates,
        distance : req.query.distance
    }

    Profile.aggregate([
        { $geoNear:{
            near:{
                type: "Point",
                coordinates: profSuggestion.coordinates
            },
            key: 'location',
            distanceField: profSuggestion.distance,
            spherical: true
        }}])
        .then(data =>{
            res.send({
                status: "Success",
                message: "Your Profile suggestions are here !!!!",
                data: data
            })
        })
        .catch(err =>{
            res.send({
                status: "Error Occurred !!!",
                message: "can't retrive the profile suggestions due to error !!!!",
                error: err
            })
        })
        
}

var addFrnds = function (req,res){
    let addFrnds = {
        _id: req.body._id,
        friends: {
            _id:req.body.friends._id
        }
    }

    Profile.findByIdAndUpdate({_id: addFrnds._id},{$push: {friends: addFrnds.friends._id}},{safe: true,new: true, upsert: true })
        .then(data =>{
            res.send({
                status: "Success",
                message: "You have new friends !!!!",
                data: data
            })
        })
        .catch(err =>{
            console.log(err);
            res.send({
                status: "Error Occurred !!!",
                message: "could not add friends due to error !!!!",
                error: err
            })
        })
}


module.exports = {
    createProfile : createProfile,
    profileSuggestion : profSugg,
    addFrnds : addFrnds    
}