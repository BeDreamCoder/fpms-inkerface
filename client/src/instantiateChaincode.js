let inkClient = require("./inkClient");

//const CC_ID = 'network';
const CC_ID = 'token';
const CC_VERSION = '1.0';
const CHANNEL_NAME = 'mychannel';

inkClient.instantiateChaincode(CHANNEL_NAME, CC_ID, CC_VERSION, 'init',[]).then((res)=>{
    console.log(JSON.stringify(res));
});
