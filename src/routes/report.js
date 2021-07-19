var checkAuth = require("../middleware/check-auth");
var report = require("../controllers/report");
const {Router} = require('express');

let route = Router();
route
    .get("/test/",report.test)
    .post("/export/",checkAuth.checkOrganizationUser,report.export)
    .post("/fields/",checkAuth.checkOrganizationUser,report.get_field)
module.exports.reportRoutes = route;