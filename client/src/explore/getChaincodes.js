let inkClient = require("../inkClient");

inkClient.getInstantiateChaincodes().then((res)=>{
    console.log(JSON.stringify(res));
});