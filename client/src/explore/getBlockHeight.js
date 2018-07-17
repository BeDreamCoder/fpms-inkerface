let inkClient = require("../inkClient");

inkClient.getBlockHeight().then((res)=>{
    console.log(JSON.stringify(res));
});