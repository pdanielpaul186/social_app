const profile = require('../models/profile');
const Profile = require('../models/profile');
const mongoose = require('mongoose');
const { query } = require('express');

var createProfile = function (req,res){
    
    if(!req.body.name && !req.body.email){
        res.send({
            status: "Error Occurred !!!",
            message: "Important Details Not Provided !!! Kindly Check !!!!"
        })
    }
    else{
        
        Profile.countDocuments({email:req.body.email})
            .then(async data =>{
                if(data > 0 ){
                    res.send({
                        status: "Error Occurred !!!",
                        message: "Email ID already present !! Please Sign-in !!!!" 
                    })
                }
                else{
                    function diff_years(dt2, dt1){
                        var diff =(dt2.getTime() - dt1.getTime()) / 1000;
                        diff /= (60 * 60 * 24);
                        return Math.abs(Math.round(diff/365.25));
                    }

                    const user_profile = new Profile({
                        name: req.body.name, 
                        email: req.body.email,
                        age: diff_years(new Date(req.body.dateOfBirth), new Date()),
                        gender: req.body.gender,
                        dateOfBirth: req.body.dateOfBirth,
                        location: {"type": "Point","coordinates":req.body.location},
                        createdAt: new Date()
                    });
                    await user_profile
                        .save(user_profile)
                        .then(idOfProf =>{
                            res.send({
                                status: "Success",
                                message: "Profile created successfully!!!!!",
                                _id:idOfProf._id
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
            .catch(err =>{
                res.send({
                    status: "Error Occurred !!!",
                    message: "can't create the profile due to error !!!!",
                    error: err
                })        
            })
    }
}

var profSugg = function (req,res){
    if(!req.query.coordinates && !req.query.distance){
        res.send({
            status: "Error Occurred !!!",
            message: "Important Details Not Provided !!! \n Kindly Check !!!!"
        })
    }
    else{
        let profSuggestion = {
            coordinates : JSON.parse(req.query.coordinates),
            distance : req.query.distance
        }
    
        Profile.aggregate([
            { $geoNear:{
                near:{
                    $geometry:{
                        type: "Point",
                        coordinates: profSuggestion.coordinates
                    }
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
                console.log(err);
                res.send({
                    status: "Error Occurred !!!",
                    message: "can't retrive the profile suggestions due to error !!!!",
                    error: err
                })
            })
    }    
}

var addFrnds = function (req,res){
    let addFrnds = {
        _id: req.body._id,
        friends:req.body.friends_id
    }

    Profile.countDocuments({_id: addFrnds._id})
        .then(count =>{
            if(count > 0){
                Profile.updateOne({_id: addFrnds._id},{$push: {friends: addFrnds.friends}},{safe: true,new: true, upsert: true })
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
            else{
                res.send({
                    status: "Error Occurred !!!",
                    message: "could not add friends !!!!"
                })
            }
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

var rmFrnds = function(req,res){
    if(!req.query._id && !req.body._id){
        res.send({
            status:"Fail",
            message: "Send _id to move further"
        })
    }
    else{
        profile.countDocuments({_id:req.query._id})
            .then( count =>{
                if(count > 0 ){
                    profile.updateOne({_id:req.query._id},{$pull:{friends:{$in:[req.body._id]}}},{multi: true})
                        .then(data =>{
                            console.log(data)
                            res.send({
                                status : "Success",
                                message: "you have removed a friend with _id ",
                                _id : req.body._id
                            })
                        })
                        .catch(err=>{
                            res.send({
                                status:"Fail",
                                message:"Error occured while querying !!!"
                            })
                        })
                }
                else{
                    res.send({
                        status:"Fail",
                        message:"The profile is not present !!!!!"
                    })
                }
            })
            .catch(err=>{
                res.send({
                    status:"Fail",
                    message:"Error occured while querying !!!"
                })
            })
    }
}

var viewProf = function(req,res){
    profile.findById({_id:req.query._id})
        .then(data =>{
            res.send({
                status:"Success",
                message:"Your profile is here",
                data : data
            })
        })
        .catch(err =>{
            res.send({
                status:"Fail",
                message:"Error occured while querying !!!"
            })
        })
}

module.exports = {
    createProfile : createProfile,
    profileSuggestion : profSugg,
    addFrnds : addFrnds,
    rmFrnds: rmFrnds,
    viewProf : viewProf    
}