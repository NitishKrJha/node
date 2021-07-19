var checkAuth = require("../middleware/check-auth");
var leads = require("../controllers/leads");

const {Router} = require('express');

let route = Router();
route
    .post("/get_customers",checkAuth.checkOrganizationUser,leads.get_customers)
    .post("/add_edit_leads",checkAuth.checkOrganizationUser,leads.add_edit_leads)
    .post("/quick_update_lead",checkAuth.checkOrganizationUser,leads.delete_active_lead)
    .post("/quickUpdate/:customertype/:_id",checkAuth.checkOrganizationUser,leads.quickUpdate)
    .post("/get_number_ditels/",checkAuth.checkOrganizationUser,leads.get_number_ditels)
    .post("/impotrt_csv/",checkAuth.checkOrganizationUser,leads.impotrt_csv)


module.exports.leadsRouter = route;