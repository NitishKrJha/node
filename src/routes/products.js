var checkAuth = require("../middleware/check-auth");
var products = require("../controllers/products");
const {Router} = require('express');

let route = Router();
route
    .post("/products",checkAuth.checkOrganizationUser,products.get_products)
    .post("/products_add_edit",checkAuth.checkOrganizationUser,products.add_products)
    .get("/products_attributes/:id", checkAuth.checkOrganizationUser,products.get_product_attributes)
    .post("/update_attributes/:id", checkAuth.checkOrganizationUser,products.update_attributes)
    .get('/category/:q',checkAuth.checkOrganizationUser,products.get_categoty)
    .post('/delete_product/',checkAuth.checkOrganizationUser,products.delete_product)
    .post('/store_transfer',checkAuth.checkOrganizationUser,products.store_transfer)
    .post('/update_product_quantity',checkAuth.checkOrganizationUser,products.update_product_quantity)
    .post("/product_store_transfer_log",checkAuth.checkOrganizationUser,products.get_transfer_log)
    .post("/quick_product_update",checkAuth.checkOrganizationUser,products.quick_product_update)
    .post("/return_to_supplier",checkAuth.checkOrganizationUser,products.return_to_supplier)
    .post("/get_returned_item",checkAuth.checkOrganizationUser,products.get_returned_item);

module.exports.productRoutes = route;