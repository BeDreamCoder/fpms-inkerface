/**
 * Created by wangh09 on 2017/12/12.
 */
var util = require('util');
var path = require('path');
var hfc = require('inkchain-client');

var file = 'network-config%s.json';

var env = process.env.TARGET_NETWORK;
if (env)
    file = util.format(file, '-' + env);
else
    file = util.format(file, '');

hfc.addConfigFile(path.join(__dirname, '../../../config', file));
hfc.addConfigFile(path.join(__dirname, '../../../config/config.json'));