const { Router } = require('express');
let router = Router();

//const { userRoute } = require('./users');


//router.use('/users', userRoute);
router.use('/',(req,res)=>{
    res.send({success:1});
})

module.exports.routesPath = router;