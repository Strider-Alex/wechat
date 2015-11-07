var express = require('express');
var router = express.Router();
var config=require("../config.json");

router.get('/', function(req, res, next) {
    //res.send(req.query.code);
    var https = require('https');
    var options = {
        hostname: 'api.weixin.qq.com',
        port: 443,
        path: '/sns/oauth2/access_token?appid='+config.app_id+'&secret='+config.app_secret+'&code='+req.query.code+'&grant_type=authorization_code',
        method: 'GET'
    };
    var auth_data;
    var auth_req = https.request(options, function(auth_res) {
        auth_res.on('data', function(data) {
            auth_data=JSON.parse(data.toString());
            process.stdout.write(data);
            res.send(auth_data.openid);
        });
    });
    auth_req.end();
    //res.send(auth_data.openid);
});

module.exports = router;
