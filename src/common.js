module.exports = {
    myLogger : function(req, res) {
        if(typeof req.params.key=='undefined' || req.params.key != global.key ){
            return res.status(401).json({'status':401,'message':'Unauthorized'});
        }
    }
}