'use strict';

let util = require('util');
require('./public/inkchain-samples/app/config');
let config = require("./config/config.json");
let helper = require('./public/inkchain-samples/app/helper');
let blockDB = require('./public/inkchain-samples/app/block-db');
let queryHandler = require('./public/inkchain-samples/app/query');
let logger = helper.getLogger('block-listener');
let moment = require('moment');
let cache = require('memory-cache');
let events = require("events");
let emitter = new events.EventEmitter();

// sync failed block, key : number, value : query number
// if query number more than 3, give up sync
let blockMap = new Map();
let maxReqNum = 10; // failed request repeat request max number
let allEventhubs = [];
let queue_length = 0;
let max_queue_length = 20;
let cur_block_number = -1;
let max_block_number = -1;
let account_flag = false;

emitter.on("sync_account_event", accountQueue);

function accountQueue() {
    account_flag = true;
    let keys = cache.keys();
    if (keys.length <= 0) return;
    let number = keys[0];
    let userArray = cache.get(number);
    if (userArray == null) {
        accountQueue();
        return;
    }

    let eventPromises = [];
    userArray.forEach((address) => {
        let promise = queryHandler.queryChaincodePersist(config.peerName, config.channelName, 'token', [address], 'getAccount', config.userName, config.orgName);
        eventPromises.push(promise);
    });
    Promise.all(eventPromises).then((results) => {
        cache.del(number);
        accountQueue();
        let selectSQL1 = util.format('INSERT INTO account VALUES (?,?) ON DUPLICATE KEY UPDATE amount=?');
        let selectSQL2 = util.format('INSERT INTO token VALUES (?,?,?) ON DUPLICATE KEY UPDATE balance = ?');
        for (let key in results) {
            let tokens = results[key][0].toString();
            blockDB.query(selectSQL1, [userArray[key], tokens, tokens]).catch((err) => {
                logger.error(util.format('accountQueue "%s" failed, err: %s', userArray[key], err));
            });
            let obj = JSON.parse(tokens);
            for (let item in obj) {
                blockDB.query(selectSQL2, [userArray[key], item, obj[item], obj[item]]).catch((err) => {
                    logger.error(util.format('accountQueue "%s" failed, err: %s', userArray[key], err));
                });
            }
        }
    }, (err) => {
        cache.del(number);
        accountQueue();
        logger.error('getAccount failed, err:', err);
    }).catch((err) => {
        cache.del(number);
        accountQueue();
        logger.error('getAccount catch err:', err);
    });
}

function blockListener(channelName, peers, username, org) {
    logger.debug('\n\n============ listener block start ============\n');
    logger.info(util.format('received member "%s" of the organization "%s": ', username, org));
    let eventhubs = helper.newEventHubs(peers, org);
    for (let key in eventhubs) {
        let eh = eventhubs[key];
        eh.connect();
        allEventhubs.push(eh);
    }

    eventhubs.forEach((eh) => {
        eh.registerBlockEvent((block) => {
            // in real-world situations, a peer may have more than one channels so
            // we must check that this block came from the channel we asked the peer to join
            let first_tx = block.data.data[0];
            let header = first_tx.payload.header;
            let channel_id = header.channel_header.channel_id;
            if (channel_id !== channelName) return;

            logger.info(util.format('EventHub "%s" has reported block number "%d" update for channel "%s"',
                eh._ep._endpoint.addr, block.header.number, channelName));

            blockEventCallBack(block);
        }, (err) => {
            logger.error('registerBlockEvent failed, err: ', err);
            disconnectEvent();
        });
    });
}

function disconnectEvent() {
    for (let key in allEventhubs) {
        let eventhub = allEventhubs[key];
        if (eventhub && eventhub.isconnected()) {
            logger.debug('Disconnecting the event hub');
            eventhub.disconnect();
        }
    }
}

function blockEventCallBack(block) {
    syncAccount(block);
    getTransferTx(block);
    getIssueToken(block);
    return queryHandler.getBlockWithHashByNumber(config.peerName, block.header.number, config.userName, config.orgName)
        .then((processedBlock) => {
            insertDB(processedBlock)
        }, (err) => {
            logger.error(util.format('failed to get block number %d Info, err:%s', block.header.number, err))
        }).catch((err) => {
            logger.error('blockEventCallBack catch err: ', err);
        });
}

function syncAccount(block) {
    let userArray = [];
    block.data.data.forEach((tx) => {
        let txId = tx.payload.header.channel_header.tx_id;
        if (txId === "") return;

        let actions = tx.payload.data.actions;
        if (actions.length <= 0) return;

        let input = actions[0].payload.chaincode_proposal_payload.input;
        let token = input.chaincode_spec.chaincode_id.name;
        let fcn = input.chaincode_spec.input.args[0];
        if (token === 'token' && fcn === 'transfer') {
            let to_address = input.chaincode_spec.input.args[1];
            let from_address = input.sender_spec.sender;
            userArray.push(to_address);
            userArray.push(from_address);
        }
    });
    cache.put(parseInt(block.header.number), userArray);
    if (cache.keys().length === 1 && account_flag) {
        emitter.emit("sync_account_event");
    }
}

function getTransferTx(block) {
    let insertSQL = 'INSERT INTO transfer VALUES ?';
    let values = [];
    let number = block.header.number;
    for (let i in block.data.data) {
        let tx = block.data.data[i];
        let txId = tx.payload.header.channel_header.tx_id;
        if (txId === "") continue;

        let actions = tx.payload.data.actions;
        if (actions.length <= 0) continue;

        let input = actions[0].payload.chaincode_proposal_payload.input;
        let token = input.chaincode_spec.chaincode_id.name;
        let fcn = input.chaincode_spec.input.args[0];
        let validationCode = block.metadata.metadata[2][i];
        if (token === 'token' && fcn === 'transfer') {
            let from_address;
            if (input.sender_spec !== null) {
                from_address = input.sender_spec.sender;
            }
            let to_address = input.chaincode_spec.input.args[1];
            let token_name = input.chaincode_spec.input.args[2];
            let amounts = input.chaincode_spec.input.args[3];
            let txTime = tx.payload.header.channel_header.timestamp;
            values.push([number * config.maxTxNum + i, txId, from_address, to_address, token_name, amounts, validationCode, moment(new Date(txTime)).format('YYYY-MM-DD HH:mm:ss')]);
        }
    }
    if (values.length <= 0) return;

    blockDB.query(insertSQL, [values]).catch((err) => {
        logger.error('getTransferTx, insert tx to db catch err:', err);
    });
}

function getIssueToken(block) {
    let insertSQL = 'INSERT INTO issue_token VALUES ?';
    let values = [];
    for (let i in block.data.data) {
        let tx = block.data.data[i];
        let txId = tx.payload.header.channel_header.tx_id;
        if (txId === "") continue;

        let actions = tx.payload.data.actions;
        if (actions.length <= 0) continue;

        let input = actions[0].payload.chaincode_proposal_payload.input;
        let token = input.chaincode_spec.chaincode_id.name;
        let fcn = input.chaincode_spec.input.args[0];
        let validationCode = block.metadata.metadata[2][i];
        if (token === 'ascc' && fcn === 'registerAndIssueToken' && validationCode === 0) {
            let symbol = input.chaincode_spec.input.args[1];
            let total_supply = input.chaincode_spec.input.args[2];
            let decimals = input.chaincode_spec.input.args[3];
            let publish_address = input.chaincode_spec.input.args[4];
            let msg = input.chaincode_spec.input.args[5];
            let txTime = tx.payload.header.channel_header.timestamp;
            values.push([symbol, total_supply, decimals, publish_address, msg, moment(new Date(txTime)).format('YYYY-MM-DD HH:mm:ss')]);
        }
    }
    if (values.length <= 0) return;

    blockDB.query(insertSQL, [values]).catch((err) => {
        logger.error('getIssueToken, insert tx to db catch err:', err);
    });
}

function insertDB(processedBlock) {
    let eventPromises = [];
    let number = processedBlock.block.header.number;
    let block_hash = processedBlock.hash;
    let length = processedBlock.block.data.data.length;
    let txSQL = 'INSERT INTO transaction VALUES ?';
    let values = [];
    for (let i = 0; i < length; i++) {
        let tx = processedBlock.block.data.data[i];
        let txId = tx.payload.header.channel_header.tx_id;
        if (txId === "") continue;

        let from_address, fcn, validationCode, fcnArgs;
        let actions = tx.payload.data.actions;
        if (actions.length > 0) {
            let input = actions[0].payload.chaincode_proposal_payload.input;
            if (input.sender_spec !== null) {
                from_address = input.sender_spec.sender;
            }
            let args = input.chaincode_spec.input.args;
            if (args.length > 0) {
                fcn = input.chaincode_spec.input.args[0];
                if (args.length > 1) {
                    fcnArgs = args.slice(1).toString();
                }
            }
            validationCode = processedBlock.block.metadata.metadata[2][i];
        }

        let txTime = tx.payload.header.channel_header.timestamp;
        values.push([number * config.maxTxNum + i, txId, from_address, fcn, fcnArgs, validationCode, moment(new Date(txTime)).format('YYYY-MM-DD HH:mm:ss')]);
    }
    if (values.length > 0) {
        let txPromise = blockDB.query(txSQL, [values]);
        eventPromises.push(txPromise);
    }
    let last_tx = processedBlock.block.data.data[length - 1];
    let blockTime = last_tx.payload.header.channel_header.timestamp;
    let blockSQL = 'INSERT INTO block VALUES(?,?,?,?,?)';
    let paramSQL = [parseInt(number), block_hash, length, processedBlock.blockSize, moment(new Date(blockTime)).format('YYYY-MM-DD HH:mm:ss')];
    let blockPromise = blockDB.query(blockSQL, paramSQL);
    eventPromises.push(blockPromise);
    return Promise.all(eventPromises).then((rows) => {
        logger.info(util.format('insertDB, insert block number:%d into db', number));
    }, (err) => {
        logger.error(util.format('insertDB, failed to insert block number:%d into db, err:%s', number, err));
    }).catch((err) => {
        logger.error('insertDB catch err:', err);
    });
}

function syncBlock(peer, username, org, blockHeight) {
    // get block max height from db,compare with current height in blockchain network
    // if lower，get missing block info insert into db
    if (blockHeight === 0) return;

    let selectSQL = 'SELECT max(number) as blocknum FROM block';
    return blockDB.query(selectSQL).then((rows) => {
        let src_cur_block;
        if (rows == null || rows[0].blocknum == null) {
            src_cur_block = 0;
        } else {
            src_cur_block = parseInt(rows[0].blocknum);
        }

        cur_block_number = src_cur_block + 1;
        for (let i = cur_block_number; i < blockHeight; i++) {
            getBlockByNumber(peer, i, username, org).catch((err) => {
                logger.error('getBlockByNumber catch err:', err);
            });
        }
    }, (err) => {
        logger.error('syncBlock, query db failed, err:', err);
    }).catch((err) => {
        logger.error('syncBlock catch err:', err);
    });
}

async function getBlockByNumber(peer, blockNumber, username, org) {
    while (queue_length >= max_queue_length) {
        await sleep(3000);
    }
    queue_length++;

    return queryHandler.getBlockWithHashByNumber(peer, blockNumber, username, org).then((processedBlock) => {
        cur_block_number++;
        queue_length--;
        if (blockMap.has(blockNumber)) {
            blockMap.delete(blockNumber);
        }
        if (cur_block_number >= max_block_number) {
            emitter.emit("sync_account_event");
        }
        syncAccount(processedBlock.block);
        getTransferTx(processedBlock.block);
        getIssueToken(processedBlock.block);
        insertDB(processedBlock);
    }, (err) => {
        queue_length--;
        let v = blockMap.get(blockNumber);
        if (typeof v === 'undefined') {
            v = 1;
        } else if (v >= maxReqNum) {
            max_block_number--;
            return;
        }

        hasBlockCache(blockNumber).then((result) => {
            if (result === false) {
                blockMap.set(blockNumber, v + 1);
                getBlockByNumber(peer, blockNumber, username, org).catch((err) => {
                    logger.error('repeat getBlockByNumber catch err:', err);
                });
            }
        });
        logger.error(util.format('getBlockByNumber, failed to get block number:%d , err:%s', blockNumber, err));
    }).catch((err) => {
        queue_length--;
        logger.error(util.format('getBlockByNumber "%s" catch err:%s', blockNumber, err));
    });
}

function hasBlockCache(number) {
    let selectSQL = util.format('SELECT COUNT(*) AS count FROM block WHERE number=?');
    return blockDB.query(selectSQL, [number]).then((rows) => {
        let count = rows[0].count;
        return count > 0;
    }, (err) => {
        return false;
    }).catch((err) => {
        return false;
    });
}

async function sleep(duration) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, duration);
    });
}

async function startListener(channelName, peer, username, org) {
    // init config
    await sleep(3000);

    queryHandler.getChainInfo(peer, username, org).then((result) => {
        if (result.height === undefined) {
            logger.info('no block in inkchain network.');
        } else {
            max_block_number = parseInt(result.height);
            logger.info('inkchain network current block height: ', max_block_number);
        }
        blockListener(channelName, [peer], username, org);
        syncBlock(peer, username, org, max_block_number);

    }, (err) => {
        logger.error('getChainInfo failed, err:', err);
    }).catch((err) => {
        logger.error('getChainInfo failed, err:', err);
    });
}

startListener(config.channelName, config.peerName, config.userName, config.orgName);
