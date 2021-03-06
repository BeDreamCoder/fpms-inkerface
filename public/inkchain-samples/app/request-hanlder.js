/**
 * Created by wangh09 on 2018/1/15.
 */

const Client = require('inkchain-client');
require('./config');
const config = require('../../../config/config.json');
const ccHelper = require('./invoke-server');
const Wallet = require('./wallet').Wallet;
const queryHandle = require('./query');
const queryDB = require('../../db/query-db');
const helper = require('./helper');
const util = require('util');

var MaxNumPerPage = 200;

function errorParams(field) {
    return {
        success: false,
        error: field + ' params is invalid or missing in the request'
    };
}

// create account address and private key
var generateAccount = (req, res) => {
    Wallet.generate();
    res.json({"address": Wallet.getAddress(), "private_key": Wallet.getPriKey()});
};

var createChannel = (req, res) => {
    const channelName = req.body.channelName;
    const channelConfigPath = req.body.channelConfigPath;
    if (!channelName) {
        res.status(500).json(errorParams('\'channelName\''));
        return;
    }
    if (!channelConfigPath) {
        res.status(500).json(errorParams('\'channelConfigPath\''));
        return;
    }

    let createChannel = require('./create-channel');
    createChannel.createChannel(channelName, channelConfigPath, 'admin', config.orgName)
        .then((result) => {
            res.status(200).json({"success": true, "data": result.message});
        }, (err) => {
            res.status(500).json({"success": false, "error": err});
        }).catch((err) => {
        res.status(500).json({"success": false, "error": err});
    });
};

var joinChannel = (req, res) => {
    const channelName = req.body.channelName;
    const peers = req.body.peers;
    if (!channelName) {
        res.status(500).json(errorParams('\'channelName\''));
        return;
    }
    if (!peers || peers.length === 0) {
        res.status(500).json(errorParams('\'peers\''));
        return;
    }

    let joinChannel = require('./join-channel');
    joinChannel.joinChannel(channelName, peers, 'admin', config.orgName)
        .then((result) => {
            res.status(200).json({"success": true, "data": result.message});
        }, (err) => {
            res.status(500).json({"success": false, "error": err});
        }).catch((err) => {
        res.status(500).json({"success": false, "error": err});
    });
};
// Install cc on target peers
var installChaincode = (req, res) => {
    const peers = req.body.peers;
    const ccName = req.body.chaincodeName;
    const ccPath = req.body.chaincodePath;
    const ccVersion = req.body.chaincodeVersion;
    if (!peers || peers.length === 0) {
        res.status(500).json(errorParams('\'peers\''));
        return;
    }
    if (!ccName) {
        res.status(500).json(errorParams('\'ccName\''));
        return;
    }
    if (!ccPath) {
        res.status(500).json(errorParams('\'ccPath\''));
        return;
    }
    if (!ccVersion) {
        res.status(500).json(errorParams('\'ccVersion\''));
        return;
    }

    let installChaincode = require('./install-chaincode');
    installChaincode.installChaincode(peers, ccName, ccPath, ccVersion, 'admin', config.orgName)
        .then((result) => {
            res.status(200).json({"success": true, "data": result});
        }, (err) => {
            res.status(500).json({"success": false, "error": err});
        }).catch((err) => {
        res.status(500).json({"success": false, "error": err});
    });
};
// Instantiate cc on target peers
var instanChaincode = (req, res) => {
    const ccName = req.body.chaincodeName;
    const ccVersion = req.body.chaincodeVersion;
    const channelName = req.body.channelName;
    const fcn = req.body.fcn;
    const args = req.body.args;
    if (!ccName) {
        res.status(500).json(errorParams('\'ccName\''));
        return;
    }
    if (!ccVersion) {
        res.status(500).json(errorParams('\'ccVersion\''));
        return;
    }
    if (!channelName) {
        res.status(500).json(errorParams('\'channelName\''));
        return;
    }
    if (!fcn) {
        res.status(500).json(errorParams('\'fcn\''));
        return;
    }
    if (!args) {
        res.status(500).json(errorParams('\'args\''));
        return;
    }

    let instantiateChaincode = require('./instantiate-chaincode');
    instantiateChaincode.instantiateChaincode(channelName, ccName, ccVersion, fcn, args, 'admin', config.orgName)
        .then((result) => {
            res.status(200).json({"success": true, "data": result});
        }, (err) => {
            res.status(500).json({"success": false, "error": err});
        }).catch((err) => {
        res.status(500).json({"success": false, "error": err});
    });
};

var issueToken = (req, res) => {
    const coin_name = req.body.coin_name;
    const totalSupply = req.body.totalSupply;
    const decimals = req.body.decimals;
    const publish_address = req.body.publish_address;
    if (!coin_name) {
        res.status(500).json(errorParams('\'coin_name\''));
        return;
    }
    if (!totalSupply) {
        res.status(500).json(errorParams('\'totalSupply\''));
        return;
    }
    if (!decimals) {
        res.status(500).json(errorParams('\'decimals\''));
        return;
    }
    if (!publish_address) {
        res.status(500).json(errorParams('\'publish_address\''));
        return;
    }

    let invokeHandler = require('./invoke-transaction');
    invokeHandler.invokeChaincodeAdmin([config.peerName], config.channelName, 'ascc', 'registerAndIssueToken',
        [coin_name, totalSupply, decimals, publish_address], 'admin', config.orgName)
        .then((result) => {
            res.status(200).json({"success": true, "data": result});
        }, (err) => {
            res.status(500).json({"success": false, "error": err});
        }).catch((err) => {
        res.status(500).json({"success": false, "error": err});
    });
};
// transfer token between two accounts
var transfer = (req, res) => {
    const to_address = req.body.to_address;
    const from_address = req.body.from_address;
    const coin_type = req.body.coin_type;
    const amount = req.body.amount;
    let message = req.body.message;
    const counter = req.body.counter;
    const ink_limit = req.body.ink_limit;
    const sig = Buffer.from(req.body.sig, 'hex');
    if (!to_address) {
        res.status(500).json(errorParams('\'to_address\''));
        return;
    }
    if (!from_address) {
        res.status(500).json(errorParams('\'from_address\''));
        return;
    }
    if (!coin_type) {
        res.status(500).json(errorParams('\'coin_type\''));
        return;
    }
    if (!amount) {
        res.status(500).json(errorParams('\'amount\''));
        return;
    }
    if (!message) message = '';

    if (typeof counter === 'undefined') {
        res.status(500).json(errorParams('\'counter\''));
        return;
    }
    if (!ink_limit) {
        res.status(500).json(errorParams('\'ink_limit\''));
        return;
    }
    if (!sig) {
        res.status(500).json(errorParams('\'sig\''));
        return;
    }

    ccHelper.invoke([config.peerName], config.channelName, 'token', 'transfer', [to_address, coin_type, amount],
        from_address, message, ink_limit, counter, sig)
        .then((result) => {
            res.status(200).json({"success": true, "data": result});
        }, (err) => {
            res.status(500).json({"success": false, "error": err});
        }).catch((err) => {
        res.status(500).json({"success": false, "error": err});
    });
};
// invoke fcn of chaincode that already deployed on chain
var invoke = (req, res) => {
    const sender = req.body.sender;
    const cc_id = req.body.cc_id;
    const fcn = req.body.fcn;
    const args = req.body.args;
    let message = req.body.message;
    const counter = req.body.counter;
    const ink_limit = req.body.ink_limit;
    const sig = Buffer.from(req.body.sig, 'hex');
    if (!sender) {
        res.status(500).json(errorParams('\'sender\''));
        return;
    }
    if (!cc_id) {
        res.status(500).json(errorParams('\'cc_id\''));
        return;
    }
    if (!fcn) {
        res.status(500).json(errorParams('\'fcn\''));
        return;
    }
    if (!args) {
        res.status(500).json(errorParams('\'args\''));
        return;
    }
    if (!message) message = '';

    if (typeof counter === 'undefined') {
        res.status(500).json(errorParams('\'counter\''));
        return;
    }
    if (!ink_limit) {
        res.status(500).json(errorParams('\'ink_limit\''));
        return;
    }
    if (!sig) {
        res.status(500).json(errorParams('\'sig\''));
        return;
    }

    ccHelper.invoke([config.peerName], config.channelName, cc_id, fcn, args, sender, message, ink_limit, counter, sig)
        .then((result) => {
            res.status(200).json({"success": true, "data": result});
        }, (err) => {
            res.status(500).json({"success": false, "error": err});
        }).catch((err) => {
        res.status(500).json({"success": false, "error": err});
    });
};
// query data by invoke query function of chaincode
var query = (req, res) => {
    const cc_id = req.body.cc_id;
    const fcn = req.body.fcn;
    const args = req.body.args;
    if (!cc_id) {
        res.status(500).json(errorParams('\'cc_id\''));
        return;
    }
    if (!fcn) {
        res.status(500).json(errorParams('\'fcn\''));
        return;
    }
    if (!args) {
        res.status(500).json(errorParams('\'args\''));
        return;
    }

    ccHelper.query(config.peerName, config.channelName, cc_id, fcn, args)
        .then((result) => {
            res.status(200).json({"success": true, "data": JSON.parse(result[0].toString())});
        }, (err) => {
            res.status(500).json({"success": false, "error": err});
        }).catch((err) => {
        res.status(500).json({"success": false, "error": err});
    });
};
// query specified account all token info
var getAccount = (req, res) => {
    const address = req.params.address;
    if (!address) {
        res.status(500).json(errorParams('\'address\''));
        return;
    }

    ccHelper.query(config.peerName, config.channelName, 'token', 'getAccount', [address])
        .then((result) => {
            res.status(200).json({"success": true, "data": JSON.parse(result[0].toString())});
        }, (err) => {
            res.status(500).json({"success": false, "error": err});
        }).catch((err) => {
        res.status(500).json({"success": false, "error": err});
    });
};
// query specified account specified token info
var getBalance = (req, res) => {
    const address = req.query.address;
    const coin_type = req.query.coin_type;
    if (!address) {
        res.status(500).json(errorParams('\'address\''));
        return;
    }
    if (!coin_type) {
        res.status(500).json(errorParams('\'coin_type\''));
        return;
    }

    ccHelper.query(config.peerName, config.channelName, 'token', 'getBalance', [address, coin_type])
        .then((result) => {
            res.status(200).json({"success": true, "data": JSON.parse(result[0].toString())});
        }, (err) => {
            res.status(500).json({"success": false, "error": err});
        }).catch((err) => {
        res.status(500).json({"success": false, "error": err});
    });
};
// query specified account transaction number
var counterQuery = (req, res) => {
    const from_address = req.body.from_address;
    if (!from_address) {
        res.status(500).json(errorParams('\'from_address\''));
        return;
    }

    ccHelper.query(config.peerName, config.channelName, 'token', 'counter', [from_address]).then((result) => {
        res.status(200).json({"success": true, "data": result[0].toString()});
    }, (err) => {
        res.status(500).json({"success": false, "error": err});
    }).catch((err) => {
        res.status(500).json({"success": false, "error": err});
    });
};
// query block info by block_hash
var getBlockByHash = (req, res) => {
    const block_hash = req.params.block_hash;
    if (!block_hash) {
        res.status(500).json(errorParams('\'block_hash\''));
        return;
    }

    queryHandle.getBlockByHash(config.peerName, Buffer.from(block_hash, 'hex'), config.userName, config.orgName)
        .then((result) => {
            res.status(200).json({"success": true, "data": result});
        }, (err) => {
            res.status(500).json({"success": false, "error": err});
        }).catch((err) => {
        res.status(500).json({"success": false, "error": err});
    });
};
// query block info by block height
var getBlockByNumber = (req, res) => {
    const number = req.params.number;
    if (!number || parseInt(number) <= 0) {
        res.status(500).json(errorParams('\'number\''));
        return;
    }

    queryHandle.getBlockWithHashByNumber(config.peerName, number, config.userName, config.orgName)
        .then((result) => {
            res.status(200).json({"success": true, "data": result});
        }, (err) => {
            res.status(500).json({"success": false, "error": err});
        }).catch((err) => {
        res.status(500).json({"success": false, "error": err});
    });
};
// query transaction info by tx_id
var getTransaction = (req, res) => {
    const transaction_id = req.params.transaction_id;
    if (!transaction_id) {
        res.status(500).json(errorParams('\'transaction_id\''));
        return;
    }

    ccHelper.query(config.peerName, config.channelName, 'qscc', 'GetTransactionByID', [config.channelName, transaction_id])
        .then((result) => {
            res.status(200).json({"success": true, "data": Client.decodeTransaction(result[0])});
        }, (err) => {
            res.status(500).json({"success": false, "error": err});
        }).catch((err) => {
        res.status(500).json({"success": false, "error": err});
    });
};
//Query for Channel instantiated chaincodes
var getChaincodes = (req, res) => {
    queryHandle.getInstalledChaincodes(config.peerName, 'instantiated', config.userName, config.orgName)
        .then((result) => {
            res.status(200).json({"success": true, "data": result});
        }, (err) => {
            res.status(500).json({"success": false, "error": err});
        }).catch((err) => {
        res.status(500).json({"success": false, "error": err});
    });
};
// query current block height
var blockHeight = (req, res) => {
    queryHandle.getChainInfo(config.peerName, config.userName, config.orgName)
        .then((result) => {
            res.status(200).json({"success": true, "data": parseInt(result.height) - 1});
        }, (err) => {
            res.status(500).json({"success": false, "error": err});
        }).catch((err) => {
        res.status(500).json({"success": false, "error": err});
    });
};
// Fuzzy query info, stand by tx_id, block_hash, block_number, account address
var fuzzyQuery = (req, res) => {
    const query_id = req.params.query_id;
    if (!query_id) {
        res.status(500).json(errorParams('\'query_id\''));
        return;
    }

    if (query_id.length >= 64) {
        ccHelper.query(config.peerName, config.channelName, 'qscc', 'GetTransactionByID', [config.channelName, query_id])
            .then((result) => {
                res.status(200).json({"success": true, "type": 1, "data": Client.decodeTransaction(result[0])});
            }).catch((err) => {
            queryHandle.getBlockByHash(config.peerName, Buffer.from(query_id, 'hex'), config.userName, config.orgName)
                .then((result) => {
                    res.status(200).json({"success": true, "type": 2, "data": result});
                }, (err) => {
                    res.status(500).json({"success": false, "error": err});
                }).catch((err) => {
                res.status(500).json({"success": false, "error": err});
            });
        });
    } else {
        let value = Number(query_id);
        if (!isNaN(value)) {
            queryHandle.getBlockWithHashByNumber(config.peerName, query_id, config.userName, config.orgName)
                .then((result) => {
                    res.status(200).json({"success": true, "data": result});
                }, (err) => {
                    res.status(500).json({"success": false, "error": err});
                }).catch((err) => {
                res.status(500).json({"success": false, "error": err});
            });
        } else {
            ccHelper.query(config.peerName, config.channelName, 'token', 'getAccount', [query_id])
                .then((result) => {
                    res.status(200).json({"success": true, "data": JSON.parse(result[0].toString())});
                }, (err) => {
                    res.status(500).json({"success": false, "error": err});
                }).catch((err) => {
                res.status(500).json({"success": false, "error": err});
            });
        }
    }
};

var blockList = async (req, res) => {
    let size = req.query.size;
    size = (!size || parseInt(size) <= 0 || parseInt(size) > MaxNumPerPage) ? 10 : parseInt(size);

    let asc = req.query.asc;

    let result = await queryDB.blockList(size, asc);
    res.status(result.status).json(result.message);
};

var txList = async (req, res) => {
    let size = req.query.size;
    size = (!size || parseInt(size) <= 0 || parseInt(size) > MaxNumPerPage) ? 10 : parseInt(size);

    let asc = req.query.asc;

    let result = await queryDB.txList(size, asc);
    res.status(result.status).json(result.message);
};

var txHistory = async (req, res) => {
    let day = req.query.day;
    day = (!day || parseInt(day) <= 0) ? 14 : parseInt(day);

    let result = await queryDB.txHistory(day);
    res.status(result.status).json(result.message);
};

var blockPage = async (req, res) => {
    let page = req.query.page;
    let size = req.query.size;
    if (!page || parseInt(page) <= 0) {
        res.status(500).json(errorParams('\'page\''));
        return;
    }
    if (!size || parseInt(size) <= 0 || parseInt(size) > MaxNumPerPage) {
        res.status(500).json(errorParams('\'size\''));
        return;
    }
    let asc = req.query.asc;

    page = parseInt(page);
    size = parseInt(size);
    let start = (page - 1) * size;
    let order = (asc && parseInt(asc) === 1) ? 'asc' : 'desc';
    let selectSQL = util.format('select count(*) as COUNT from block;' +
        'select * from (select number from block order by number %s limit ?,?) a ' +
        'left join block b on a.number = b.number;', order);

    let result = await queryDB.queryDataByPage(selectSQL, [start, size], page, size);
    res.status(result.status).json(result.message);
};

var txPage = async (req, res) => {
    let page = req.query.page;
    let size = req.query.size;
    if (!page || parseInt(page) <= 0) {
        res.status(500).json(errorParams('\'page\''));
        return;
    }
    if (!size || parseInt(size) <= 0 || parseInt(size) > MaxNumPerPage) {
        res.status(500).json(errorParams('\'size\''));
        return;
    }
    let asc = req.query.asc;

    page = parseInt(page);
    size = parseInt(size);
    let start = (page - 1) * size;
    let order = (asc && parseInt(asc) === 1) ? 'asc' : 'desc';
    let selectSQL = util.format('select count(*) as COUNT from transaction;' +
        'select * from (select tx_index from transaction order by tx_index %s limit ?,?) a ' +
        'left join transaction b on a.tx_index = b.tx_index;', order);

    // let selectSQL;
    // if (asc && parseInt(asc) === 1) {
    //     selectSQL = 'select count(*) as COUNT from transaction; select * from transaction where tx_index >= ' +
    //         '(select tx_index from transaction order by tx_index limit ?,1) limit ?;';
    // } else {
    //     selectSQL = 'select count(*) as COUNT from transaction; select * from transaction where tx_index <= ' +
    //         '(select tx_index from transaction order by tx_index desc limit ?,1) order by tx_index desc limit ?;';
    // }

    // let selectSQL = util.format('SELECT COUNT(*) AS COUNT FROM transaction; ' +
    //     'SELECT * FROM transaction order by tx_index limit ?,?;');

    // let selectSQL = util.format('select count(*) as COUNT from transaction; ' +
    //     'select * from transaction where tx_index in (select t.tx_index from (select tx_index from transaction' +
    //     ' order by tx_index desc limit ?,?) as t);');

    let result = await queryDB.queryDataByPage(selectSQL, [start, size], page, size);
    res.status(result.status).json(result.message);
};
// note: query from mysql cache, data from block-listener
// Query transaction number
var txNumber = async (req, res) => {
    let result = await queryDB.txNumber();
    res.status(result.status).json(result.message);
};
// network peer number
var peerNumber = async (req, res) => {
    let result = await queryDB.peerNumber();
    res.status(result.status).json(result.message);
};
// query all own token account, if token is null
// or query own specified token account
var tokenHolders = async (req, res) => {
    const token_name = req.query.token;
    const asc = req.query.asc;
    const number = req.query.number;
    let result;
    if (token_name) {
        result = await queryDB.specifyTokenHolders(token_name, asc, number);
    } else {
        result = await queryDB.tokenHolders(number);
    }
    res.status(result.status).json(result.message);
};
// pagination display all own token account info, "size" items data per page
var tokenHoldersPage = async (req, res) => {
    const page = req.query.page;
    const size = req.query.size;
    if (!page || parseInt(page) <= 0) {
        res.status(500).json(errorParams('\'page\''));
        return;
    }
    if (!size || parseInt(size) <= 0 || parseInt(size) > MaxNumPerPage) {
        res.status(500).json(errorParams('\'size\''));
        return;
    }

    let result = await queryDB.tokenHoldersByPage(page, size);
    res.status(result.status).json(result.message);
};
// pagination display specify token holders info, "size" items data per page
var tokenHoldersByToken = async (req, res) => {
    const token_name = req.params.token_name;
    const page = req.query.page;
    const size = req.query.size;
    const asc = req.query.asc;
    if (!token_name) {
        res.status(500).json(errorParams('\'token_name\''));
        return;
    }
    if (!page || parseInt(page) <= 0) {
        res.status(500).json(errorParams('\'page\''));
        return;
    }
    if (!size || parseInt(size) <= 0 || parseInt(size) > MaxNumPerPage) {
        res.status(500).json(errorParams('\'size\''));
        return;
    }

    let result = await queryDB.specifyTokenHoldersByPage(token_name, page, size, asc);
    res.status(result.status).json(result.message);
};
// all transfer record about token or account address
var transferRecord = async (req, res) => {
    const token_name = req.query.token;
    const address = req.query.address;
    const asc = req.query.asc;
    const input = req.query.input;
    const number = req.query.number;

    if (token_name && address) {
        let result = await queryDB.transferRecord(address, token_name, asc, input, number);
        res.status(result.status).json(result.message);
    } else if (token_name) {
        let result = await queryDB.tokenTransferRecord(token_name, asc, number);
        res.status(result.status).json(result.message);
    } else if (address) {
        let result = await queryDB.accountTransferRecord(address, asc, input, number);
        res.status(result.status).json(result.message);
    } else {
        res.status(500).json(errorParams('\'transfer-record\''));
    }
};
// pagination display account transfer record, "size" items data per page
var transferRecordByAddress = async (req, res) => {
    const address = req.params.address;
    let page = req.query.page;
    let size = req.query.size;
    if (!address) {
        res.status(500).json(errorParams('\'address\''));
        return;
    }
    if (!page || parseInt(page) <= 0) {
        res.status(500).json(errorParams('\'page\''));
        return;
    }
    if (!size || parseInt(size) <= 0 || parseInt(size) > MaxNumPerPage) {
        res.status(500).json(errorParams('\'size\''));
        return;
    }
    let asc = req.query.asc;
    let input = req.query.input;

    page = parseInt(page);
    size = parseInt(size);
    let start = (page - 1) * size;
    let order = (asc && parseInt(asc) === 1) ? 'asc' : 'desc';
    let selectSQL;
    if (input && input == 1) {
        selectSQL = util.format('select count(*) as COUNT from transfer where to_address = ?;' +
            'select * from (select tx_index from transfer where to_address = ? order by tx_index %s limit ?,?) a ' +
            'left join transfer b on a.tx_index = b.tx_index;', order);
    } else {
        selectSQL = util.format('select count(*) as COUNT from transfer where from_address = ?;' +
            'select * from (select tx_index from transfer where from_address = ? order by tx_index %s limit ?,?) a ' +
            'left join transfer b on a.tx_index = b.tx_index;', order);
    }

    let result = await queryDB.queryDataByPage(selectSQL, [address, address, start, size], page, size);
    res.status(result.status).json(result.message);
};
// pagination display token transfer record, "size" items data per page
var transferRecordByToken = async (req, res) => {
    const token_name = req.params.token_name;
    let page = req.query.page;
    let size = req.query.size;
    if (!token_name) {
        res.status(500).json(errorParams('\'token_name\''));
        return;
    }
    if (!page || page <= 0) {
        res.status(500).json(errorParams('\'page\''));
        return;
    }
    if (!size || size <= 0 || parseInt(size) > MaxNumPerPage) {
        res.status(500).json(errorParams('\'size\''));
        return;
    }
    let asc = req.query.asc;

    page = parseInt(page);
    size = parseInt(size);
    let start = (page - 1) * size;
    let order = (asc && parseInt(asc) === 1) ? 'asc' : 'desc';
    let selectSQL = util.format('select count(*) as COUNT from transfer where token_name = ?;' +
        'select * from (select tx_index from transfer where token_name = ? order by tx_index %s limit ?,?) a ' +
        'left join transfer b on a.tx_index = b.tx_index;', order);

    let result = await queryDB.queryDataByPage(selectSQL, [token_name, token_name, start, size], page, size);
    res.status(result.status).json(result.message);
};

var transferRecordByAddressWithToken = async (req, res) => {
    const address = req.params.address;
    const token_name = req.params.token_name;
    let page = req.query.page;
    let size = req.query.size;
    if (!address) {
        res.status(500).json(errorParams('\'address\''));
        return;
    }
    if (!token_name) {
        res.status(500).json(errorParams('\'token_name\''));
        return;
    }
    if (!page || parseInt(page) <= 0) {
        res.status(500).json(errorParams('\'page\''));
        return;
    }
    if (!size || parseInt(size) <= 0 || parseInt(size) > MaxNumPerPage) {
        res.status(500).json(errorParams('\'size\''));
        return;
    }
    let asc = req.query.asc;
    let input = req.query.input;

    page = parseInt(page);
    size = parseInt(size);
    let start = (page - 1) * size;
    let order = (asc && parseInt(asc) === 1) ? 'asc' : 'desc';
    let selectSQL;
    if (input && input == 1) {
        selectSQL = util.format('select count(*) as COUNT from transfer where to_address = ? and token_name = ?;' +
            'select * from (select tx_index from transfer where to_address = ? and token_name = ? order by tx_index %s limit ?,?) a ' +
            'left join transfer b on a.tx_index = b.tx_index;', order);
    } else {
        selectSQL = util.format('select count(*) as COUNT from transfer where from_address = ? and token_name = ?;' +
            'select * from (select tx_index from transfer where from_address = ? and token_name = ? order by tx_index %s limit ?,?) a ' +
            'left join transfer b on a.tx_index = b.tx_index;', order);
    }
    let result = await queryDB.queryDataByPage(selectSQL, [address, token_name, address, token_name, start, size], page, size);
    res.status(result.status).json(result.message);
};

var accountFlow = async (req, res) => {
    const address = req.params.address;
    let page = req.query.page;
    let size = req.query.size;
    if (!address) {
        res.status(500).json(errorParams('\'address\''));
        return;
    }
    if (!page || parseInt(page) <= 0) {
        res.status(500).json(errorParams('\'page\''));
        return;
    }
    if (!size || parseInt(size) <= 0 || parseInt(size) > MaxNumPerPage) {
        res.status(500).json(errorParams('\'size\''));
        return;
    }
    let asc = req.query.asc;

    page = parseInt(page);
    size = parseInt(size);
    let start = (page - 1) * size;
    let order = (asc && parseInt(asc) === 1) ? 'asc' : 'desc';
    let selectSQL = util.format('select count(*) as COUNT from transfer where from_address = ? or to_address = ?;' +
        'select * from (select tx_index from transfer where from_address = ? or to_address = ? order by tx_index %s limit ?,?) a ' +
        'left join transfer b on a.tx_index = b.tx_index;', order);

    let result = await queryDB.queryDataByPage(selectSQL, [address, address, address, address, start, size], page, size);
    res.status(result.status).json(result.message);
};

var accountFlowByToken = async (req, res) => {
    const address = req.params.address;
    const token_name = req.params.token_name;
    let page = req.query.page;
    let size = req.query.size;
    if (!address) {
        res.status(500).json(errorParams('\'address\''));
        return;
    }
    if (!token_name) {
        res.status(500).json(errorParams('\'token_name\''));
        return;
    }
    if (!page || parseInt(page) <= 0) {
        res.status(500).json(errorParams('\'page\''));
        return;
    }
    if (!size || parseInt(size) <= 0 || parseInt(size) > MaxNumPerPage) {
        res.status(500).json(errorParams('\'size\''));
        return;
    }
    let asc = req.query.asc;

    page = parseInt(page);
    size = parseInt(size);
    let start = (page - 1) * size;
    let order = (asc && parseInt(asc) === 1) ? 'asc' : 'desc';
    let selectSQL = util.format('select count(*) as COUNT from transfer where token_name = ? and (from_address = ? or to_address = ?);' +
        'select * from (select tx_index from transfer where token_name = ? and (from_address = ? or to_address = ?) order by tx_index %s limit ?,?) a ' +
        'left join transfer b on a.tx_index = b.tx_index;', order);

    let result = await queryDB.queryDataByPage(selectSQL, [token_name, address, address, token_name, address, address, start, size], page, size);
    res.status(result.status).json(result.message);
};

var txRecordByAddress = async (req, res) => {
    const address = req.params.address;
    let page = req.query.page;
    let size = req.query.size;
    if (!address) {
        res.status(500).json(errorParams('\'address\''));
        return;
    }
    if (!page || parseInt(page) <= 0) {
        res.status(500).json(errorParams('\'page\''));
        return;
    }
    if (!size || parseInt(size) <= 0 || parseInt(size) > MaxNumPerPage) {
        res.status(500).json(errorParams('\'size\''));
        return;
    }
    let asc = req.query.asc;

    page = parseInt(page);
    size = parseInt(size);
    let start = (page - 1) * size;
    let order = (asc && parseInt(asc) === 1) ? 'asc' : 'desc';
    let selectSQL = util.format('select count(*) as COUNT from transaction where sender = ?;' +
        'select * from (select tx_index from transaction where sender = ? order by tx_index %s limit ?,?) a ' +
        'left join transaction b on a.tx_index = b.tx_index;', order);

    let result = await queryDB.queryDataByPage(selectSQL, [address, address, start, size], page, size);
    res.status(result.status).json(result.message);
};
// issued token  totality
var tokenNumber = async (req, res) => {
    let result = await queryDB.issuedTokenNumber();
    res.status(result.status).json(result.message);
};
// token issue details
var asset = async (req, res) => {
    let result = await queryDB.issuedTokenInfo();
    res.status(result.status).json(result.message);
};

exports.generateAccount = generateAccount;
exports.createChannel = createChannel;
exports.joinChannel = joinChannel;
exports.installChaincode = installChaincode;
exports.instanChaincode = instanChaincode;
exports.issueToken = issueToken;
exports.transfer = transfer;
exports.invoke = invoke;
exports.query = query;
exports.getAccount = getAccount;
exports.getBalance = getBalance;
exports.counterQuery = counterQuery;
exports.getBlockByHash = getBlockByHash;
exports.getBlockByNumber = getBlockByNumber;
exports.getTransaction = getTransaction;
exports.getChaincodes = getChaincodes;
exports.blockHeight = blockHeight;
exports.fuzzyQuery = fuzzyQuery;

exports.blockList = blockList;
exports.txList = txList;
exports.txHistory = txHistory;
exports.blockPage = blockPage;
exports.txPage = txPage;
exports.txNumber = txNumber;
exports.peerNumber = peerNumber;
exports.tokenHolders = tokenHolders;
exports.tokenHoldersPage = tokenHoldersPage;
exports.tokenHoldersByToken = tokenHoldersByToken;
exports.transferRecord = transferRecord;
exports.transferRecordByAddress = transferRecordByAddress;
exports.transferRecordByToken = transferRecordByToken;
exports.transferRecordByAddressWithToken = transferRecordByAddressWithToken;
exports.accountFlow = accountFlow;
exports.accountFlowByToken = accountFlowByToken;
exports.txRecordByAddress = txRecordByAddress;
exports.tokenNumber = tokenNumber;
exports.asset = asset;
