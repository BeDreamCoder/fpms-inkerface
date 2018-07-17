/**
 * Created by zhanghao on 2018/05/10.
 */
require('../config');
let queryHandler = require('../query');

queryHandler.queryChaincode (
    'peer1',
    'mychannel',
    'xscc',//链码名称
    ["eth|0x666029e77e77ad9136320d769214ea9790cd25e0f9318c261b454f7c3e5f5e49"],//请求参数 txId
    'queryTxInfo',//请求方法
    'user2',//请求身份
    'org1'
).then((result) => {
    console.log(result[0].toString());
});