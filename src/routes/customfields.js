var checkAuth = require("../middleware/check-auth");
var customfields = require("../controllers/customfields");
const {Router} = require('express');

let route = Router();
route
    .post("/add_edit_field/", checkAuth.checkOrganizationUser,customfields.add_edit_field)
 
module.exports.customfieldsRoutes = route;