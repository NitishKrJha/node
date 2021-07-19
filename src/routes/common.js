var checkAuth = require("../middleware/check-auth");
var common = require("../controllers/common");
const {Router} = require('express');

let route = Router();
//checkAuth.checkOrganizationUser,
route
    .get("/search_everything/:search_text",checkAuth.checkOrganizationUser,common.common_search)
    
module.exports.commonRouter = route;