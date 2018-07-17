/**
 * Created by wangh09 on 2018/1/16.
 */
let inkClient = require("./inkClient");

inkClient.getBalance('i411b6f8f24F28CaAFE514c16E11800167f8EBd89','INK').then((res)=>{
    console.log(res);
});
