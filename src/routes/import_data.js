//var checkAuth = require("../middleware/check-auth");
var importdata = require("../controllers/importdata");
const {Router} = require('express');

let route = Router();
route

    .get("/importdata/getUsers/",importdata.getUsers)

module.exports.importRouter = route;