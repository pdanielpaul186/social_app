const firebase = require('../config/firebase');

const saltedMd5 = require('salted-md5');
const path = require('path');
const multer = require('multer');

const upload = multer({ //multer settings
    fileFilter : function(req, file, callback) { //file filter
        if (['jpg','jpeg','png','gif','mp4','mov','avi'].indexOf(file.originalname.split('.')[file.originalname.split('.').length-1]) === -1) {
            return callback(new Error('Wrong extension type'));
        }
        callback(null, true);
    }
}).single('file');;

const Content = require('../models/content');
const Profile = require('../models/profile');
const { file } = require('../config/firebase');
const profile = require('../models/profile');
const comment = require('../models/comment');

var uploadPost = async function(req,res){
    
    if(!req.query.userID){
        res.send({
            status: "Error Occurred !!!",
            message: "Important Details Not Provided !!! \n Kindly Check !!!!"
        })
    }
    else{
        Profile.countDocuments({_id:req.query.userID})
        .then(count =>{
            if(count>0){
                upload(req,res,function(err){
                    if(err){
                        res.send({
                            status:"Fail",
                            message: "error occurred !!!",
                            error_code: 1,
                            err_desc: err,
                            err_reason: "Wrong Extension file uploaded"
                        })
                        return;
                    }
                    //Multer gives us file info in req.file object
                    if(!req.file){
                        res.send({
                            status:"Fail",
                            message: "error occurred !!!",
                            error_code: 1,
                            err_desc: "No file passed !!!"
                        })
                        return;
                    }
                    //console.log(req.file)
                    //console.log(JSON.parse(JSON.stringify(req.body)))
                    const name = saltedMd5(req.file.originalname,"social_app");
                    const fileName = name + path.extname(req.file.originalname);
    
                    let x = firebase.file(fileName).createWriteStream({
                        metadata:{
                            contentType : file.mimetype
                        }
                    }).end(req.file.buffer);
    
                    const uploadData = new Content({
                        post : req.file.buffer,
                        userID : req.query.userID,
                        text : req.body.text,
                        fileType: req.file.mimetype,
                        firebaseFile: fileName,
                        status: "Active",
                        commentID:[],
                        likes : 0,
                        createdAt: new Date()
                    });
                    uploadData
                        .save(uploadData)
                        .then(data =>{
                            res.send({
                                status:"Success",
                                message:"Post posted online !!!!!"
                            })
                        })
                        .catch(err =>{
                            res.send({
                                status: "Error Occurred !!!",
                                message: "can't post online due to error !!!!",
                                error: err
                            })
                        })
                })        
            }
            else{
                res.send({
                    status: "Error Occurred !!!",
                    message: "Profile not present !!! Please Sign-up !!!!"
                })
            }
        })
    }
}

var postList = function (req,res){
    Profile.findOne({_id: req.query._id})
        .then (async frndsData =>{
            await Content.find({userID:{$in:frndsData.friends}},{post:0}).sort({createdAt: -1})
                .then(postList =>{
                    res.send({
                        status:"Success",
                        data : postList
                    })
                })
                .catch(err1=>{
                    res.send({
                        status:"Error",
                        message: "Error in retrieving the posts"
                    })
                })
        })
        .catch(err=>{
            res.send({
                status:"Error",
                message: "Error in retrieving the friends list"
            })
        })
}

var postLike = function(req,res){
    Content.updateOne({_id:req.body._id},{$inc: {likes: 1}})
        .then(data =>{
            res.send({
                status:"Success",
                message: "You have liked this post"
            })
        })
        .catch(err =>{
            res.send({
                status:"Fails",
                message:"Like option is not working !!!!"
            })
        })
}

var postComment = function(req,res){
    Content.countDocuments({_id: req.body.postID})
        .then(postC =>{
            if(postC > 0){
                profile.countDocuments({_id: req.query._id})
                    .then(profC =>{
                        if(profC > 0){
                            if(!req.body.text){
                                res.send({
                                    status: "Fail",
                                    message: "You did not enter the Text to comment"
                                })
                            }
                            else{
                                const user_comment =new comment({
                                    postID: req.body.postID,
                                    userID : req.query._id,
                                    text : req.body.text,
                                    status: 'Active',
                                    likes : 0,
                                    reply : [],
                                    createdAt: new Date()
                                });

                                user_comment
                                    .save(user_comment)
                                    .then(data =>{
                                        Content.updateOne({_id:data.postID},{$push: {commentID : data._id}},{safe: true,new: true, upsert: true })
                                            .then(data =>{
                                                res.send({
                                                    status:"Success",
                                                    message: "You have commented successfully on this post"
                                                })
                                            })
                                            .catch(err=>{
                                                res.send({
                                                    status:"Fail",
                                                    message: "Post cant be found in the content"
                                                })
                                            })
                                    })
                                    .catch(err =>{
                                        res.send({
                                            status:"Fail",
                                            message:"Error occured while sending the data to API"
                                        })
                                    })
                            }
                        }
                        else{
                            res.send({
                                status:"Fail",
                                message:"Profile not found!!! Kindly Sign-in to Comment"
                            })            
                        }
                    })
            }
            else{
                res.send({
                    status:"Fail",
                    message:"Post not found"
                })
            }
        })
        .catch(errC =>{
            res.send({
                status: "Fail",
                message: "Error Ocurred in comment API"
            })
        })
}

module.exports = {
    uploadPost : uploadPost,
    postList : postList,
    postLike : postLike,
    postComment : postComment
}