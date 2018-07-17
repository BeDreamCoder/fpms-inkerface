/**
 * Created by wangh09 on 2017/12/14.
 */
let helper = require('../../public/inkchain-samples/app/helper');
let invokeHandler = require('../../public/inkchain-samples/app/invoke-transaction');

async function sleep(duration) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, duration);
    });
}

async function issueToken() {
    await sleep(1000);
    invokeHandler.invokeChaincodeAdmin(['peer1'], 'mychannel', 'ascc', 'registerAndIssueToken', ['INK', '1000000000000000000', '9', 'i4230a12f5b0693dd88bb35c79d7e56a68614b199'], 'admin', 'org1', null, null).then((result) => {
        console.log(result);
    }).then(() => {
        helper.disconnectEventHub('org1');
        helper.disconnectEventHub('org2');
    });
}

issueToken();