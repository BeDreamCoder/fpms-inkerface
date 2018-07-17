/**
 * Created by zhanghao on 2018/05/10.
 */
let queryHandler = require('../../public/inkchain-samples/app/query');

queryHandler.queryChaincode(
    'peer1',
    'mychannel',
    'xscc',
    ["54056a5cf1ec2b4cd775b95b48775a557c01ffb848a3171987a6487792202e56"],
    'querySignature',
    'user2', 'org1').then((result) => {
    console.log("1", result[0].toString());
}).then(() => {
    queryHandler.queryChaincode(
        'peer1',
        'mychannel',
        'xscc',
        ["54056a5cf1ec2b4cd775b95b48775a557c01ffb848a3171987a6487792202e56"],
        'querySignature',
        'user2', 'org2').then((result) => {
        console.log("2", result[0].toString());
    });
});