var checkAuth = require("../middleware/check-auth");
var contacts = require("../controllers/contacts");
const {Router} = require('express');

let route = Router();
route
    .post("/get_contacts",checkAuth.checkOrganizationUser,contacts.get_contacts)
    .post("/add_edit_contacts",checkAuth.checkOrganizationUser,contacts.add_edit_contacts)
    .post("/quick_update_contacts",checkAuth.checkOrganizationUser,contacts.delete_active_contacts)

module.exports.contactsRouter = route;