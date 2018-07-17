/**
 * Created by zhangtailin on 2018/6/15.
 */
'use strict';

var express = require('express'),
    bodyParser = require('body-parser'),
    Routes = require('./router/routes'),
    config = require('./config.json');

var app = express();
// parse urlencoded request bodies into req.body
app.use(bodyParser.json());

Routes(app);

let server = app.listen(config.port, () => {

    let host = server.address().address;
    let port = server.address().port;

    console.log("inkchain restful api, help http://%s:%s/help", host, port)
});