var checkAuth = require("../middleware/check-auth");
var supplier = require("../controllers/supplier");
const {Router} = require('express');

let route = Router();
route
    .post("/get_supplier_list/", checkAuth.checkOrganizationUser,supplier.get_list)
    .post("/insert_supplier/", checkAuth.checkOrganizationUser,supplier.insert_details_supplier)
    .get("/supplier/:id", checkAuth.checkOrganizationUser,supplier.details)
    .post("/supplier/:id", checkAuth.checkOrganizationUser,supplier.update_details_supplier)
    .post("/quick_update_supplier", checkAuth.checkOrganizationUser, supplier.delete_active_supplier)

module.exports.supplierRoutes = route;