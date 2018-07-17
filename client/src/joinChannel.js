let inkClient = require("./inkClient");

inkClient.joinChannel("mychannel",['peer1','peer2']).then((res)=>{
    console.log(JSON.stringify(res));
});
