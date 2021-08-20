const firebase = require('../config/firebase');

const saltedMd5 = require('salted-md5');
const path = require('path');
const multer = require('multer');

const fileFilt = (req, file, cb) => {
    const fileSize = parseInt(req.headers['content-length']);  
    if((file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/tif'|| file.mimetype === 'image/tiff'|| file.mimetype === 'application/octet-stream') && (fileSize <= 15728640)) {
    cb(null, true);
    } else if((file.mimetype === 'video/mp4'|| file.mimetype === 'video/mov' || file.mimetype === 'video/avi') && (fileSize <= 31457280)) {
    cb(null, true);
    }
    else {
    cb(null, false);
    }
}    

const upload = multer({ //multer settings
    fileFilter : fileFilt,
    limits:{
        files: 1,
        fileSize: 15*1024*1024
    }
}).single('file');;

const Content = require('../models/content');
const Profile = require('../models/profile');
const Likes = require('../models/like');
const { file } = require('../config/firebase');
const profile = require('../models/profile');
const comment = require('../models/comment');

var uploadPost = async function(req,res){
    
    if(!req.query._id){
        res.send({
            status: "Error Occurred !!!",
            message: "Important Details Not Provided !!! \n Kindly Check !!!!"
        })
    }
    else{
        Profile.countDocuments({_id:req.query._id})
        .then(count =>{
            if(count>0){
                upload(req,res,function(err){
                    if(err){
                        res.send({
                            status:"Fail",
                            message: "error occurred !!!",
                            error_code: 1,
                            err_desc: err
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
                    const name = saltedMd5(req.file.originalname,"social_app");
                    const fileName = name + path.extname(req.file.originalname);
    
                    let x = firebase.file(fileName).createWriteStream({
                        metadata:{
                            contentType : file.mimetype
                        }
                    }).end(req.file.buffer);
    
                    const uploadData = new Content({
                        post : req.file.buffer,
                        userID : req.query._id,
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
            await Content.find({userID:{$in:frndsData.friends}},{post:0,likes:0,commentID:0}).sort({createdAt: -1})
                .then(postList =>{
                    if(postList.length != 0){
                        res.send({
                            status:"Success",
                            data : postList
                        })
                    }else{
                        res.send({
                            status:"Success",
                            message : "There are no posts uploaded by your friends !!!!!!!"
                        })
                    }
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
    if(!req.body._id && !req.query._id){
        res.send({
            status: "Error Occurred !!!",
            message: "Important Details Not Provided !!! Kindly Check !!!!"
        })
    }else{
        Content.countDocuments({_id:req.body._id})
            .then(count =>{
                if(count >0){
                    Profile.countDocuments({_id:req.query._id})
                    .then(prof =>{
                        if(prof > 0){
                            Likes.countDocuments({$and:[{userID:req.query._id},{postID:req.body._id}]})
                            .then(lCount =>{
                                if(lCount > 0){
                                    res.send({
                                        status:"Fail",
                                        message:"You already liked this post !!!!!!"
                                    })
                                }else{
                                    Content.updateOne({_id:req.body._id},{$inc: {likes: 1}})
                                        .then(data =>{
                                            const likeP = new Likes({
                                                postID:req.body._id,
                                                userID:req.query._id
                                            });
                                            likeP
                                            .save(likeP)
                                            .then(likeDone =>{
                                                res.send({
                                                    status:"Success",
                                                    message: req.query._id+" has liked this post"
                                                })
                                            })
                                            .catch(err=>{
                                                res.send({
                                                    status:"Fail",
                                                    message: "Cant like this post"
                                                })
                                            })
                                        })
                                        .catch(err =>{
                                            res.send({
                                                status:"Fail",
                                                message:"Like option is not working !!!!"
                                            })
                                        })
                                }
                            })
                            .catch(err=>{
                                res.send({
                                    status:"Fail",
                                    message:"Like option is not working !!!!"
                                })
                            })
                            
                        }else{
                            res.send({
                                status:"Fail",
                                message:"Create profile to like this post.!!!!!"
                            })
                        }
                    })
                    .catch(err=>{
                        res.send({
                            status:"Fail",
                            message:"Like action cant be done"
                        })
                    })

                }else{
                    res.send({
                        status:"Fail",
                        message:"Post not found !!!!"
                    })
                }
            })
            .catch(err =>{
                res.send({
                    status:"Fail",
                    message:"Like option is not working !!!!"
                }) 
            })
    }
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

const viewCont = async function(req,res){
    if(!req.query._id){
        res.send({
            status:"Fail",
            message : "Important data missing Kindly check and send again"
        })
    }
    else{
        await Content.find({userID:req.query._id},{post:0}).sort({createdAt: -1})
            .then(data =>{
                comment.find({_id:{$in:data.commentID}})
                    .then(commentD =>{
                        res.send({
                            status:"Success",
                            message:"Your posts are here !!!!",
                            data : data,
                            comments : commentD
                        })
                    })
                    .catch(err=>{
                        res.send({
                            status:"Fail",
                            message: "Error Ocurred while querying!!!!"
                        })
                    })
            })
            .catch(err =>{
                res.send({
                    status:"Fail",
                    message: "Error Ocurred while querying!!!!"
                })
            })
    }
}
const updateCont = function (req,res){
    if(!req.query._id && !req.body.text && !req.query.post_id){
        res.send({
            status:"Fail",
            message : "Important data missing Kindly check and send again"
        })
    }
    else{
        Content.countDocuments({$and:[{_id:req.query.post_id},{userID:req.query._id}]})
            .then(count =>{
                if(count > 0){
                    Content.updateOne({$and:[{_id:req.query.post_id},{userID:req.query._id}]},{text:req.body.text})
                        .then(data =>{
                            res.send({
                                status:"Success",
                                message:"Your post is updated"
                            })
                        })
                        .catch(err=>{
                            res.send({
                                status:"Fail",
                                message:"Error occurred while querying !!!"
                            })
                        })
                }
                else{
                    res.send({
                        status:"Fail",
                        message:"The post is not present !!!!!"
                    })
                }
            })
            .catch(err=>{
                res.send({
                    status:"Fail",
                    message:"Error occurred while querying !!!"
                })
            })
    }
}

const rmPost = function(req,res){
    if(!req.query._id && !req.query.post_id){
        res.send({
            status:"Fail",
            message : "Important data missing Kindly check and send again"
        })
    }
    else{
        Content.countDocuments({$and:[{_id:req.query.post_id},{userID:req.query._id}]})
            .then(count =>{
                if(count > 0){
                    Content.findOne({$and:[{_id:req.query.post_id},{userID:req.query._id}]})
                        .then(data =>{
                            firebase.file(data.firebaseFile).delete()
                                .then(()=>{
                                    Content.deleteOne({$and:[{_id:req.query.post_id},{userID:req.query._id}]})
                                        .then(data =>{
                                            comment.deleteMany({postID:req.query.post_id})
                                                .then(data=>{
                                                    res.send({
                                                        status:"Success",
                                                        message:"Your post is deleted"
                                                    })
                                                })
                                                .catch(err=>{
                                                    res.send({
                                                        status:"Fail",
                                                        message:"Error occurred while querying !!!"
                                                    })
                                                })        
                                        })
                                        .catch(err=>{
                                            res.send({
                                                status:"Fail",
                                                message:"Error occurred while querying !!!"
                                            })
                                        })
                                })

                        })
                        .catch(err=>{
                            res.send({
                                status:"Fail",
                                message:"Error occurred while removing file from firebase !!!"
                            })
                        })
                }
                else{
                    res.send({
                        status:"Fail",
                        message:"The post is not present !!!!!"
                    })
                }
            })
            .catch(err=>{
                res.send({
                    status:"Fail",
                    message:"Error occurred while querying !!!"
                })
            })
    }
}

module.exports = {
    uploadPost : uploadPost,
    postList : postList,
    postLike : postLike,
    postComment : postComment,
    viewCont : viewCont,
    updateCont : updateCont,
    rmPost : rmPost
}