/**
 * Created by wangh09 on 2017/12/14.
 */

require('../../public/inkchain-samples/app/config');
let queryHandler = require('../../public/inkchain-samples/app/query');

queryHandler.getChainInfo('peer1', 'user2', 'org1').then((result) =>{
    console.log("blockHeight:"+result.height);
    console.log("currentBlockHash:"+result.currentBlockHash.toBuffer().toString('hex'));
    console.log("previousBlockHash:"+result.previousBlockHash.toBuffer().toString('hex'));
});