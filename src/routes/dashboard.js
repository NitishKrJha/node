var checkAuth = require("../middleware/check-auth");
var dashboard = require("../controllers/dashboard");
const {Router} = require('express');

let route = Router();
route
    .get("/dashboard/",checkAuth.checkOrganizationUser,dashboard.get_small_widgets)
    .post("/dashboard/",checkAuth.checkOrganizationUser,dashboard.save_small_widgets)
    .get("/get_dashboard/big_widgets/",checkAuth.checkOrganizationUser,dashboard.get_big_widgets)
    .get("/dashboard/app/",checkAuth.checkOrganizationUser,dashboard.get_app_dahboard_count)

module.exports.dashboardRouter = route;