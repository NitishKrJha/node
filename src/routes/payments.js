var checkAuth = require("../middleware/check-auth");
var payment_gateway_callback = require("../controllers/payment_gateway_callback");
var payment_log = require("../controllers/payment");
const {Router} = require('express');

let route = Router();
route

    .post("/payment_gateway_callback",payment_gateway_callback.add_response)
    .post("/get_payment_history",checkAuth.checkOrganizationUser,payment_log.get_payment_history)
    .post("/insert_payment",checkAuth.checkOrganizationUser,payment_log.insert_payment)
    .post("/add_payment_log",checkAuth.checkOrganizationUser,payment_log.add_payment_log);

module.exports.paymentRouter = route;