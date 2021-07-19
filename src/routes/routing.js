var checkAuth = require("../middleware/check-auth");

module.exports = function(app) {
    app.get('/', function(req, res) {
        res.json({
            status: 'SUCCESS'
        })
    });

    var dashboard = require("../controllers/dashboard");
    var importdata = require("../controllers/importdata");
    var auth = require("../controllers/auth");
    var users = require("../controllers/users");
    var products = require("../controllers/products");
    var payment_gateway_callback = require("../controllers/payment_gateway_callback");
    var supplier = require("../controllers/supplier");
    var store = require("../controllers/store");
    var business = require("../controllers/business");
    // var user = require("./controller/user");
    var products = require("../controllers/products");
    var member = require("../controllers/member");
    var invoice = require("../controllers/invoice");
    var estimate = require("../controllers/estimate");
    var customfields = require("../controllers/customfields");
    var call_recordes = require("../controllers/call_recordes");
    var payment_gateway_callback = require("../controllers/payment_gateway_callback");
    var leads = require("../controllers/leads");
    // var offer = require("./controller/offers");
    var payment_log = require("../controllers/payment");
     app

        .get("/dashboard/",checkAuth.checkOrganizationUser,dashboard.get_small_widgets)
        .post("/dashboard/",checkAuth.checkOrganizationUser,dashboard.save_small_widgets)
        .get("/get_dashboard/big_widgets/",checkAuth.checkOrganizationUser,dashboard.get_big_widgets)

        /** Import Part */
        .get("/importdata/importUser/",importdata.importUser)
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

        /** Call back of payment gatewat **/
        .post("/payment_gateway_callback",payment_gateway_callback.add_response)

        /** Login **/
        .post("/login",auth.login)
        .get("/get_token",auth.get_token)
        .get("/logout",auth.logout)

        /** Users Details **/
        .get("/users",  checkAuth.checkOrganizationUser, users.details) 
        .get("/users/:id", checkAuth.checkOrganizationUser,users.details)
        .post("/get_users_list/", checkAuth.checkOrganizationUser,users.get_list)
         .post("/users_list/",checkAuth.checkOrganizationUser,users.get_list)

        .post("/get_supplier_list/", checkAuth.checkOrganizationUser,supplier.get_list)
        .post("/insert_supplier/", checkAuth.checkOrganizationUser,supplier.insert_details_supplier)
        .get("/supplier/:id", checkAuth.checkOrganizationUser,supplier.details)
        .post("/supplier/:id", checkAuth.checkOrganizationUser,supplier.update_details_supplier)
        
        .post("/get_store_list/", checkAuth.checkOrganizationUser,store.get_list)
        .post("/insert_details_store/", checkAuth.checkOrganizationUser,store.insert_details_store)
        .get("/store/:id",checkAuth.checkOrganizationUser,store.details)
        .post("/store/:id",checkAuth.checkOrganizationUser,store.update_details_store)

        .get("/business/:id",checkAuth.checkOrganizationUser,business.details)
        .post("/insert_details_business/",checkAuth.checkOrganizationUser,business.insert_details_business)
        .post("/business/:id", checkAuth.checkOrganizationUser,business.update_details_buisness)

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
         .post("/get_returned_item",checkAuth.checkOrganizationUser,products.get_returned_item)

        .post("/insert_details_member/", checkAuth.checkOrganizationUser,member.insert_details_member)
        .post("/update_details_member/:id",checkAuth.checkOrganizationUser,member.update_details_member)

        .post("/check_invoice_number/", checkAuth.checkOrganizationUser,invoice.check_invoice_number)
        .post("/get_invoice_list/", checkAuth.checkOrganizationUser,invoice.get_list)
        .get("/get_invoice/:id",checkAuth.checkOrganizationUser,invoice.details)
        .post("/create_invoice_number/", checkAuth.checkOrganizationUser,invoice.create_invoice_number)
        .post("/insert_details_invoice/",checkAuth.checkOrganizationUser,invoice.insert_details_invoice)
        .post("/update_details_invoice/:id",checkAuth.checkOrganizationUser,invoice.update_details_invoice)

        .post("/get_estimate_list/",checkAuth.checkOrganizationUser,estimate.get_list)
        .get("/get_estimate/:id",checkAuth.checkOrganizationUser,estimate.details)
        .post("/insert_details_estimate/",checkAuth.checkOrganizationUser,estimate.insert_details_estimate)
        .post("/update_details_estimate/:id",checkAuth.checkOrganizationUser,estimate.update_details_estimate)       
        .post("/quick_update/",checkAuth.checkOrganizationUser,estimate.quick_update)

        .post("/get_list_package/", checkAuth.checkOrganizationUser,invoice.get_list_package)
        .post("/insert_details_package/",checkAuth.checkOrganizationUser,invoice.insert_details_package)
        .post("/update_details_package/:id",checkAuth.checkOrganizationUser,invoice.update_details_package)
        
        .post("/get_customers",checkAuth.checkOrganizationUser,leads.get_customers)
        .post("/add_edit_leads",checkAuth.checkOrganizationUser,leads.add_edit_leads)
        .post("/quick_update_lead",checkAuth.checkOrganizationUser,leads.delete_active_lead)

        .get("/update_mysql/:table/:new_coloum/:mongo_coloum_to_select/:exist_mysql_coloum/:relational_mongo_coloum/:users_type",importdata.update_mysql)
        .post("/add_payment_log",checkAuth.checkOrganizationUser,payment_log.add_payment_log)
        .post("/do_register",users.do_register)

        .post("/update_member",checkAuth.checkOrganizationUser, users.update_member)

        .post("/change_password",checkAuth.checkOrganizationUser, users.change_password)
        .post("/update_member_service/:id",checkAuth.checkOrganizationUser, member.update_member_service)
        .post("/add_edit_field/", checkAuth.checkOrganizationUser,customfields.add_edit_field)
        .post("/add_recorde/", checkAuth.checkOrganizationUser,call_recordes.add_edit_field)
        .post("/get_list/", checkAuth.checkOrganizationUser,call_recordes.get_list)
};
