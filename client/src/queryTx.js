/**
 * Created by wangh09 on 2018/1/16.
 */

let inkClient = require("./inkClient");

inkClient.queryTx('ed00fec1ce893d16833e68f771e22d1c0d96057f7cb71cdaf0c28d4d1396b54e').then((res)=>{
    console.log(JSON.stringify(res));
});
