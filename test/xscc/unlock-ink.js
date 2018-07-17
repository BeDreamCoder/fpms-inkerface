/**
 * Created by zhanghao on 2018/05/10.
 */
let invokeSignedHandler = require('../../public/inkchain-samples/app/invoke-signed-shot');

invokeSignedHandler.multiIvokeChaincodeSigned(
    [{org: "org1", peers: ["peer1"]}, {org: "org2", peers: ["peer1"]}],//peer
    'mychannel',//通道名称
    'xscc',//合约名称
    'unlock', //方法名称
    [
        "QTUM",//公链平台
        "9a80750eb831667d4c28d300f4bf7f2c3279be4f",//公链账户address
        "7000000000",//金额
        "i7a178b3da54171fd419c6d468a6a9237a4776f31",//联盟链address
        "0bde6b07fdd00e674ef4bbab01517a89a09dc4dd739afacb62ca3f8119f2d4bb",//公链txId
        "INK"
    ],
    'user2',//请求身份
    '50000000',//gas limit
    '',//desc
    'bc4bcb06a0793961aec4ee377796e050561b6a84852deccea5ad4583bb31eebe'//签名
).then((result) => {
    console.log(result);
});

