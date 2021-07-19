var checkAuth = require("../middleware/check-auth");
var activity = require("../controllers/activity");
const {Router} = require('express');

let route = Router();
route
    .post("/get_activity",checkAuth.checkOrganizationUser,activity.get_activity)
    .get("/unread_message_count",checkAuth.checkOrganizationUser,activity.get_unread_chat)
    .post("/send_notification",checkAuth.checkOrganizationUser,activity.sendPushNotification)
    .post("/get_notification",checkAuth.checkOrganizationUser,activity.get_notification)
    .post("/count_notification",checkAuth.checkOrganizationUser,activity.count_notification)
    .post("/update_notification",checkAuth.checkOrganizationUser,activity.update_actvity)
    
module.exports.activityRouter = route;