/**
 * Created by wangh09 on 2017/12/14.
 */
require('../../public/inkchain-samples/app/config');
let queryHandler = require('../../public/inkchain-samples/app/query');
const Client = require('inkchain-client');

queryHandler.queryChaincode('peer1', 'mychannel', 'ascc', ['INK'], 'queryToken', 'user2', 'org1').then((result) =>{
    console.log(JSON.stringify(result[0].toString()));
});
