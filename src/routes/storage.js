var checkAuth = require("../middleware/check-auth");
var storage = require("../controllers/storage");
const {Router} = require('express');

let route = Router();
route
    .post("/get_storage",checkAuth.checkOrganizationUser,storage.get_storage)
    .post("/add_edit_storage",checkAuth.checkOrganizationUser,storage.add_edit_storage)
    .post("/quick_update_storage",checkAuth.checkOrganizationUser,storage.delete_active_storage)
    .get("/extend_storage",checkAuth.checkOrganizationUser,storage.extend_storage)
    .get("/get_storage_info",checkAuth.checkOrganizationUser,storage.get_storage_info)
    .post("/check_storage",checkAuth.checkOrganizationUser,storage.check_storage)

module.exports.storageRouter = route;