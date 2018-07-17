/**
 * Created by wangh09 on 2018/1/16.
 */

let inkClient = require("./inkClient");

inkClient.query('qscc','GetTransactionByID',['mychannel','e80dd16f85c5f9e4c73bf4ac6281d4ab0524d4d3da3667937fd2a16259c31207']).then((res)=>{
    console.log(JSON.stringify(res));
});
