/**
 * Created by wangh09 on 2017/12/14.
 */

require('../../public/inkchain-samples/app/config');
let queryHandler = require('../../public/inkchain-samples/app/query');

let number = "1";
queryHandler.getBlockByNumber('peer1', number, 'user2', 'org1').then((result) =>{
    console.log(JSON.stringify(result));
});