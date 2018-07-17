/**
 * Created by wangh09 on 2018/1/15.
 */

const Wallet = require('./wallet').Wallet;
const queryDB = require('../db/query-db');
const util = require('util');

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

var blockList = async (req, res) => {
    let size = req.query.size;
    size = (!size || parseInt(size) <= 0) ? 10 : parseInt(size);

    let asc = req.query.asc;

    let result = await queryDB.blockList(size, asc);
    res.status(result.status).json(result.message);
};

var txList = async (req, res) => {
    let size = req.query.size;
    size = (!size || parseInt(size) <= 0) ? 10 : parseInt(size);

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
    if (!size || parseInt(size) <= 0) {
        res.status(500).json(errorParams('\'size\''));
        return;
    }
    let asc = req.query.asc;

    page = parseInt(page);
    size = parseInt(size);
    let start = (page - 1) * size;
    let order = (asc && parseInt(asc) === 1) ? 'asc' : 'desc';
    let selectSQL = util.format('SELECT COUNT(*) AS COUNT FROM block; ' +
        'SELECT * FROM block order by datetime %s limit ?,?', order);

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
    if (!size || parseInt(size) <= 0) {
        res.status(500).json(errorParams('\'size\''));
        return;
    }
    let asc = req.query.asc;

    page = parseInt(page);
    size = parseInt(size);
    let start = (page - 1) * size;
    let order = (asc && parseInt(asc) === 1) ? 'asc' : 'desc';
    let selectSQL = util.format('SELECT COUNT(*) AS COUNT FROM transaction; ' +
        'SELECT * FROM transaction order by datetime %s limit ?,?', order);

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
    if (!size || parseInt(size) <= 0) {
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
    if (!size || parseInt(size) <= 0) {
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
    if (!size || parseInt(size) <= 0) {
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
        selectSQL = util.format('select COUNT(*) AS COUNT from transfer where to_address = ?; ' +
            'select * from transfer where to_address = ? order by datetime %s limit ?,?', order);
    } else {
        selectSQL = util.format('select COUNT(*) AS COUNT from transfer where from_address = ?; ' +
            'select * from transfer where from_address = ? order by datetime %s limit ?,?', order);
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
    if (!size || size <= 0) {
        res.status(500).json(errorParams('\'size\''));
        return;
    }
    let asc = req.query.asc;

    page = parseInt(page);
    size = parseInt(size);
    let start = (page - 1) * size;
    let order = (asc && parseInt(asc) === 1) ? 'asc' : 'desc';
    let selectSQL = util.format('select COUNT(*) AS COUNT from transfer where token_name = ?; ' +
        'select * from transfer where token_name = ? order by datetime %s limit ?,?', order);

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
    if (!size || parseInt(size) <= 0) {
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
        selectSQL = util.format('select COUNT(*) AS COUNT from transfer where to_address = ? and token_name = ?; ' +
            'select * from transfer where  to_address = ? and token_name = ? order by datetime %s limit ?,?', order);
    } else {
        selectSQL = util.format('select COUNT(*) AS COUNT from transfer where from_address = ? and token_name = ?; ' +
            'select * from transfer where  from_address = ? and token_name = ? order by datetime %s limit ?,?', order);
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
    if (!size || parseInt(size) <= 0) {
        res.status(500).json(errorParams('\'size\''));
        return;
    }
    let asc = req.query.asc;

    page = parseInt(page);
    size = parseInt(size);
    let start = (page - 1) * size;
    let order = (asc && parseInt(asc) === 1) ? 'asc' : 'desc';
    let selectSQL = util.format('select count(tx_id) AS COUNT from transfer where from_address = ? or to_address = ?; ' +
        'select * from transfer where from_address = ? or to_address = ? order by datetime %s limit ?,?', order);

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
    if (!size || parseInt(size) <= 0) {
        res.status(500).json(errorParams('\'size\''));
        return;
    }
    let asc = req.query.asc;

    page = parseInt(page);
    size = parseInt(size);
    let start = (page - 1) * size;
    let order = (asc && parseInt(asc) === 1) ? 'asc' : 'desc';
    let selectSQL = util.format('select count(tx_id) AS COUNT from transfer where token_name = ? and (from_address = ? or to_address = ?); ' +
        'select * from transfer where token_name = ? and (from_address = ? or to_address = ?) order by datetime %s limit ?,?', order);

    let result = await queryDB.queryDataByPage(selectSQL, [token_name, address, address, token_name, address, address, start, size], page, size);
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
exports.tokenNumber = tokenNumber;
exports.asset = asset;
