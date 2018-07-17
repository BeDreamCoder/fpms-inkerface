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
var logger = helper.getLogger('install-chaincode');

var installChaincode = function (peers, chaincodeName, chaincodePath, chaincodeVersion, username, org) {
    logger.debug('\n============ Install chaincode on organizations ============\n');

    helper.setupChaincodeDeploy();
    var client = helper.getClientForOrg(org);

    return helper.getOrgAdmin(org).then((admin) => {
        var request = {
            targets: helper.newPeers(peers, org),
            chaincodePath: chaincodePath,
            chaincodeId: chaincodeName,
            chaincodeVersion: chaincodeVersion
        };
        return client.installChaincode(request);
    }, (err) => {
        let message = util.format('Failed to enroll user \'%s\',', username, err.stack ? err.stack : err);
        logger.error(message);
        throw  message;
    }).then((results) => {
        var proposalResponses = results[0];
        var all_good = true;
        var badTx;
        for (var i in proposalResponses) {
            let one_good = false;
            if (proposalResponses && proposalResponses[i].response &&
                proposalResponses[i].response.status === 200) {
                one_good = true;
                logger.info('install proposal was good');
            } else {
                badTx = i;
                logger.error('install proposal was bad');
            }
            all_good = all_good & one_good;
        }
        if (all_good) {
            logger.info(util.format(
                'Successfully sent install Proposal and received ProposalResponse: Status - %s',
                proposalResponses[0].response.status));
            logger.debug('\nSuccessfully Installed chaincode on organization ' + org +
                '\n');
            return util.format('Successfully Installed chaincode on organization \'%s\'', org);
        } else {
            let errMsg;
            if (badTx && proposalResponses[badTx].details) {
                errMsg = proposalResponses[badTx].details;
            }
            if (errMsg) {
                logger.error(errMsg);
                throw errMsg;
            } else {
                let message = 'Failed to send install Proposal or receive valid response. Response null or status is not 200.';
                logger.error(message);
                throw message;
            }
        }
    }, (err) => {
        let message = util.format('Failed to send install proposal,', err.stack ? err.stack : err);
        logger.error(message);
        throw message;
    }).catch((err) => {
        throw err.stack ? err.stack : err;
    });
};
exports.installChaincode = installChaincode;
