/**
 * Created by wangh09 on 2017/12/19.
 */
let helper = require('../../public/inkchain-samples/app/helper');
let queryHandler = require('../../public/inkchain-samples/app/query');

async function sleep(duration) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, duration);
    });
}

async function getAccount() {
    await sleep(1000);
    queryHandler.queryChaincode('peer1', 'mychannel', 'token', ["i411b6f8f24F28CaAFE514c16E11800167f8EBd89"], 'getAccount', 'user2', 'org1').then((result) => {
        console.log(result[0].toString());
    }).then(() => {
        helper.disconnectEventHub('org1');
    });
}
getAccount();