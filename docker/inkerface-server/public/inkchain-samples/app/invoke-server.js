/**
 * Created by wangh09 on 2017/12/13.
 */
'use strict';

const Long = require('long');
let invokeHandler = require('./invoke-transaction');
let queryHandler = require('./query');
let config = require('../../../config/config.json');
let org = config.orgName;
let user = config.userName;

let queue_length = 0;
let max_queue_length = 3000;
var invoke = async function (peerNames, channelName, chaincodeName, fcn, args, senderAddress, msg, inkLimit, counter, sig) {
    while (queue_length >= max_queue_length) {
        await sleep(300);
    }
    queue_length++;
    let senderSpec = {
        sender: Buffer.from(senderAddress),
        counter: Long.fromString(counter.toString()),
        ink_limit: Buffer.from(inkLimit),
        msg: Buffer.from(msg)
    };

    return invokeHandler.invokeChaincodePersist(peerNames, channelName, chaincodeName, fcn, args, user, org, senderSpec, sig).then((result) => {

        queue_length--;
        senderSpec = null;
        return result;
    }).catch((err) => {

        queue_length--;
        senderSpec = null;
        throw err;
    });
};
// cross chain invoke
var multiInvoke = function (peersInfo, channelName, chaincodeName, fcn, args, username, senderAddress, msg, inkLimit, counter, sig) {
    let senderSpec = {
        sender: Buffer.from(senderAddress),
        counter: Long.fromString(counter.toString()),
        ink_limit: Buffer.from(inkLimit),
        msg: Buffer.from(msg)
    };

    return invokeHandler.multiInvokeChaincodePersist(peersInfo, channelName, chaincodeName, fcn, args, username, senderSpec, sig)
        .then((result) => {
            return result;
        }).catch((err) => {
            throw err;
        });
};

var query = function (peer, channelName, CC_ID, fcn, args) {
    return queryHandler.queryChaincodePersist(peer, channelName, CC_ID, args, fcn, user, org);
};

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports.invoke = invoke;
module.exports.query = query;
module.exports.multiInvoke = multiInvoke;
