var checkAuth = require("../middleware/check-auth");
var screenmonitoring = require("../controllers/screenmonitoring");
const {Router} = require('express');

let route = Router();
route
    .post("/save_activity",checkAuth.checkOrganizationUser,screenmonitoring.save_activity)

module.exports.screenmonitoring = route;