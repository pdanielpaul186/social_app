const content = require('../controllers/content.controller');

var express = require('express');
var router = express.Router();

//create new user for social app
router.post("/",content.uploadPost);

//find posts
router.get("/",content.postList);

//view your posts
router.get("/viewCont",content.viewCont);

//like posts
router.post("/like",content.postLike);

//comment posts
router.post("/comment",content.postComment);

//update posts
router.put("/",content.updateCont);

module.exports = router;