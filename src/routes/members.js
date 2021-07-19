var checkAuth = require("../middleware/check-auth");
var member = require("../controllers/member");
const {Router} = require('express');

let route = Router();
route
    .post("/insert_details_member/", checkAuth.checkOrganizationUser,member.insert_details_member)
    .post("/update_details_member/:id",checkAuth.checkOrganizationUser,member.update_details_member)
    .post("/update_member_service/:id",checkAuth.checkOrganizationUser, member.update_member_service)

module.exports.memberRoutes = route;