/**
 * Created by zhangtailin on 2018/6/15.
 */
const hanlder = require('../../public/inkchain-samples/app/request-hanlder');
const crosshanlder = require('../../public/inkchain-samples/app/crosschain-handler');

// API Server Endpoints
module.exports = function (app) {

    app.get('/generate-account', hanlder.generateAccount);

    app.post('/create-channel', hanlder.createChannel);

    app.post('/join-channel', hanlder.joinChannel);

    app.post('/install-cc', hanlder.installChaincode);

    app.post('/instantiate-cc', hanlder.instanChaincode);

    app.post('/issue-token', hanlder.issueToken);

    app.post('/transfer', hanlder.transfer);

    app.post('/invoke', hanlder.invoke);

    app.post('/query', hanlder.query);

    app.get('/get-account/:address', hanlder.getAccount);

    app.get('/get-balance', hanlder.getBalance);

    app.post('/query-counter', hanlder.counterQuery);

    app.get('/block/hash/:block_hash', hanlder.getBlockByHash);

    app.get('/block/number/:number', hanlder.getBlockByNumber);

    app.get('/get-transaction/:transaction_id', hanlder.getTransaction);

    app.get('/chaincodes', hanlder.getChaincodes);

    app.get('/block-height', hanlder.blockHeight);

    app.get('/query/:query_id', hanlder.fuzzyQuery);

    app.get('/block-list', hanlder.blockList);

    app.get('/tx-list', hanlder.txList);

    app.get('/tx-history', hanlder.txHistory);

    app.get('/block-page', hanlder.blockPage);

    app.get('/tx-page', hanlder.txPage);

    app.get('/transaction-count', hanlder.txNumber);

    app.get('/peer-number', hanlder.peerNumber);

    app.get('/token-holders', hanlder.tokenHolders);

    app.get('/token-holders/display', hanlder.tokenHoldersPage);

    app.get('/token-holders/token/:token_name', hanlder.tokenHoldersByToken);

    app.get('/transfer-record', hanlder.transferRecord);

    app.get('/transfer-record/address/:address', hanlder.transferRecordByAddress);

    app.get('/transfer-record/token/:token_name', hanlder.transferRecordByToken);

    app.get('/transfer-record/address/:address/token/:token_name', hanlder.transferRecordByAddressWithToken);

    app.get('/account-flow/address/:address', hanlder.accountFlow);

    app.get('/account-flow/address/:address/token/:token_name', hanlder.accountFlowByToken);

    app.get('/transaction-record/address/:address', hanlder.txRecordByAddress);

    app.get('/token-count', hanlder.tokenNumber);

    app.get('/asset', hanlder.asset);

    app.post('/platform-register', crosshanlder.platformRegister);

    app.post('/cross-transfer', crosshanlder.crossTransfer);

    app.get('/cross-sign/:cross_txid', crosshanlder.crossSign);

    app.get('/public-tx/:tx', crosshanlder.queryPublicTx);

    app.post('/unlock', crosshanlder.unlock);

    app.get('/download', crosshanlder.downloadOperatotr);

    app.get('/platform-balance', crosshanlder.platformBalance);

    app.get('/address-transfer/:qtum_address', crosshanlder.hexAddressFromQtum);

    app.get('*', (req, res) => {
        res.status(404).json({"success": false, "error": '404 No Found'});
    });
};
