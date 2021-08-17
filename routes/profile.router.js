const profile = require('../controllers/profile.controller');

var express = require('express');
var router = express.Router();

//create new user for social app
router.post("/",profile.createProfile);

//find suggestions
router.get("/",profile.profileSuggestion);

//add new friends
router.put("/",profile.addFrnds);

module.exports = router;