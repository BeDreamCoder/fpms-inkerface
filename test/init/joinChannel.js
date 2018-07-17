/**
 * Created by wangh09 on 2017/12/12.
 */
let helper = require('../../public/inkchain-samples/app/helper');
let joinChannelHandler = require('../../public/inkchain-samples/app/join-channel');

async function sleep(duration) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, duration);
    });
}

async function joinChannel() {
    await sleep(1000);
    joinChannelHandler.joinChannel("mychannel", ['peer1', 'peer2'], 'admin', 'org1').then((result) => {
        console.log(result);
    }).then(()=>{
        joinChannelHandler.joinChannel("mychannel",['peer1','peer2'], 'admin', 'org2').then((result) => {
            console.log(result);
        })
    }).then(() => {
        helper.disconnectEventHub('org1');
        helper.disconnectEventHub('org2');
    });
}

joinChannel();
