/**
 * Created by zhanghao on 2018/05/10.
 */
let helper = require('../../public/inkchain-samples/app/helper');
let multiInvokeHandler = require('../../public/inkchain-samples/app/invoke-signed-shot');

async function sleep(duration) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, duration);
    });
}

async function registerPlatform() {
    await sleep(1000);
    multiInvokeHandler.multiIvokeChaincodeSigned(
        [{org: "org1", peers: ["peer1"]}, {org: "org2", peers: ["peer1"]}],//peer
        'mychannel',//通道名称
        'xscc',//链码名称
        'registerPlatform',//方法名称
        ['QTUM'],//参数 公链名称
        'user2',//请求身份
        '100000000',//gas limit
        '',//desc
        'bc4bcb06a0793961aec4ee377796e050561b6a84852deccea5ad4583bb31eebe'//签名
    ).then((result) => {
        console.log(result);
        multiInvokeHandler.multiIvokeChaincodeSigned(
            [{org: "org1", peers: ["peer1"]}, {org: "org2", peers: ["peer1"]}],//peer
            'mychannel',//通道名称
            'xscc',//链码名称
            'registerPlatform',//方法名称
            ['ETH'],//参数 公链名称
            'user2',//请求身份
            '100000000',//gas limit
            '',//desc
            'bc4bcb06a0793961aec4ee377796e050561b6a84852deccea5ad4583bb31eebe'//签名
        ).then((result) => {
            console.log(result);
            helper.disconnectEventHub('org1');
            helper.disconnectEventHub('org2');
        })
    });
}

registerPlatform();
