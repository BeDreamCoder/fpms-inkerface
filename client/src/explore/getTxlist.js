let inkClient = require("../inkClient");

inkClient.getTxList().then((res)=>{
    console.log(JSON.stringify(res));
});