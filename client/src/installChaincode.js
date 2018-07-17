let inkClient = require("./inkClient");

//const TOKEN_CC_PATH = 'github.com/network';
//const TOKEN_CC_ID = 'network';
const TOKEN_CC_PATH = 'github.com/token';
const TOKEN_CC_ID = 'token';
inkClient.installChaincode(['peer1','peer2'], TOKEN_CC_ID, TOKEN_CC_PATH, '1.0').then((res)=>{
    console.log(JSON.stringify(res));
});
