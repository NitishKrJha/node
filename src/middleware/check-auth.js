const jwt = require('jsonwebtoken');
var UserdetailsModel = require('../models/user_details');

module.exports = {
    validateToken : function(req, res, next){
        try {
            
            if(req.headers.authorization){
                var token = req.headers.authorization.split(" ")[1];           
            }else{
                var token = req.body.token;
            }
            const decoded = jwt.verify(token, process.env.JWT_KEY);
            req.token_data = decoded;
            req.token_data.token = token
            next();
        } catch (error) {
            return res.status(401).json({
                message: 'Auth failed',
                error : error
            });
        }
    },

    checkOrganizationUser : function(req, res, next){
        module.exports.validateToken(req, res, function(){
            var user_type = req.token_data.user_type;
            if(user_type!='Admin' && user_type!='Employee'){
                res.status(401).send({
                    'error':1,
                    'message':'Unauthorized Access'
                })
            }else{
                next();
            }
        });
    },
    checkAdminUser : function(req, res, next){
        module.exports.validateToken(req, res, function(){
            var user_type = req.token_data.user_type;
            if(user_type!='Admin'){
                res.status(401).send({
                    'error':1,
                    'message':'Unauthorized Access'
                })
            }else{
                next();
            }
        });
    },
    checkCronUser : function(req, res, next){
        if(req.body.security_key=="cron_huyguydsadb1233hfdf7fdsffjo"){
            next();
        }else{
            res.status(401).send({
                'error':1,
                'message':'Unauthorized Access'
            })
        }
    },
    checkSuperAdmin : function(req, res, next){
        module.exports.validateToken(req, res, async function(){
            var userInfo = await UserdetailsModel.findById(req.token_data.id,{if_super_user:1});
            if(userInfo.if_super_user===true){
                next();
            }else{
                res.status(401).send({
                    'error':1,
                    'message':'Unauthorized Access'
                })
            }
        });
    }
};
