let inkClient = require("../inkClient");

inkClient.getTxCount().then((res)=>{
    console.log(JSON.stringify(res));
});