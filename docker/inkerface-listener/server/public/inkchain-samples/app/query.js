/**
 * Copyright 2017 IBM All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
'use strict';

var util = require('util');
var helper = require('./helper.js');
var logger = helper.getLogger('Query');

var queryChaincode = function (peer, channelName, chaincodeName, args, fcn, username, org) {
    var channel = helper.getChannelForOrg(org);
    var client = helper.getClientForOrg(org);
    var target = buildTarget(peer, org);
    return helper.getRegisteredUsers(username, org).then((user) => {
        let tx_id = client.newTransactionID();
        // send query
        var request = {
            chaincodeId: chaincodeName,
            txId: tx_id,
            fcn: fcn,
            args: args
        };
        return channel.queryByChaincode(request, target);
    }, (err) => {
        logger.error('Failed to get submitter \'' + username + '\'. Error: ' + err.stack ? err.stack : err);
        throw 'Failed to get submitter \'' + username + '\'';
    }).then((response_payloads) => {
        if (response_payloads && response_payloads[0] && Buffer.isBuffer(response_payloads[0])) {
            return response_payloads;
        } else if (response_payloads && response_payloads[0] && response_payloads[0].details) {
            logger.error(response_payloads[0].details);
            throw response_payloads[0].details;
        } else {
            logger.error('response_payloads is null');
            throw 'response_payloads is null';
        }
    }, (err) => {
        let message = util.format('Failed to send query due to error:', err.stack ? err.stack : err);
        logger.error(message);
        throw  message;
    }).catch((err) => {
        logger.error(util.format('queryChaincode catch error:', err.stack ? err.stack : err));
        throw err.stack ? err.stack : err;
    });
};

var queryChaincodePersist = function (peer, channelName, chaincodeName, args, fcn, username, org) {
    var channel = helper.getChannelForOrg(org);
    var client = helper.getClientForOrg(org);
    var target = buildTarget(peer, org);

    let tx_id = client.newTransactionID();
    // send query
    var request = {
        chaincodeId: chaincodeName,
        txId: tx_id,
        fcn: fcn,
        args: args
    };
    return channel.queryByChaincode(request, target).then((response_payloads) => {

        if (response_payloads && response_payloads[0] && Buffer.isBuffer(response_payloads[0])) {
            return response_payloads;
        } else if (response_payloads && response_payloads[0] && response_payloads[0].details) {
            logger.error(response_payloads[0].details);
            throw response_payloads[0].details;
        } else {
            logger.error('response_payloads is null');
            throw 'response_payloads is null';
        }
    }, (err) => {
        let message = util.format('Failed to send query due to error:', err.stack ? err.stack : err);
        logger.error(message);
        throw  message;
    }).catch((err) => {
        logger.error(util.format('queryChaincode catch error:', err.stack ? err.stack : err));

        throw err.stack ? err.stack : err;
    });
};

var getBlockByNumber = function (peer, blockNumber, username, org) {
    var target = buildTarget(peer, org);
    var channel = helper.getChannelForOrg(org);

    return channel.queryBlock(parseInt(blockNumber), target).then((response_payloads) => {
        if (response_payloads) {
            logger.debug(response_payloads);
            return response_payloads; //response_payloads.data.data[0].buffer;
        } else {
            logger.error('response_payloads is null');
            throw 'response_payloads is null';
        }
    }, (err) => {
        let message = util.format('getBlockByNumber, Failed to send query due to error:', err.stack ? err.stack : err);
        logger.error(message);
        throw  message;
    }).catch((err) => {
        logger.error(util.format('getBlockByNumber catch error:', err.stack ? err.stack : err));
        throw err.stack ? err.stack : err;
    });
};

var getBlockWithHashByNumber = function (peer, blockNumber, username, org) {
    var target = buildTarget(peer, org);
    var channel = helper.getChannelForOrg(org);

    return channel.queryBlockWithHash(parseInt(blockNumber), target).then((response_payloads) => {
        if (response_payloads) {
            //logger.debug(response_payloads);
            logger.debug(response_payloads);
            return response_payloads; //response_payloads.data.data[0].buffer;
        } else {
            logger.error('response_payloads is null');
            throw 'response_payloads is null';
        }
    }, (err) => {
        let message = util.format('getBlockWithHashByNumber, Failed to send query due to error:', err.stack ? err.stack : err);
        logger.error(message);
        throw  message;
    }).catch((err) => {
        logger.error(util.format('getBlockWithHashByNumber catch error:', err.stack ? err.stack : err));
        throw err.stack ? err.stack : err;
    });
};

var getTransactionByID = function (peer, trxnID, username, org) {
    var target = buildTarget(peer, org);
    var channel = helper.getChannelForOrg(org);

    return channel.queryTransaction(trxnID, target).then((response_payloads) => {
        if (response_payloads) {
            logger.debug(response_payloads);
            return response_payloads;
        } else {
            logger.error('response_payloads is null');
            throw 'response_payloads is null';
        }
    }, (err) => {
        let message = util.format('getTransactionByID, Failed to send query due to error:', err.stack ? err.stack : err);
        logger.error(message);
        throw  message;
    }).catch((err) => {
        logger.error(util.format('getTransactionByID catch error:', err.stack ? err.stack : err));
        throw err.stack ? err.stack : err;
    });
};
var getBlockByHash = function (peer, hash, username, org) {
    var target = buildTarget(peer, org);
    var channel = helper.getChannelForOrg(org);

    return channel.queryBlockByHash(Buffer.from(hash), target).then((response_payloads) => {
        if (response_payloads) {
            logger.debug(response_payloads);
            return response_payloads;
        } else {
            logger.error('response_payloads is null');
            throw 'response_payloads is null';
        }
    }, (err) => {
        let message = util.format('getBlockByHash, Failed to send query due to error:', err.stack ? err.stack : err);
        logger.error(message);
        throw  message;
    }).catch((err) => {
        logger.error(util.format('getBlockByHash catch error:', err.stack ? err.stack : err));
        throw err.stack ? err.stack : err;
    });
};
var getChainInfo = function (peer, username, org) {
    var target = buildTarget(peer, org);
    var channel = helper.getChannelForOrg(org);

    return channel.queryInfo(target).then((blockchainInfo) => {
        if (blockchainInfo) {
            // FIXME: Save this for testing 'getBlockByHash'  ?
            logger.debug('===========================================');
            logger.debug(blockchainInfo.currentBlockHash);
            logger.debug('===========================================');
            //logger.debug(blockchainInfo);
            return blockchainInfo;
        } else {
            logger.error('response_payloads is null');
            throw 'response_payloads is null';
        }
    }, (err) => {
        let message = util.format('getChainInfo, Failed to send query due to error:', err.stack ? err.stack : err);
        logger.error(message);
        throw  message;
    }).catch((err) => {
        logger.error(util.format('getChainInfo catch error:', err.stack ? err.stack : err));
        throw err.stack ? err.stack : err;
    });
};
//getInstalledChaincodes
var getInstalledChaincodes = function (peer, type, username, org) {
    var target = buildTarget(peer, org);
    var channel = helper.getChannelForOrg(org);
    var client = helper.getClientForOrg(org);

    let prom;
    if (type === 'installed') {
        prom = client.queryInstalledChaincodes(target);
    } else {
        prom = channel.queryInstantiatedChaincodes(target);
    }
    return prom.then((response) => {
        if (response) {
            if (type === 'installed') {
                logger.debug('<<< Installed Chaincodes >>>');
            } else {
                logger.debug('<<< Instantiated Chaincodes >>>');
            }
            var details = [];
            for (let i = 0; i < response.chaincodes.length; i++) {
                logger.debug('name: ' + response.chaincodes[i].name + ', version: ' +
                    response.chaincodes[i].version + ', path: ' + response.chaincodes[i].path
                );
                details.push('name: ' + response.chaincodes[i].name + ', version: ' +
                    response.chaincodes[i].version + ', path: ' + response.chaincodes[i].path
                );
            }
            return details;
        } else {
            logger.error('response is null');
            throw 'response is null';
        }
    }, (err) => {
        let message = util.format('getInstalledChaincodes, Failed to send query due to error:', err.stack ? err.stack : err);
        logger.error(message);
        throw  message;
    }).catch((err) => {
        logger.error(util.format('getInstalledChaincodes catch error:', err.stack ? err.stack : err));
        throw err.stack ? err.stack : err;
    });
};
var getChannels = function (peer, username, org) {
    var target = buildTarget(peer, org);
    var channel = helper.getChannelForOrg(org);
    var client = helper.getClientForOrg(org);

    return client.queryChannels(target).then((response) => {
        if (response) {
            logger.debug('<<< channels >>>');
            var channelNames = [];
            for (let i = 0; i < response.channels.length; i++) {
                channelNames.push('channel id: ' + response.channels[i].channel_id);
            }
            logger.debug(channelNames);
            return response;
        } else {
            logger.error('response_payloads is null');
            throw 'response_payloads is null';
        }
    }, (err) => {
        let message = util.format('getChannels, Failed to send query due to error:', err.stack ? err.stack : err);
        logger.error(message);
        throw  message;
    }).catch((err) => {
        logger.error(util.format('getChannels catch error:', err.stack ? err.stack : err));
        throw err.stack ? err.stack : err;
    });
};

function buildTarget(peer, org) {
    var target = null;
    if (typeof peer !== 'undefined') {
        let targets = helper.newPeers([peer], org);
        if (targets && targets.length > 0) target = targets[0];
    }

    return target;
}

exports.queryChaincode = queryChaincode;
exports.queryChaincodePersist = queryChaincodePersist;
exports.getBlockByNumber = getBlockByNumber;
exports.getTransactionByID = getTransactionByID;
exports.getBlockByHash = getBlockByHash;
exports.getChainInfo = getChainInfo;
exports.getInstalledChaincodes = getInstalledChaincodes;
exports.getChannels = getChannels;
exports.getBlockWithHashByNumber = getBlockWithHashByNumber;
