let inkClient = require("./inkClient");

inkClient.createChannel("mychannel", "../../../config/artifacts/channel/mychannel.tx").then((res)=>{
    console.log(JSON.stringify(res));
});
