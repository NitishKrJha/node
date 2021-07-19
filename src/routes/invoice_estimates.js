var checkAuth = require("../middleware/check-auth");
var invoice = require("../controllers/invoice");
var estimate = require("../controllers/estimate");
const {Router} = require('express');

let route = Router();
route
    .post("/check_invoice_number/", checkAuth.checkOrganizationUser,invoice.check_invoice_number)
    .post("/get_invoice_list/", checkAuth.checkOrganizationUser,invoice.get_list)
    .get("/get_invoice/:id",checkAuth.checkOrganizationUser,invoice.details)
    .post("/create_invoice_number/", checkAuth.checkOrganizationUser,invoice.create_invoice_number)
    .post("/insert_details_invoice/",checkAuth.checkOrganizationUser,invoice.insert_details_invoice)
    .post("/update_details_invoice/:id",checkAuth.checkOrganizationUser,invoice.update_details_invoice)
    .get("/delete_invoice/:id",checkAuth.checkOrganizationUser,invoice.delete_invoice)
    
    .post("/get_estimate_list/",checkAuth.checkOrganizationUser,estimate.get_list)
    .get("/get_estimate/:id",checkAuth.checkOrganizationUser,estimate.details)
    .post("/insert_details_estimate/",checkAuth.checkOrganizationUser,estimate.insert_details_estimate)
    .post("/update_details_estimate/:id",checkAuth.checkOrganizationUser,estimate.update_details_estimate)       
    .post("/quick_update/",checkAuth.checkOrganizationUser,estimate.quick_update)

    .post("/get_list_package/", checkAuth.checkOrganizationUser,invoice.get_list_package)
    .post("/insert_details_package/",checkAuth.checkOrganizationUser,invoice.insert_details_package)
    .post("/update_details_package/:id",checkAuth.checkOrganizationUser,invoice.update_details_package)

    .post("/get_numbers/", checkAuth.checkOrganizationUser,invoice.get_numbers)

module.exports.invoiceEstimateRouter = route;