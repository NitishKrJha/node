var checkAuth = require("../middleware/check-auth");
var auth = require("../controllers/auth");
const {Router} = require('express');

let route = Router();
route
    .post("/login",auth.login)
    .get("/get_token",auth.get_token)
    .get("/logout",auth.logout)

module.exports.authRoute = route;