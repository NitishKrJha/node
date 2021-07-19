var checkAuth = require("../middleware/check-auth");
var smsRecordes = require("../controllers/sms_recordes");
const {Router} = require('express');

let route = Router();
route
    .post("/add_recorde/", checkAuth.checkOrganizationUser,smsRecordes.add_recorde)
    .post("/get_list/", checkAuth.checkOrganizationUser,smsRecordes.get_list)
    .post("/quick_update/", checkAuth.checkOrganizationUser,smsRecordes.quick_update)
 
module.exports.smsRecordes = route;