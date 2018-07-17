/**
 * Created by wangh09 on 2017/12/14.
 */


require('../../public/inkchain-samples/app/config');
let queryHandler = require('../../public/inkchain-samples/app/query');
let Client = require('inkchain-client');

let hash = "8c9be4c2f3d1c140cc4639b7b4b514af9d3fe17bb823fe5c08092ffc495c00e1";
queryHandler.getTransactionByID('peer1', hash, 'user2', 'org1').then((result) =>{
    console.log(JSON.stringify(result));
});

