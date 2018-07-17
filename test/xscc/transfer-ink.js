/**
 * Created by zhanghao on 2018/05/10.
 */
let invokeSignedHandler = require('../../public/inkchain-samples/app/invoke-signed-shot');

invokeSignedHandler.multiIvokeChaincodeSigned(
    [{org: "org1", peers: ["peer1"]}, {org: "org2", peers: ["peer1"]}],//peers
    'mychannel',//channel名称
    'xscc',//链码名称
    'lock',//请求方法
    [
        "ETH",//公链名称
        "ca99c5b6c54c74e7c362d11a9395e897e2d64982",//公链账户地址
        "1000",//金额
        "INK"
    ],
    'user2',//请求身份
    '50000000',//gas limit
    '',//desc
    'bc4bcb06a0793961aec4ee377796e050561b6a84852deccea5ad4583bb31eebe'//签名
).then((result) => {
    console.log(result);
});