var checkAuth = require("../middleware/check-auth");
var business = require("../controllers/business");
const {Router} = require('express');

let route = Router();
route
    .get("/business/:id",checkAuth.checkOrganizationUser,business.details)
    .post("/insert_details_business/",checkAuth.checkOrganizationUser,business.insert_details_business)
    .post("/business/:id", checkAuth.checkOrganizationUser,business.update_details_buisness)
    .post("/update_details_sms/:id", checkAuth.checkOrganizationUser,business.update_details_sms)
    .get("/business_details/:id",business.details)

module.exports.businessRoutes = route;