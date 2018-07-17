let inkClient = require("../inkClient");

inkClient.txDataByPage("1").then((res)=>{
    console.log(JSON.stringify(res));
});