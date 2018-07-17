/**
 * Created by wangh09 on 2017/12/13.
 */
require('../../public/inkchain-samples/app/config');
const CC_PATH = 'github.com/token';
const CC_ID = 'token';
const CC_VERSION = '1.0';
const CHANNEL_NAME = 'mychannel';
let helper = require('../../public/inkchain-samples/app/helper');
let joinChannelHandler = require('../../public/inkchain-samples/app/join-channel');
let createChannelHandler = require('../../public/inkchain-samples/app/create-channel');
let installCCHandler = require('../../public/inkchain-samples/app/install-chaincode');
let instantiateCCHandler = require('../../public/inkchain-samples/app/instantiate-chaincode');
let invokeHandler = require('../../public/inkchain-samples/app/invoke-transaction');

async function sleep(duration) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, duration);
    });
}

async function init() {
    await sleep(1000);
    createChannelHandler.createChannel(CHANNEL_NAME, "../../../config/artifacts/channel/mychannel.tx", 'admin', 'org1').then((result) => {
        console.log(result);
        setTimeout(() => {
            joinChannelHandler.joinChannel(CHANNEL_NAME, ['peer1', 'peer2'], 'admin', 'org1').then((result) => {
                console.log(result);
            }).then(() => {
                joinChannelHandler.joinChannel(CHANNEL_NAME, ['peer1', 'peer2'], 'admin', 'org2').then((result) => {
                    console.log(result);
                }).then(() => {
                    installCCHandler.installChaincode(['peer1', 'peer2'], CC_ID, CC_PATH, '1.0', 'admin', 'org1').then((result) => {
                        console.log(result);
                    }).then(() => {
                        installCCHandler.installChaincode(['peer1', 'peer2'], CC_ID, CC_PATH, '1.0', 'admin', 'org2').then((result) => {
                            console.log(result);
                            setTimeout(() => {
                                instantiateCCHandler.instantiateChaincode(CHANNEL_NAME, CC_ID, CC_VERSION, 'init', [], 'admin', 'org1').then((result) => {
                                    console.log(result);
                                }).then(() => {
                                    invokeHandler.invokeChaincodeAdmin(['peer1'], 'mychannel', 'ascc', 'registerAndIssueToken', ['INK', '1000000000000000000000000000', '18', 'i411b6f8f24F28CaAFE514c16E11800167f8EBd89'], 'admin', 'org1', null, null).then((result) => {
                                        console.log(result);
                                    });
                                });
                            }, 1000);
                        });
                    });
                });
            }).then((result));
        }, 1000);
    });
}
init();