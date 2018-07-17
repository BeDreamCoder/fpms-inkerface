/**
 * Created by wangh09 on 2017/12/13.
 */

let helper = require('../../public/inkchain-samples/app/helper');
let invokeSignedHandler = require('../../public/inkchain-samples/app/invoke-signed-shot');

async function sleep(duration) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, duration);
    });
}

// "address":"i4230a12f5b0693dd88bb35c79d7e56a68614b199"
// "private_key":"bc4bcb06a0793961aec4ee377796e050561b6a84852deccea5ad4583bb31eebe"
async function transfer() {
    await sleep(1000);
    invokeSignedHandler.invokeChaincodeSigned(['peer1'], 'mychannel', 'token', 'transfer', ["i411b6f8f24F28CaAFE514c16E11800167f8EBd89", "INK", "1000000000000"], 'user2', 'org1', '1000000000', 'test', 'bc4bcb06a0793961aec4ee377796e050561b6a84852deccea5ad4583bb31eebe').then((result) => {
        console.log('txid:',result);
    }).then(() => {
        helper.disconnectEventHub('org1');
        helper.disconnectEventHub('org2');
    });
}

transfer();