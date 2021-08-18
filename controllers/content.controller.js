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
const { file } = require('../config/firebase');

var uploadPost = async function(req,res){
    if(!req.query.email){
        res.send({
            status: "Error Occurred !!!",
            message: "Important Details Not Provided !!! \n Kindly Check !!!!"
        })
    }
    else{
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
                    email : req.query.email,
                    text : req.body.text,
                    fileType: req.file.mimetype,
                    status: "Active",
                    likes : 0,
                    comments: [],
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
}

module.exports = {
    uploadPost : uploadPost
}