/**
 * Created by wangh09 on 2017/12/12.
 */
let helper = require('../../public/inkchain-samples/app/helper');
let installCCHandler = require('../../public/inkchain-samples/app/install-chaincode');

const TOKEN_CC_PATH = 'github.com/token';
const TOKEN_CC_ID = 'token';

async function sleep(duration) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, duration);
    });
}

async function installChaincode() {
    await sleep(1000);
    installCCHandler.installChaincode(['peer1', 'peer2'], TOKEN_CC_ID, TOKEN_CC_PATH, '1.0', 'admin', 'org1').then((result) => {
        console.log(result);
    }).then(()=>{
        installCCHandler.installChaincode(['peer1','peer2'], TOKEN_CC_ID, TOKEN_CC_PATH, '1.0', 'admin', 'org2').then((result) => {
            console.log(result);
        })
    }).then(() => {
        helper.disconnectEventHub('org1');
        helper.disconnectEventHub('org2');
    });
}

installChaincode();
