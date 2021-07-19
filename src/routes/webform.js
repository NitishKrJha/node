var checkAuth = require("../middleware/check-auth");
var webform = require("../controllers/webform");
const { Router } = require('express');

let route = Router();
route
    .post("/save_data/:id", webform.save_data)
    .post("/get_data/", checkAuth.checkOrganizationUser, webform.get_data)


module.exports.webFormRouter = route;