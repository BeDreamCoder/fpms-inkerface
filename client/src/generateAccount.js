let inkClient = require("./inkClient");

inkClient.generateAccount().then((res)=>{
    console.log(JSON.stringify(res));
});
