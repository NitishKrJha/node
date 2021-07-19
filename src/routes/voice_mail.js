var checkAuth = require("../middleware/check-auth");
var voiceRecordes = require("../controllers/voice_mail");
const {Router} = require('express');

let route = Router();
route
    .post("/get_list/", checkAuth.checkOrganizationUser,voiceRecordes.get_list)
 
module.exports.voiceRecordes = route;