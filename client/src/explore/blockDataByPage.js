let inkClient = require("../inkClient");

inkClient.blockDataByPage("1").then((res)=>{
    console.log(JSON.stringify(res));
});