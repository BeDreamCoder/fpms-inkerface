/**
 * Created by wangh09 on 2017/12/12.
 */
let helper = require('../../public/inkchain-samples/app/helper');
let instantiateCCHandler = require('../../public/inkchain-samples/app/instantiate-chaincode');

const CC_ID = 'token';
const CC_VERSION = '1.0';
const CHANNEL_NAME = 'mychannel';

async function sleep(duration) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, duration);
    });
}

async function instantiateChaincode() {
    await sleep(1000);
    instantiateCCHandler.instantiateChaincode(CHANNEL_NAME, CC_ID, CC_VERSION, 'init', [], 'admin', 'org1').then((result) => {
        console.log(result);
    }).then(() => {
        helper.disconnectEventHub('org1');
        helper.disconnectEventHub('org2');
    });
}

instantiateChaincode();
