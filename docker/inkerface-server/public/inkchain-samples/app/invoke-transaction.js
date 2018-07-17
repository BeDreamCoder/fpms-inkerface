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
var logger = helper.getLogger('invoke-chaincode');

var invokeChaincode = function (peerNames, channelName, chaincodeName, fcn, args, username, org, senderSpec, signature) {
    logger.debug(util.format('\n============ invoke transaction on organization %s ============\n', org));

    let client = helper.getClientForOrg(org);
    let channel = helper.getChannelForOrg(org);
    let targets = (peerNames) ? helper.newPeers(peerNames, org) : undefined;
    var eventhubs;
    let tx_id = null;
    if (arguments.length < 8) {
        senderSpec = null;
        signature = null;
    }
    return helper.getRegisteredUsers(username, org).then((user) => {
        tx_id = client.newTransactionID();
        logger.debug(util.format('Sending transaction "%j"', tx_id));
        // send proposal to endorser
        let request = {
            chaincodeId: chaincodeName,
            fcn: fcn,
            args: args,
            chainId: channelName,
            txId: tx_id,
            senderSpec: senderSpec,
            sig: signature
        };
        if (targets) request.targets = targets;

        return channel.sendTransactionProposal(request);
    }, (err) => {
        let message = util.format('Failed to enroll user \'%s\',', username, err.stack ? err.stack : err);
        logger.error(message);
        throw  message;
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
                logger.info('transaction proposal was good');
            } else {
                badTx = i;
                logger.error('transaction proposal was bad');
            }
            all_good = all_good & one_good;
        }
        if (all_good) {
            logger.debug(util.format(
                'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s", endorsement signature: %s',
                proposalResponses[0].response.status, proposalResponses[0].response.message,
                proposalResponses[0].response.payload, proposalResponses[0].endorsement
                    .signature));
            var tx_request = {
                proposalResponses: proposalResponses,
                proposal: proposal
            };
            // set the transaction listener and set a timeout of 30sec
            // if the transaction did not get committed within the timeout period,
            // fail the test
            var transactionID = tx_id.getTransactionID();
            var eventPromises = [];

            if (!peerNames) {
                peerNames = channel.getPeers().map(function (peer) {
                    return peer.getName();
                });
            }

            eventhubs = helper.newEventHubs(peerNames, org);
            for (let key in eventhubs) {
                let eh = eventhubs[key];
                eh.connect();

                let txPromise = new Promise((resolve, reject) => {
                    let handle = setTimeout(() => {
                        eh.disconnect();
                        reject();
                    }, 30000);

                    eh.registerTxEvent(transactionID, (tx, code) => {
                        clearTimeout(handle);
                        eh.unregisterTxEvent(transactionID);
                        eh.disconnect();
                        if (code !== 'VALID') {
                            logger.error('The transaction was invalid, code = ' + code);
                            reject('The transaction was invalid, code = ' + code);
                        } else {
                            logger.info('The transaction has been committed on peer ' + eh._ep._endpoint.addr);
                            resolve();
                        }
                    });
                });
                eventPromises.push(txPromise);
            }
            var sendPromise = channel.sendTransaction(tx_request);
            return Promise.all([sendPromise].concat(eventPromises)).then((results) => {
                logger.debug(' event promise all complete and testing complete');
                for (let i in targets) {
                    targets[i] = null;
                }
                for (let i in eventhubs) {
                    eventhubs[i] = null;
                }
                // the first returned value is from the 'sendPromise' which is from the 'sendTransaction()' call
                if (results[0].status === 'SUCCESS') {
                    logger.info('Successfully sent transaction to the orderer.');
                    return tx_id.getTransactionID();
                } else {
                    let message = util.format('Failed to order the transaction. Error code:', results[0].status);
                    logger.error(message);
                    throw message;
                }
            }, (err) => {
                let message = util.format('Failed to send transaction to orderer due to error:', err.stack ? err.stack : err);
                logger.error(message);
                throw message;
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
                let message = 'Failed to send transaction Proposal but receive response. Response null or status is not 200.';
                logger.error(message);
                throw message;
            }
        }
    }, (err) => {
        let message = util.format('Failed to send proposal due to error:', err.stack ? err.stack : err);
        logger.error(message);
        throw message;
    }).catch((err) => {
        throw err.stack ? err.stack : err;
    });
};

var invokeChaincodeAdmin = function (peerNames, channelName, chaincodeName, fcn, args, username, org, senderSpec, signature) {
    logger.debug(util.format('\n============ invoke transaction on organization %s ============\n', org));

    let client = helper.getClientForOrg(org);
    let channel = helper.getChannelForOrg(org);
    let targets = (peerNames) ? helper.newPeers(peerNames, org) : undefined;
    var eventhubs;
    let tx_id = null;
    if (arguments.length < 8) {
        senderSpec = null;
        signature = null;
    }
    return helper.getOrgAdmin(org).then((user) => {
        tx_id = client.newTransactionID();
        logger.debug(util.format('Sending transaction "%j"', tx_id));
        // send proposal to endorser
        let request = {
            chaincodeId: chaincodeName,
            fcn: fcn,
            args: args,
            chainId: channelName,
            txId: tx_id,
            senderSpec: senderSpec,
            sig: signature
        };
        if (targets) request.targets = targets;

        return channel.sendTransactionProposal(request);
    }, (err) => {
        let message = util.format('Failed to enroll user \'%s\',', username, err.stack ? err.stack : err);
        logger.error(message);
        throw  message;
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
                logger.info('transaction proposal was good');
            } else {
                badTx = i;
                logger.error('transaction proposal was bad');
            }
            all_good = all_good & one_good;
        }
        if (all_good) {
            logger.debug(util.format(
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
            var transactionID = tx_id.getTransactionID();
            var eventPromises = [];

            if (!peerNames) {
                peerNames = channel.getPeers().map(function (peer) {
                    return peer.getName();
                });
            }

            eventhubs = helper.newEventHubs(peerNames, org);
            for (let key in eventhubs) {
                let eh = eventhubs[key];
                eh.connect();

                let txPromise = new Promise((resolve, reject) => {
                    let handle = setTimeout(() => {
                        eh.disconnect();
                        reject();
                    }, 30000);

                    eh.registerTxEvent(transactionID, (tx, code) => {
                        clearTimeout(handle);
                        eh.unregisterTxEvent(transactionID);
                        eh.disconnect();
                        if (code !== 'VALID') {
                            logger.error('The transaction was invalid, code = ' + code);
                            reject('The transaction was invalid, code = ' + code);
                        } else {
                            logger.info('The transaction has been committed on peer ' + eh._ep._endpoint.addr);
                            resolve();
                        }
                    });
                });
                eventPromises.push(txPromise);
            }
            // sent transaction to the orderer
            var sendPromise = channel.sendTransaction(request);
            return Promise.all([sendPromise].concat(eventPromises)).then((results) => {
                for (let i in targets) {
                    targets[i] = null;
                }
                for (let i in eventhubs) {
                    eventhubs[i] = null;
                }
                // the first returned value is from the 'sendPromise' which is from the 'sendTransaction()' call
                if (results[0].status === 'SUCCESS') {
                    logger.info(util.format('Successfully handle \'%s\' transaction', fcn));
                    return tx_id.getTransactionID();
                } else {
                    let message = util.format('Failed to order the transaction. Error code:', results[0].status);
                    logger.error(message);
                    throw  message;
                }
            }, (err) => {
                let message = util.format('Failed to send transaction to orderer due to error:', err.stack ? err.stack : err);
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
                let message = 'Failed to send transaction Proposal but receive response. Response null or status is not 200.';
                logger.error(message);
                throw message;
            }
        }
    }, (err) => {
        let message = util.format('Failed to send transaction proposal due to error:', err.stack ? err.stack : err);
        logger.error(message);
        throw message;
    }).catch((err) => {
        throw  err.stack ? err.stack : err;
    });
};

var invokeChaincodePersist = function (peerNames, channelName, chaincodeName, fcn, args, username, org, senderSpec, signature) {
    let client = helper.getClientForOrg(org);
    let channel = helper.getChannelForOrg(org);
    let targets = (peerNames) ? helper.newPeers(peerNames, org) : undefined;
    let eventhubs;
    let tx_id = null;
    let tx_id_str = null;
    let payload = null;
    if (arguments.length < 8) {
        senderSpec = null;
        signature = null;
    }
    tx_id = client.newTransactionID();
    tx_id_str = tx_id.getTransactionID();
    logger.debug(util.format('Sending transaction "%j"', tx_id));
    // send proposal to endorser
    let request = {
        chaincodeId: chaincodeName,
        fcn: fcn,
        args: args,
        chainId: channelName,
        txId: tx_id,
        senderSpec: senderSpec,
        sig: signature
    };
    if (targets) request.targets = targets;

    return channel.sendTransactionProposal(request).then((results) => {
        request = null;
        tx_id = null;
        var proposalResponses = results[0];
        var proposal = results[1];
        var all_good = true;
        var badTx;
        for (var i in proposalResponses) {
            let one_good = false;
            if (proposalResponses && proposalResponses[i].response &&
                proposalResponses[i].response.status === 200) {
                one_good = true;
                logger.info('transaction proposal was good');
            } else {
                badTx = i;
                logger.error('transaction proposal was bad');
            }
            all_good = all_good & one_good;
        }
        if (all_good) {
            logger.debug(util.format(
                'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s", endorsement signature: %s',
                proposalResponses[0].response.status, proposalResponses[0].response.message,
                proposalResponses[0].response.payload, proposalResponses[0].endorsement
                    .signature));
                payload =  proposalResponses[0].response.payload;
		var tx_request = {
                proposalResponses: proposalResponses,
                proposal: proposal
            };
            // set the transaction listener and set a timeout of 30sec
            // if the transaction did not get committed within the timeout period,
            // fail the test
            var eventPromises = [];

            if (!peerNames) {
                peerNames = channel.getPeers().map(function (peer) {
                    return peer.getName();
                });
            }

            eventhubs = helper.newEventHubs(peerNames, org);
            for (let key in eventhubs) {
                let eh = eventhubs[key];
                let txPromise = new Promise((resolve, reject) => {
                    let handle = setTimeout(() => {
                        // eh.disconnect();
                        reject();
                    }, 15000);

                    eh.registerTxEvent(tx_id_str, (tx, code) => {
                        clearTimeout(handle);
                        eh.unregisterTxEvent(tx_id_str);
                        if (code !== 'VALID') {
                            logger.error('The transaction was invalid, code = ' + code);
                            reject('The transaction was invalid, code = ' + code);
                        } else {
                            logger.info('The transaction has been committed on peer ' + eh._ep._endpoint.addr);
                            resolve();
                        }
                    }, (err) => {
                        clearTimeout(handle);
                        eh.unregisterTxEvent(tx_id_str);
                        logger.error(err);
                        reject(err);
                    });
                    eh.connect();
                });
                eventPromises.push(txPromise);
            }

            var sendPromise = channel.sendTransaction(tx_request);
            return Promise.all([sendPromise].concat(eventPromises)).then((results) => {
                for (let i in targets) {
                    targets[i] = null;
                }
                for (let i in eventhubs) {
                    eventhubs[i] = null;
                }
                // the first returned value is from the 'sendPromise' which is from the 'sendTransaction()' call
                let response = results[0];
                if (response.status === 'SUCCESS') {
                    logger.info(util.format('Successfully handler \'%s\' transaction', payload));
                    return JSON.parse(payload);
                } else {
                    let message = util.format('Failed to order the transaction, Error code:', response.status);
                    logger.error(message);
                    throw message;
                }
            }, (err) => {
                let message = util.format('Failed to send transaction to orderer due to error:', err.stack ? err.stack : err);
                logger.error(message);
                throw message;
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
                let message = 'Failed to send transaction Proposal but receive response. Response null or status is not 200.';
                logger.error(message);
                throw message;
            }
        }
    }, (err) => {

        let message = util.format('Failed to send transaction proposal due to error:', err.stack ? err.stack : err);
        logger.error(message);
        throw message;
    }).catch((err) => {
        throw err.stack ? err.stack : err;
    });
};

var multiInvokeChaincode = function (peersInfo, channelName, chaincodeName, fcn, args, username, senderSpec, signature) {
    let client = helper.getClientForOrg(peersInfo[0].org);
    let channel = helper.getChannelForOrg(peersInfo[0].org);
    let targets = (peersInfo) ? helper.newMultiPeers(peersInfo) : undefined;
    var eventhubs;
    let tx_id = null;
    if (arguments.length < 8) {
        senderSpec = null;
        signature = null;
    }
    return helper.getRegisteredUsers(username, peersInfo[0].org).then((user) => {
        tx_id = client.newTransactionID();
        logger.debug(util.format('Sending transaction "%j"', tx_id));
        // send proposal to endorser
        let request = {
            chaincodeId: chaincodeName,
            fcn: fcn,
            args: args,
            chainId: channelName,
            txId: tx_id,
            senderSpec: senderSpec,
            sig: signature
        };
        if (targets) request.targets = targets;

        return channel.sendTransactionProposal(request);
    }, (err) => {
        let message = util.format('Failed to enroll user \'%s\',', username, err.stack ? err.stack : err);
        logger.error(message);
        throw  message;
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
                logger.info('transaction proposal was good');
            } else {
                badTx = i;
                logger.error('transaction proposal was bad');
            }
            all_good = all_good & one_good;
        }
        if (all_good) {
            logger.debug(util.format(
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
            var transactionID = tx_id.getTransactionID();
            var eventPromises = [];

            eventhubs = helper.newEventHubs(peersInfo[0].peers, peersInfo[0].org);

            for (let key in eventhubs) {
                let eh = eventhubs[key];
                eh.connect();

                let txPromise = new Promise((resolve, reject) => {
                    let handle = setTimeout(() => {
                        eh.disconnect();
                        reject();
                    }, 30000);

                    eh.registerTxEvent(transactionID, (tx, code) => {
                        clearTimeout(handle);
                        eh.unregisterTxEvent(transactionID);
                        eh.disconnect();
                        if (code !== 'VALID') {
                            logger.error('The transaction was invalid, code = ' + code);
                            reject('The transaction was invalid, code = ' + code);
                        } else {
                            logger.info('The transaction has been committed on peer ' + eh._ep._endpoint.addr);
                            resolve();
                        }
                    });
                });
                eventPromises.push(txPromise);
            }
            var sendPromise = channel.sendTransaction(request);
            return Promise.all([sendPromise].concat(eventPromises)).then((results) => {
                logger.debug(' event promise all complete and testing complete');
                for (let i in targets) {
                    targets[i] = null;
                }
                for (let i in eventhubs) {
                    eventhubs[i] = null;
                }
                // the first returned value is from the 'sendPromise' which is from the 'sendTransaction()' call
                if (results[0].status === 'SUCCESS') {
                    logger.info('Successfully sent transaction to the orderer.');
                    return tx_id.getTransactionID();
                } else {
                    let message = util.format('Failed to order the transaction. Error code:', results[0].status);
                    logger.error(message);
                    throw message;
                }
            }, (err) => {
                let message = util.format('Failed to send transaction to orderer due to error:', err.stack ? err.stack : err);
                logger.error(message);
                throw message;
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
                let message = 'Failed to send transaction Proposal but receive response. Response null or status is not 200.';
                logger.error(message);
                throw message;
            }
        }
    }, (err) => {
        let message = util.format('Failed to send proposal due to error:', err.stack ? err.stack : err);
        logger.error(message);
        throw message;
    }).catch((err) => {
        throw err.stack ? err.stack : err;
    });
};

var multiInvokeChaincodePersist = function (peersInfo, channelName, chaincodeName, fcn, args, username, senderSpec, signature) {
    let client = helper.getClientForOrg(peersInfo[0].org);
    let channel = helper.getChannelForOrg(peersInfo[0].org);
    let targets = (peersInfo) ? helper.newMultiPeers(peersInfo) : undefined;
    var eventhubs;
    let tx_id = null;
    if (arguments.length < 8) {
        senderSpec = null;
        signature = null;
    }
    tx_id = client.newTransactionID();
    logger.debug(util.format('Sending transaction "%j"', tx_id));
    // send proposal to endorser
    let request = {
        chaincodeId: chaincodeName,
        fcn: fcn,
        args: args,
        chainId: channelName,
        txId: tx_id,
        senderSpec: senderSpec,
        sig: signature
    };
    if (targets) request.targets = targets;

    return channel.sendTransactionProposal(request).then((results) => {
        var proposalResponses = results[0];
        var proposal = results[1];
        var all_good = true;
        var badTx;
        for (var i in proposalResponses) {
            let one_good = false;
            if (proposalResponses && proposalResponses[i].response &&
                proposalResponses[i].response.status === 200) {
                one_good = true;
                logger.info('transaction proposal was good');
            } else {
                badTx = i;
                logger.error('transaction proposal was bad');
            }
            all_good = all_good & one_good;
        }
        if (all_good) {
            logger.debug(util.format(
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
            var transactionID = tx_id.getTransactionID();
            var eventPromises = [];

            eventhubs = helper.newEventHubs(peersInfo[0].peers, peersInfo[0].org);

            for (let key in eventhubs) {
                let eh = eventhubs[key];
                eh.connect();

                let txPromise = new Promise((resolve, reject) => {
                    let handle = setTimeout(() => {
                        eh.disconnect();
                        reject();
                    }, 30000);

                    eh.registerTxEvent(transactionID, (tx, code) => {
                        clearTimeout(handle);
                        eh.unregisterTxEvent(transactionID);
                        eh.disconnect();
                        if (code !== 'VALID') {
                            logger.error('The transaction was invalid, code = ' + code);
                            reject('The transaction was invalid, code = ' + code);
                        } else {
                            logger.info('The transaction has been committed on peer ' + eh._ep._endpoint.addr);
                            resolve();
                        }
                    });
                });
                eventPromises.push(txPromise);
            }
            var sendPromise = channel.sendTransaction(request);
            return Promise.all([sendPromise].concat(eventPromises)).then((results) => {
                for (let i in targets) {
                    targets[i] = null;
                }
                for (let i in eventhubs) {
                    eventhubs[i] = null;
                }
                // the first returned value is from the 'sendPromise' which is from the 'sendTransaction()' call
                let response = results[0];
                if (response.status === 'SUCCESS') {
                    logger.info(util.format('Successfully handler \'%s\' transaction', fcn));
                    return tx_id.getTransactionID();
                } else {
                    let message = util.format('Failed to order the transaction, Error code:', response.status);
                    logger.error(message);
                    throw message;
                }
            }, (err) => {
                let message = util.format('Failed to send transaction to orderer due to error:', err.stack ? err.stack : err);
                logger.error(message);
                throw message;
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
                let message = 'Failed to send transaction Proposal but receive response. Response null or status is not 200.';
                logger.error(message);
                throw message;
            }
        }
    }, (err) => {
        let message = util.format('Failed to send transaction proposal due to error:', err.stack ? err.stack : err);
        logger.error(message);
        throw message;
    }).catch((err) => {
        throw err.stack ? err.stack : err;
    });
};

// Used for internal testing
exports.invokeChaincode = invokeChaincode;
// Used for restful api testing and admin or user identity
exports.invokeChaincodeAdmin = invokeChaincodeAdmin;
exports.invokeChaincodePersist = invokeChaincodePersist;
exports.multiInvokeChaincode = multiInvokeChaincode;
exports.multiInvokeChaincodePersist = multiInvokeChaincodePersist;
