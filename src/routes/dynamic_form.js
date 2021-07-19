var checkAuth = require("../middleware/check-auth");
var dynamicForm = require("../controllers/dynamic_form");
//var job = require("../controllers/job");
const {Router} = require('express');

let route = Router();
route
    .post("/dynamic_form_list/", checkAuth.checkOrganizationUser,dynamicForm.get_list)
    .post("/dynamic_form_add_edit/", checkAuth.checkOrganizationUser,dynamicForm.add_edit)
    .post("/quick_update_dynamic_form/",checkAuth.checkOrganizationUser,dynamicForm.delete_active_form)

module.exports.dynamicFormRoutes = route;