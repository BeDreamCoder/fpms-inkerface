/**
 * Created by wangh09 on 2017/12/12.
 */
let helper = require('../../public/inkchain-samples/app/helper');
let createChannelHandler = require('../../public/inkchain-samples/app/create-channel');

async function sleep(duration) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, duration);
    });
}

async function createChannel() {
    await sleep(1000);
    createChannelHandler.createChannel("mychannel", "../../../config/artifacts/channel/mychannel.tx", 'admin', 'org1').then((result) => {
        console.log(result);
    }).then(() => {
        helper.disconnectEventHub('org1');
        helper.disconnectEventHub('org2');
    });
}

createChannel();
