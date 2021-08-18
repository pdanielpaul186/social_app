const content = require('../controllers/content.controller');

var express = require('express');
var router = express.Router();

//create new user for social app
router.post("/",content.uploadPost);

//find posts
router.get("/",content.postList);

//like posts
router.post("/like",content.postLike);

//comment posts
router.post("/comment",content.postComment);

module.exports = router;