/**
 * Copyright 2017 IBM All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an 'AS IS' BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
'use strict';

var util = require('util');
var config = require('../../../config/config.json');
var helper = require('./helper.js');
var logger = helper.getLogger('Join-Channel');
//
//Attempt to send a request to the orderer with the sendCreateChain method
//
var joinChannel = function (channelName, peers, username, org) {
    var allEventhubs = [];
    var block_registration_numbers = [];
    // on process exit, always disconnect the event hub
    var closeConnections = function (isSuccess) {
        if (isSuccess) {
            logger.debug('\n============ Join Channel is SUCCESS ============\n');
        } else {
            logger.debug('\n!!!!!!!! ERROR: Join Channel FAILED !!!!!!!!\n');
        }

        for (let key in allEventhubs) {
            let eventhub = allEventhubs[key];
            let block_registration_number = block_registration_numbers[key];
            eventhub.unregisterBlockEvent(block_registration_number);
            if (eventhub && eventhub.isconnected()) {
                eventhub.disconnect();
            }
        }
    };
    logger.info(util.format('Calling peers in organization "%s" to join the channel', org));

    var client = helper.getClientForOrg(org);
    var channel = helper.getChannelForOrg(org);

    return helper.getOrgAdmin(org).then((admin) => {
        logger.info(util.format('received member object for admin of the organization "%s": ', org));
        let tx_id = client.newTransactionID();
        let request = {
            txId: tx_id
        };

        return channel.getGenesisBlock(request);
    }, (err) => {
        let message = util.format('Failed to enroll user \'%s\',', username, err.stack ? err.stack : err);
        logger.error(message);
        throw  message;
    }).then((genesis_block) => {
        allEventhubs = helper.newEventHubs(peers, org);
        for (let key in allEventhubs) {
            let eh = allEventhubs[key];
            eh.connect();
        }

        var eventPromises = [];
        allEventhubs.forEach((eh) => {
            let txPromise = new Promise((resolve, reject) => {
                let handle = setTimeout(reject, parseInt(config.eventWaitTime));
                let block_registration_number = eh.registerBlockEvent((block) => {
                    clearTimeout(handle);
                    // in real-world situations, a peer may have more than one channels so
                    // we must check that this block came from the channel we asked the peer to join
                    if (block.data.data.length === 1) {
                        // Config block must only contain one transaction
                        var channel_header = block.data.data[0].payload.header.channel_header;
                        if (channel_header.channel_id === channelName) {
                            resolve();
                        }
                        else {
                            reject();
                        }
                    }
                }, (err) => {
                    clearTimeout(handle);
                    let message = util.format('joinChannel, disconnect blockEvent due to', err.stack ? err.stack : err);
                    logger.error(message);
                    reject(message);
                });
                block_registration_numbers.push(block_registration_number);
            });

            eventPromises.push(txPromise);
        });

        let tx_id = client.newTransactionID();
        let request = {
            targets: helper.newPeers(peers, org),
            txId: tx_id,
            block: genesis_block
        };
        let sendPromise = channel.joinChannel(request);
        return Promise.all([sendPromise].concat(eventPromises));
    }, (err) => {
        let message = util.format('Failed to getGenesisBlock,', err.stack ? err.stack : err);
        logger.error(message);
        throw  message;
    }).then((results) => {
        if (results[0] && results[0][0] && results[0][0].response && results[0][0].response.status === 200) {
            let message = util.format('Successfully joined peers in organization \'%s\' to the channel \'%s\'', org, channelName);
            logger.info(message);
            closeConnections(true);
            return {
                success: true,
                message: message
            };
        } else {
            let message = util.format(' Failed to join channel, %j', results);
            logger.error(message);
            closeConnections();
            throw message;
        }
    }, (err) => {
        let message = util.format('failed to join channel');
        logger.error(message);
        closeConnections();
        throw message;
    }).catch((err) => {
        throw err.stack ? err.stack : err;
    });
};

exports.joinChannel = joinChannel;
