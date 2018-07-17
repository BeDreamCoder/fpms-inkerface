/**
 * Created by zhangtailin on 2018/6/15.
 */
const hanlder = require('./request-hanlder');

// API Server Endpoints
module.exports = function (app) {

    app.get('/generate-account', hanlder.generateAccount);

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

    app.get('/token-count', hanlder.tokenNumber);

    app.get('/asset', hanlder.asset);

    app.get('*', (req, res) => {
        res.status(404).json({"success": false, "error": '404 No Found'});
    });
};
