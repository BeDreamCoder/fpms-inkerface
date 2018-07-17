/**
 * Created by zhangtailin on 2018/6/15.
 */
const hanlder = require('./public/inkchain-samples/app/request-hanlder');

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

    app.get('*', (req, res) => {
        res.status(404).json({"success": false, "error": '404 No Found'});
    });
};
