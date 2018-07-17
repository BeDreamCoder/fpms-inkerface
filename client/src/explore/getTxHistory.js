let inkClient = require("../inkClient");

inkClient.getTxHistory().then((res)=>{
    console.log(JSON.stringify(res));
});