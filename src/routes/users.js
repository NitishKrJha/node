var checkAuth = require("../middleware/check-auth");
var users = require("../controllers/users");
var role = require("../controllers/role");
const {Router} = require('express');

let route = Router();
route
    .get("/users",  checkAuth.checkOrganizationUser, users.details) 
    .get("/users/:id", checkAuth.checkOrganizationUser,users.details)
    .post("/get_users_list/", checkAuth.checkOrganizationUser,users.get_list)
    .post("/users_list/",checkAuth.checkOrganizationUser,users.get_list)
    .post("/do_register",users.do_register)
    .post("/update_member",checkAuth.checkOrganizationUser, users.update_member)
    .post("/change_password",checkAuth.checkOrganizationUser, users.change_password)
    .post("/forget_password",users.forget_password)
    .post("/reset_password/:reset_token",users.reset_password)
    .post("/users/get_user_location/",checkAuth.checkOrganizationUser,users.get_user_location)
    .get("/users/update_location/",checkAuth.checkOrganizationUser,users.get_user_location)
    .get("/get_chat_users/",checkAuth.checkOrganizationUser,users.get_chat_users)
    .get("/get_subscription_detais/",checkAuth.checkAdminUser,users.get_subscription_detais)
    .post("/update_subscription/",checkAuth.checkAdminUser,users.update_subscription)
    .get("/cancel_subscription/",checkAuth.checkAdminUser,users.cancel_subscription)
    //.get("/suspend_user/:user_id",checkAuth.checkSuperAdmin,users.cancel_subscription)
    .post("/do_trial_register",users.do_trial_register)
    .post("/do_now_register",users.do_now_register)
    .get("/user_role/:id", checkAuth.checkOrganizationUser,role.details)
    .post("/user_role",checkAuth.checkOrganizationUser, role.update_details_role)
    .get("/role_list/:name", checkAuth.checkOrganizationUser,role.role_group)
    .post("/do_form_validation/",users.do_form_validation)
    .get("/member_info/:id", users.member_info)
    
    
module.exports.userRoute = route;