/**
 * Created by wangh09 on 2017/12/14.
 */
require('../../public/inkchain-samples/app/config');
let queryHandler = require('../../public/inkchain-samples/app/query');

let type = 'installed'; //'instantiated'

queryHandler.getInstalledChaincodes('peer1', type, 'user2', 'org1').then((result) =>{
    console.log(result);
});