var checkAuth = require("../middleware/check-auth");
var callRecordes = require("../controllers/call_recordes");
const {Router} = require('express');

let route = Router();
route
    .post("/add_recorde/", checkAuth.checkOrganizationUser,callRecordes.add_recorde)
    .post("/get_list/", checkAuth.checkOrganizationUser,callRecordes.get_list)
    .post("/get_list_recording/", checkAuth.checkOrganizationUser,callRecordes.get_list_recording)
 
module.exports.callRecordes = route;