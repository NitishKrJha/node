const { Router } = require('express');
let router = Router();

//const { userRoute } = require('./users');
const { importRouter } = require('./import_data');

//router.use('/users', userRoute);
router.use('/', importRouter);
router.use('/',(req,res)=>{
    res.send({success:1});
})

module.exports.routesPath = router;