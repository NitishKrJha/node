var checkAuth = require("../middleware/check-auth");
var callschedule = require("../controllers/callschedule");
const {Router} = require('express');

let route = Router();
route
    .post("/get_callschedule",checkAuth.checkOrganizationUser,callschedule.get_callschedule)
    .post("/add_edit_callschedule",checkAuth.checkOrganizationUser,callschedule.add_edit_schedule)
    .post("/quick_update_callschedule",checkAuth.checkOrganizationUser,callschedule.delete_active_schedule)
    .get("/push_notification/:type",callschedule.push_notification)

module.exports.callscheduleRouter = route;