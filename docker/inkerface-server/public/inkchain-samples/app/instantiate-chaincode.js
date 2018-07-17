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

var path = require('path');
var fs = require('fs');
var util = require('util');
var hfc = require('inkchain-client');
var helper = require('./helper.js');
var logger = helper.getLogger('instantiate-chaincode');
var ORGS = hfc.getConfigSetting('network-config');
var tx_id = null;
var eh = null;

var instantiateChaincode = function (channelName, chaincodeName, chaincodeVersion, functionName, username, args, org) {
    logger.debug('\n============ Instantiate chaincode on organization ' + org + ' ============\n');

    var channel = helper.getChannelForOrg(org);
    var client = helper.getClientForOrg(org);

    return helper.getOrgAdmin(org).then((admin) => {
        // read the config block from the orderer for the channel
        // and initialize the verify MSPs based on the participating
        // organizations
        return channel.initialize();
    }, (err) => {
        let message = util.format('Failed to enroll user \'%s\',', username, err.stack ? err.stack : err);
        logger.error(message);
        throw  message;
    }).then((result) => {
        tx_id = client.newTransactionID();
        // send proposal to endorser
        var request = {
            chaincodeId: chaincodeName,
            chaincodeVersion: chaincodeVersion,
            args: args,
            txId: tx_id
        };

        if (functionName) request.fcn = functionName;
        return channel.sendInstantiateProposal(request);
    }, (err) => {
        let message = util.format('Failed to initialize the channel,', err.stack ? err.stack : err);
        logger.error(message);
        throw message;
    }).then((results) => {
        var proposalResponses = results[0];
        var proposal = results[1];
        var all_good = true;
        var badTx;
        for (var i in proposalResponses) {
            let one_good = false;
            if (proposalResponses && proposalResponses[i].response &&
                proposalResponses[i].response.status === 200) {
                one_good = true;
                logger.info('instantiate proposal was good');
            } else {
                badTx = i;
                logger.error('instantiate proposal was bad');
            }
            all_good = all_good & one_good;
        }

        if (all_good) {
            logger.info(util.format(
                'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s", endorsement signature: %s',
                proposalResponses[0].response.status, proposalResponses[0].response.message,
                proposalResponses[0].response.payload, proposalResponses[0].endorsement
                    .signature));
            var request = {
                proposalResponses: proposalResponses,
                proposal: proposal
            };
            // set the transaction listener and set a timeout of 30sec
            // if the transaction did not get committed within the timeout period,
            // fail the test
            var deployId = tx_id.getTransactionID();

            eh = client.newEventHub();
            let data = fs.readFileSync(path.join(__dirname, ORGS[org].peers['peer1'][
                'tls_cacerts'
                ]));
            eh.setPeerAddr(ORGS[org].peers['peer1']['events'], {
                pem: Buffer.from(data).toString(),
                'ssl-target-name-override': ORGS[org].peers['peer1']['server-hostname']
            });
            eh.connect();

            let txPromise = new Promise((resolve, reject) => {
                let handle = setTimeout(() => {
                    eh.disconnect();
                    reject();
                }, 30000);

                eh.registerTxEvent(deployId, (tx, code) => {
                    logger.info(
                        'The chaincode instantiate transaction has been committed on peer ' +
                        eh._ep._endpoint.addr);
                    clearTimeout(handle);
                    eh.unregisterTxEvent(deployId);
                    eh.disconnect();

                    if (code !== 'VALID') {
                        logger.error('The chaincode instantiate transaction was invalid, code = ' + code);
                        reject();
                    } else {
                        logger.info('The chaincode instantiate transaction was valid.');
                        resolve();
                    }
                });
            });

            var sendPromise = channel.sendTransaction(request);
            return Promise.all([sendPromise].concat([txPromise])).then((results) => {
                // the first returned value is from the 'sendPromise' which is from the 'sendTransaction()' call
                if (results[0] && results[0].status === 'SUCCESS') {
                    let message = 'Chaincode Instantiation is SUCCESS';
                    //logger.info('Successfully sent transaction to the orderer.');
                    logger.info(message);
                    return message;
                } else {
                    let message = util.format('Failed to order the transaction. Error code:', results[0].status);
                    logger.error(message);
                    throw message;
                }
            }, (err) => {
                let message = util.format('Failed to send instantiate transaction and get notifications:', err.stack ? err.stack : err);
                logger.error(message);
                throw  message;
            });
        } else {
            let errMsg;
            if (badTx && proposalResponses[badTx].details) {
                errMsg = proposalResponses[badTx].details;
            }
            if (errMsg) {
                logger.error(errMsg);
                throw errMsg;
            } else {
                let message = 'Failed to send instantiate Proposal but receive valid response. Response null or status is not 200.';
                logger.error(message);
                throw message;
            }
        }
    }, (err) => {
        let message = util.format('Failed to send instantiate proposal due to error:', err.stack ? err.stack : err);
        logger.error(message);
        throw message;
    }).catch((err) => {
        throw err.stack ? err.stack : err;
    });
};
exports.instantiateChaincode = instantiateChaincode;
