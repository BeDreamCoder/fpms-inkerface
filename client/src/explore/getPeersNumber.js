let inkClient = require("../inkClient");

inkClient.getPeersNumber().then((res)=>{
    console.log(JSON.stringify(res));
});