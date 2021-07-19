var checkAuth = require("../middleware/check-auth");
var importdata = require("../controllers/importdata");
const {Router} = require('express');

let route = Router();
route

    .get("/importdata/insert_default_store/",importdata.insert_default_store)
    .get("/importdata/importUser/",importdata.importUser)
    .get("/importdata/importcalender/",importdata.importcalender)
    .get("/importdata/getUsers/",importdata.getUsers)
    .get("/importdata/importEmployee/",importdata.importEmployee)
    .get("/importdata/add_business/",importdata.add_business)
    .get("/importdata/importCustomer/",importdata.importCustomer)
    .get("/importdata/add_store/",importdata.add_store)
    .get("/importdata/add_lead/",importdata.add_lead)
    .get("/importdata/add_supplier",importdata.add_supplier)
    .get("/importdata/getSuppliers",importdata.getSuppliers)
    .get("/importdata/addProduct",importdata.addProduct)
    .get("/importdata/addinvoice",importdata.add_invoice)
    .get("/importdata/map_product_with_business",importdata.map_product_with_business)
    .get("/importdata/add_menu_settings",importdata.add_menu_settings)
    .get("/importdata/update_products",importdata.update_products)
    .get("/importdata/add_job",importdata.add_job)
    .get("/importdata/add_notification",importdata.add_user_activity)
    .get("/update_mysql/:table/:new_coloum/:mongo_coloum_to_select/:exist_mysql_coloum/:relational_mongo_coloum/:users_type",importdata.update_mysql)

module.exports.importRouter = route;