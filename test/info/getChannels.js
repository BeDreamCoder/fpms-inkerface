/**
 * Created by wangh09 on 2017/12/14.
 */

require('../../public/inkchain-samples/app/config');
let queryHandler = require('../../public/inkchain-samples/app/query');

let hash = "169b89540413b7f3e6d4d7d91c697bfae07e179c1f8586cf93c905a804bf8a55";
queryHandler.getChannels('peer1','user2', 'org1').then((result) =>{
    console.log(result);
});