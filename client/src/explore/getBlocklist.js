let inkClient = require("../inkClient");

inkClient.getBlockList().then((res)=>{
    console.log(JSON.stringify(res));
});