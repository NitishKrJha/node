var checkAuth = require("../middleware/check-auth");
var store = require("../controllers/store");
const {Router} = require('express');

let route = Router();
route
    .post("/get_store_list/", checkAuth.checkOrganizationUser,store.get_list)
    .post("/insert_details_store/", checkAuth.checkOrganizationUser,store.insert_details_store)
    .get("/store/:id",checkAuth.checkOrganizationUser,store.details)
    .post("/store/:id",checkAuth.checkOrganizationUser,store.update_details_store)

module.exports.storeRoutes = route;