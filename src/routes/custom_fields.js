var checkAuth = require("../middleware/check-auth");
var customfields = require("../controllers/customfields");
const { Router } = require('express');

let route = Router();
route
    .get("/get_customfiels/:module", checkAuth.checkOrganizationUser, customfields.get_customfields)
    .get("/get_customfields/:module", checkAuth.checkOrganizationUser, customfields.get_customfields)
    .get("/get_customfield/:_id", customfields.get_customfield_by_id)
    .post("/save_customfiels", checkAuth.checkOrganizationUser, customfields.save_customfiels)
    //.post("/quick_update_contacts",checkAuth.checkOrganizationUser,contacts.delete_active_contacts)

module.exports.customfieldsRouter = route;