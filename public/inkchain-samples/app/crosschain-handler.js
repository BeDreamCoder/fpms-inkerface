/**
 * Created by zhangtailin on 2018/6/19.
 */
const fs = require('fs');
const path = require('path');
const Client = require('inkchain-client');
require('./config');
const config = require('../../../config/config.json');
const ccHelper = require('./invoke-server');
const queryHandle = require('./query');
const ccSignedHelper = require('./invoke-signed-shot');
const helper = require('./helper');
var logger = helper.getLogger('cross-chain');
var util = require('util');
const request = require('request');
var JSONbig = require('json-bigint');

var crossPayAccount = fs.readFileSync(path.join(__dirname, '../../../config/pay.txt'), 'utf8');

function errorParams(field) {
    return {
        success: false,
        error: field + ' params is invalid or missing in the request'
    };
}

// cross chain platform register
var platformRegister = (req, res) => {
    const sender = req.body.sender;
    if (!sender) {
        res.status(500).json(errorParams('\'sender\''));
        return;
    }
    const platform_name = req.body.platform_name;
    if (!platform_name) {
        res.status(500).json(errorParams('\'platform_name\''));
        return;
    }
    const fee_limit = req.body.fee_limit;
    if (!fee_limit) {
        res.status(500).json(errorParams('\'fee_limit\''));
        return;
    }
    let message = req.body.message;
    if (!message) message = '';

    const counter = req.body.counter;
    if (typeof counter === 'undefined') {
        res.status(500).json(errorParams('\'counter\''));
        return;
    }
    const sig = Buffer.from(req.body.sig, 'hex');
    if (!sig) {
        res.status(500).json(errorParams('\'sig\''));
        return;
    }
    ccHelper.multiInvoke(config.crossPeers, config.channelName, 'xscc', 'registerPlatform',
        [platform_name], config.userName, sender, message, fee_limit, counter, sig)
        .then((result) => {
            res.status(200).json({"success": true, "data": result});
        }, (err) => {
            res.status(500).json({"success": false, "error": err});
        }).catch((err) => {
        res.status(500).json({"success": false, "error": err});
    });
};
// cross to alliance chain from public chain
var crossTransfer = (req, res) => {
    const sender = req.body.sender;
    if (!sender) {
        res.status(500).json(errorParams('\'sender\''));
        return;
    }
    const public_chain_name = req.body.public_chain_name;
    if (!public_chain_name) {
        res.status(500).json(errorParams('\'public_chain_name\''));
        return;
    }
    const public_address = req.body.public_address;
    if (!public_address) {
        res.status(500).json(errorParams('\'public_address\''));
        return;
    }
    const amount = req.body.amount;
    if (!amount) {
        res.status(500).json(errorParams('\'amount\''));
        return;
    }
    let message = req.body.message;
    if (!message) message = '';

    const fee_limit = req.body.fee_limit;
    if (!fee_limit) {
        res.status(500).json(errorParams('\'fee_limit\''));
        return;
    }
    const counter = req.body.counter;
    if (typeof counter === 'undefined') {
        res.status(500).json(errorParams('\'counter\''));
        return;
    }
    const sig = Buffer.from(req.body.sig, 'hex');
    if (!sig) {
        res.status(500).json(errorParams('\'sig\''));
        return;
    }
    ccHelper.multiInvoke(config.crossPeers, config.channelName, 'xscc', 'lock',
        [public_chain_name, public_address, amount, config.crossToken], config.userName, sender, message, fee_limit, counter, sig)
        .then((result) => {
            let data = {tx_id: result, amount: amount};
            ccHelper.query(config.peerName, config.channelName, 'token', 'getAccount', [sender])
                .then((account) => {
                    data.balance = JSON.parse(account[0].toString());
                    ccHelper.query(config.peerName, config.channelName, 'qscc', 'GetTransactionByID', [config.channelName, result])
                        .then((tx) => {
                            data.date = Client.decodeTransaction(tx[0]).transactionEnvelope.payload.header.channel_header.timestamp;

                            res.status(200).json({"success": true, "data": data});
                        }, (err) => {
                            logger.error("cross-transfer, GetTransactionByID failed,", err);
                            res.status(200).json({"success": true, "data": data});
                        }).catch((err) => {
                        logger.error("cross-transfer, GetTransactionByID failed,", err);
                        res.status(200).json({"success": true, "data": data});
                    });
                }, (err) => {
                    logger.error("cross-transfer, getAccount failed,", err);
                    res.status(200).json({"success": true, "data": data});
                }).catch((err) => {
                logger.error("cross-transfer, getAccount failed,", err);
                res.status(200).json({"success": true, "data": data});
            });
        }, (err) => {
            res.status(500).json({"success": false, "error": err});
        }).catch((err) => {
        res.status(500).json({"success": false, "error": err});
    });
};
// query cross sign
var crossSign = (req, res) => {
    const cross_txid = req.params.cross_txid;
    if (!cross_txid) {
        res.status(500).json(errorParams('\'cross_txid\''));
        return;
    }

    let queryHub = [];
    for (let key in config.crossPeers) {
        let promise = queryHandle.queryChaincode(config.crossPeers[key].peers[0], config.channelName, 'xscc',
            [cross_txid], 'querySignature', config.userName, config.crossPeers[key].org);
        queryHub.push(promise);
    }
    Promise.all(queryHub).then((results) => {
        let signArr = [];
        for (let i in results) {
            signArr.push(JSON.parse(results[i][0].toString()).sign);
        }

        let content = JSONbig.parse(results[0][0].toString());
        let data = {
            txid: cross_txid,
            balanceType: content.state.balanceType,
            value: content.state.value,
            toPlatform: content.state.toPlatform,
            fromAccount: content.state.fromAccount,
            toAccount: content.state.toAccount,
            signs: signArr
        };

        var file_name = util.format('sign-%s.json', cross_txid);
        res.setHeader('Content-Type', 'application/json');
        res.attachment(file_name);
        res.end(JSON.stringify(data, null, 4), 'binary');
    }, (err) => {
        res.status(500).json({"success": false, "error": err});
    }).catch((err) => {
        res.status(500).json({"success": false, "error": err});
    });
};
// query public chain tx info
var queryPublicTx = (req, res) => {
    const tx = req.params.tx;
    if (!tx) {
        res.status(500).json(errorParams('\'tx\''));
        return;
    }

    ccHelper.query(config.peerName, config.channelName, 'xscc', 'queryTxInfo', [tx])
        .then((result) => {
            res.status(200).json({"success": true, "data": result});
        }, (err) => {
            res.status(500).json({"success": false, "error": err});
        }).catch((err) => {
        res.status(500).json({"success": false, "error": err});
    });
};

// cross to alliance chain from public chain
var unlock = (req, res) => {
    const public_chain_name = req.body.public_chain_name;
    if (!public_chain_name) {
        res.status(500).json(errorParams('\'public_chain_name\''));
        return;
    }
    const public_address = req.body.public_address;
    if (!public_address) {
        res.status(500).json(errorParams('\'public_address\''));
        return;
    }
    const amount = req.body.amount;
    if (!amount) {
        res.status(500).json(errorParams('\'amount\''));
        return;
    }
    const consortium_address = req.body.consortium_address;
    if (!consortium_address) {
        res.status(500).json(errorParams('\'consortium_address\''));
        return;
    }
    const public_txid = req.body.public_txid;
    if (!public_txid) {
        res.status(500).json(errorParams('\'public_txid\''));
        return;
    }
    let message = req.body.message;
    if (!message) message = '';
    const fee_limit = req.body.fee_limit;
    if (!fee_limit) {
        res.status(500).json(errorParams('\'fee_limit\''));
        return;
    }

    ccSignedHelper.multiIvokeChaincodeSigned(config.crossPeers, config.channelName, 'xscc', 'unlock',
        [public_chain_name, public_address, amount, consortium_address, public_txid, config.crossToken],
        config.userName, fee_limit, message, crossPayAccount)
        .then((result) => {
            let data = {tx_id: result, amount: amount};
            ccHelper.query(config.peerName, config.channelName, 'token', 'getAccount', [consortium_address])
                .then((account) => {
                    data.balance = JSON.parse(account[0].toString());
                    ccHelper.query(config.peerName, config.channelName, 'qscc', 'GetTransactionByID', [config.channelName, result])
                        .then((tx) => {
                            data.date = Client.decodeTransaction(tx[0]).transactionEnvelope.payload.header.channel_header.timestamp;

                            res.status(200).json({"success": true, "data": data});
                        }, (err) => {
                            logger.error("unlock, GetTransactionByID failed,", err);
                            res.status(200).json({"success": true, "data": data});
                        }).catch((err) => {
                        logger.error("unlock, GetTransactionByID failed,", err);
                        res.status(200).json({"success": true, "data": data});
                    });
                }, (err) => {
                    logger.error("unlock, getAccount failed,", err);
                    res.status(200).json({"success": true, "data": data});
                }).catch((err) => {
                logger.error("unlock, getAccount failed,", err);
                res.status(200).json({"success": true, "data": data});
            });
        }, (err) => {
            res.status(500).json({"success": false, "error": err});
        }).catch((err) => {
        res.status(500).json({"success": false, "error": err});
    });
};

var downloadOperatotr = function (req, res) {
    var file = req.query.file;
    if (!file) {
        res.status(500).json(errorParams('\'file\''));
        return;
    }
    var path = 'document/' + file;
    var ext = file.substr(file.lastIndexOf('.') + 1);
    fs.readFile(path, function (error, content) {
        if (error) return res.end("file not found");
        var contentType;
        switch (ext) {
            case "pdf":
                contentType = 'application/pdf';
                break;
            case "ppt":
                contentType = 'application/vnd.ms-powerpoint';
                break;
            case "pptx":
                contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
                break;
            case "xls":
                contentType = 'application/vnd.ms-excel';
                break;
            case "xlsx":
                contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                break;
            case "doc":
                contentType = 'application/msword';
                break;
            case "docx":
                contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                break;
            case "csv":
                contentType = 'application/octet-stream';
                break;
            default:
                res.download(path);
        }

        res.setHeader('Content-Type', contentType);
        res.attachment(file);
        res.end(content, 'binary');
    });
};

var platformBalance = (req, res) => {
    let reqHub = [];
    let qtumPromise = qtumBalance();
    let ethPromise = ethereumBalance();
    reqHub.push(qtumPromise);
    reqHub.push(ethPromise);
    Promise.all(reqHub).then((results) => {
        res.status(200).json({"success": true, total: config.tokenTotalSupply, qtum: results[0], eth: results[1]});
    }, (err) => {
        res.status(500).json({"success": false, "error": err});
    }).catch((err) => {
        res.status(500).json({"success": false, "error": err});
    });
};

function qtumBalance() {
    return new Promise((resolve, reject) => {
        request({
            url: config.qtumUrl,
            method: "GET",
            json: true,
            headers: {
                "content-type": "application/json",
            },
        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var balance = parseInt(body.executionResult.output, 16);
                resolve(balance);
            } else {
                reject("query qtum balance error. " + error);
            }
        });
    });
}

function ethereumBalance() {
    return new Promise((resolve, reject) => {
        request({
            url: config.ethUrl,
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
            },
            body: {
                jsonrpc: '2.0',
                method: 'eth_call',
                params: [{
                    to: config.eth_xc_contract_address,
                    data: '0xe228ecb4'
                }, 'latest'],
                id: 1
            }
        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var balance = parseInt(body.result, 16);
                resolve(balance);
            } else {
                reject("query ethereum balance error. " + error);
            }
        });
    });
}

var hexAddressFromQtum = (req, res) => {
    const address = req.params.qtum_address;
    if (!address) {
        res.status(500).json(errorParams('\'address\''));
        return;
    }
    request({
        url: config.qtum_address_transfer,
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json",
        },
        body: {
            address: address,
            accessToken: "ACCESS_TOKEN_IAM_QTUM"
        }
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            if (body.success) {
                res.status(200).json({"success": true, data: body.data});
            } else {
                res.status(500).json({"success": false, data: body.message});
            }
        } else {
            res.status(500).json({"success": false, data: error});
        }
    });
};

exports.platformRegister = platformRegister;
exports.crossTransfer = crossTransfer;
exports.crossSign = crossSign;
exports.queryPublicTx = queryPublicTx;
exports.unlock = unlock;
exports.downloadOperatotr = downloadOperatotr;
exports.platformBalance = platformBalance;
exports.hexAddressFromQtum = hexAddressFromQtum;
