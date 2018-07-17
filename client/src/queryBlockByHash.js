let inkClient = require("./inkClient");

inkClient.queryBlockByHash('ef9100f4ba7baf4d17fef51b7177048261ed87ea3265215202662534fff133aa').then((res)=>{
    console.log(JSON.stringify(res));
});
