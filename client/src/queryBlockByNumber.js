let inkClient = require("./inkClient");

inkClient.queryBlockByNumber("1").then((res)=>{
    console.log(JSON.stringify(res));
});
