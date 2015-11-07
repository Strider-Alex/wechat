var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var wechat=require("wechat")


var routes = require('./routes/index');
var users = require('./routes/users');
var auth = require('./routes/auth')
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.query())

app.use('/', routes);
app.use('/users', users);
app.use('/auth', auth);




//wechat settings
var config=require("./config.json");
var menu = config.menu
var app_id=config.app_id
var app_secret=config.app_secret

//wechat
var API=require('wechat-api');
var api= new API(app_id,app_secret);

app.use('/wechat', wechat("youwillneverguess", function (req, res, next){
    //creat menu
    api.createMenu(menu, function(err,result){
        console.log(result)
    });
    //message is located in req.weixin
    var message=req.weixin;
    //response
    if (message.MsgType==="text"){
        if(/^\bbox\b\s+([\d\w]*)$/g.test(message.Content))
        {
            var https = require('https');
            var options = {
                hostname: 'api.zjuqsc.com',
                port: 443,
                path: '/box/get_api/'+/^\bbox\b\s+([\d\w_]*)$/g.exec(message.Content)[1],
                method: 'GET'
            };
            var box_req = https.request(options, function(box_res) {
                box_res.on('data', function(data) {
                    var box_file=JSON.parse(data);
                    if(box_file.err==0)
                    {
                        res.reply('下载<a href="http://box.zjuqsc.com/-'+/^\bbox\b\s+([\d\w_]*)$/g.exec(message.Content)[1]+'">'+box_file.info.filename+'</a>');
                    }
                    else
                    {
                        res.reply('该文件不存在');
                    }
                });
            });
            box_req.end();
        }
        else
          res.reply("You're talking to me.<a href='https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxdfba50ee9864437f&redirect_uri=http://test.wx.zjuqsc.com/auth&response_type=code&scope=snsapi_base&state=223#wechat_redirect'>auth</a>");
    }
    //welcome new user
    if((message.MsgType == 'event') && (message.Event == 'subscribe')){
        res.reply("welcome");
    }

}))

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
