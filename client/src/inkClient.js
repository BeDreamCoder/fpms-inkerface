/**
 * Created by wangh09 on 2018/1/15.
 */

let grpc = require('grpc');
require('es6-promise').polyfill();
require('isomorphic-fetch');
let _ccProto = grpc.load('protos/peer/chaincode.proto').protos;
let ethUtils = require('ethereumjs-util');
let settingsConfig = require('./config');
const Long = require('long'); //30585 685 785
let server_address = "localhost:8081";
function signTX(ccId, fcn, arg, msg, counter, inkLimit, priKey) {
    let args = [];
    let senderAddress = ethUtils.privateToAddress(Buffer.from(priKey, "hex"));
    let senderSpec = {
        sender: Buffer.from(settingsConfig.AddressPrefix + senderAddress.toString("hex")),
        counter: Long.fromString(counter.toString()),
        ink_limit: Buffer.from(inkLimit),
        msg: Buffer.from(msg)
    };
    args.push(Buffer.from(fcn ? fcn : 'invoke', 'utf8'));
    for (let i=0; i<arg.length; i++) {
        args.push(Buffer.from(arg[i], 'utf8'));
    }
    let invokeSpec = {
        type: _ccProto.ChaincodeSpec.Type.GOLANG,
        chaincode_id: {
            name: ccId
        },
        input: {
            args: args
        }
    };
    let cciSpec = new _ccProto.ChaincodeInvocationSpec();
    let signContent = new _ccProto.SignContent();
    signContent.setChaincodeSpec(invokeSpec);
    signContent.setSenderSpec(senderSpec);
    signContent.id_generation_alg = cciSpec.id_generation_alg;
    let signHash = ethUtils.sha256(signContent.toBuffer());
    let sigrsv = ethUtils.ecsign(signHash, Buffer.from(priKey, "hex"));

    return Buffer.concat([
        ethUtils.setLengthLeft(sigrsv.r, 32),
        ethUtils.setLengthLeft(sigrsv.s, 32),
        ethUtils.toBuffer(sigrsv.v - 27)
    ]);
}

let sdk_counter = 0;
let queue_length = 0;
let max_queue_length = 10;
let mutex_counter = false;
let sender_address = "";
let invoke_error = false;
async function transfer(to, tokenId, amount, msg, priKey) {
    while(mutex_counter || invoke_error || queue_length >= max_queue_length) {
        if(queue_length === 0) invoke_error = false;

        await sleep(300);
    }
    mutex_counter = true;

    let senderAddress = settingsConfig.AddressPrefix + ethUtils.privateToAddress(Buffer.from(priKey, "hex")).toString('hex');
    if(senderAddress !== sender_address) {
        sdk_counter = 0;
        sender_address = senderAddress;
    }
    let ccId = 'token';
    let fcn = 'transfer';
    let inkLimit = "100000000000";
    if (sdk_counter === 0) {
        return queryCounter(senderAddress).then((result) => {
            if (result.success === false) return result;

            let sig = signTX(ccId, fcn, [to, tokenId, amount], msg, result.data, inkLimit, priKey);
            sdk_counter = parseInt(result.data) + 1;
            queue_length++;
            mutex_counter = false;
            return _transfer(senderAddress, to, tokenId, amount, msg, result.data, inkLimit, sig.toString('hex')).then((response) => {
                queue_length--;
                if (response.success !== true){
                    sdk_counter = 0;
                    invoke_error = true;
                }
                return response;
            });
        });
    } else {
        let counter_now = sdk_counter;
        sdk_counter++;
        queue_length++;
        mutex_counter = false;
        let sig = signTX(ccId, fcn, [to, tokenId, amount], msg, counter_now, inkLimit, priKey);
        return _transfer(senderAddress, to, tokenId, amount, msg, counter_now.toString(), inkLimit, sig.toString('hex')).then((result) => {
            queue_length--;
            if (result.success !== true){
                sdk_counter = 0;
                invoke_error = true;
                throw new Error("invoke fail");
            }
            return result;
        });
    }
}
async function queryCounter(address) {
    let data = {
        from_address: address,
    };
    return fetch("http://"+server_address+"/query-counter",{
        method:"POST",
        headers: {
            "Content-Type": 'application/json'
        },
        body:JSON.stringify(data)
    }).then((result)=>{
        return result.json();
    });
}
async function getBalance(address, coin_type) {
    return fetch("http://"+server_address+"/get-balance?address="+address+"&coin_type="+coin_type,{
        method:"GET",
        headers: {
            "Content-Type": 'application/json'
        },
    }).then((result)=>{
        return result.json();
    });
}
async function getAccount(address) {
    return fetch("http://"+server_address+"/get-account/" + address,{
        method:"GET",
        headers: {
            "Content-Type": 'application/json'
        },
    }).then((result)=>{
        return result.json();
    });
}
async function queryTx(txId) {
    return fetch("http://"+server_address+"/get-transaction/" + txId,{
        method:"GET",
        headers: {
            "Content-Type": 'application/json'
        },
    }).then((result)=>{
        return result.json();
    });
}
async function _transfer(from, to, tokenId, amount, msg, counter,inkLimit, sig) {
    let data = {
        to_address: to,
        from_address: from,
        coin_type: tokenId,
        amount: amount,
        message: msg,
        counter: counter,
        ink_limit: inkLimit,
        sig: sig
    };

    return fetch("http://"+server_address+"/transfer",{
        method:"POST",
        headers: {
            "Content-Type": 'application/json'
        },
        body:JSON.stringify(data)
    }).then((result)=>{
        return result.json();
    });
}

async function invoke(ccId, fcn, args, msg, priKey) {
    while(mutex_counter || queue_length >= max_queue_length) {
        await sleep(300);
    }
    mutex_counter = true;
    let senderAddress = settingsConfig.AddressPrefix + ethUtils.privateToAddress(Buffer.from(priKey, "hex")).toString('hex');
    if(senderAddress !== sender_address) {
        sdk_counter = 0;
        sender_address = senderAddress;
    }
    let inkLimit = "100000000";
    if(sdk_counter === 0) {
        return queryCounter(senderAddress).then((result) => {
            if (result.success === false) return result;

            let sig = signTX(ccId, fcn, args, msg, result.data, inkLimit, priKey);
            sdk_counter = parseInt(result.data) + 1;
            queue_length++;
            mutex_counter = false;
            return _invoke(senderAddress, ccId, fcn, args, msg, result.data, inkLimit, sig.toString('hex')).then((response)=> {
                if(response.success !== true) throw new Error("invoke fail");
                queue_length--;
                return response;
            }).catch((err)=>{
                sdk_counter = 0;
                queue_length--;
                throw err;
            });
        });
    } else {
        let counter_now = sdk_counter;
        sdk_counter ++;
        queue_length ++;
        mutex_counter = false;
        let sig = signTX(ccId, fcn, args, msg, counter_now, inkLimit, priKey);
        return _invoke(senderAddress, ccId, fcn, args, msg, counter_now, inkLimit, sig.toString('hex')).then((result)=> {
            if(result.success !== true) throw new Error("invoke fail");
            queue_length--;
            return result;
        }).catch((err)=>{
            sdk_counter = 0;
            queue_length--;
            throw err;
        });
    }
}

async function _invoke(sender, ccId, fcn, args, msg, counter, inkLimit, sig) {
    let data = {
        cc_id: ccId,
        fcn: fcn,
        sender: sender,
        args: args,
        message: msg,
        counter: counter,
        ink_limit: inkLimit,
        sig: sig
    };
    return fetch("http://"+server_address+"/invoke",{
        method:"POST",
        headers: {
            "Content-Type": 'application/json'
        },
        body:JSON.stringify(data)
    }).then((result)=>{
        return result.json();
    });
}

async function query(ccId, fcn, args) {
    let data = {
        cc_id: ccId,
        fcn: fcn,
        args: args
    };
    return fetch("http://"+server_address+"/query",{
        method:"POST",
        headers: {
            "Content-Type": 'application/json'
        },
        body:JSON.stringify(data)
    }).then((result)=>{
        return result.json();
    });
}

async function createChannel(channelName, configPath) {
    let data = {
        channelName: channelName,
        channelConfigPath: configPath
    };

    return fetch("http://"+server_address+"/create-channel",{
        method:"POST",
        headers: {
            "Content-Type": 'application/json'
        },
        body:JSON.stringify(data)
    }).then((result)=>{
        return result.json();
    });
}

async function joinChannel(channelName, peers) {
    let data = {
        channelName: channelName,
        peers: peers
    };

    return fetch("http://"+server_address+"/join-channel",{
        method:"POST",
        headers: {
            "Content-Type": 'application/json'
        },
        body:JSON.stringify(data)
    }).then((result)=>{
        return result.json();
    });
}

async function installChaincode(peers, chaincodeName, chaincodePath, chaincodeVersion) {
    let data = {
        peers: peers,
        chaincodeName: chaincodeName,
        chaincodePath: chaincodePath,
        chaincodeVersion: chaincodeVersion
    };

    return fetch("http://"+server_address+"/install-cc",{
        method:"POST",
        headers: {
            "Content-Type": 'application/json'
        },
        body:JSON.stringify(data)
    }).then((result)=>{
        return result.json();
    });
}

async function instantiateChaincode(channelName, chaincodeName, chaincodeVersion, fcn, args) {
    let data = {
        chaincodeName: chaincodeName,
        chaincodeVersion: chaincodeVersion,
        channelName: channelName,
        fcn: fcn,
        args: args
    };

    return fetch("http://"+server_address+"/instantiate-cc",{
        method:"POST",
        headers: {
            "Content-Type": 'application/json'
        },
        body:JSON.stringify(data)
    }).then((result)=>{
        return result.json();
    });
}

async function generateAccount() {
    return fetch("http://"+server_address+"/generate-account",{
        method:"GET",
        headers: {
            "Content-Type": 'application/json'
        }
    }).then((result)=>{
        return result.json();
    });
}

async function issueToken(coinName, totalSupply, decimals, address) {
    let data = {
        coin_name: coinName,
        totalSupply: totalSupply,
        decimals: decimals,
        publish_address: address
    };

    return fetch("http://"+server_address+"/issue-token",{
        method:"POST",
        headers: {
            "Content-Type": 'application/json'
        },
        body:JSON.stringify(data)
    }).then((result)=>{
        return result.json();
    });
}

async function queryBlockByHash(hash) {
    return fetch("http://"+server_address+"/block/hash/" + hash,{
        method:"GET",
        headers: {
            "Content-Type": 'application/json'
        }
    }).then((result)=>{
        return result.json();
    });
}

async function queryBlockByNumber(number) {
    return fetch("http://"+server_address+"/block/number/" + number,{
        method:"GET",
        headers: {
            "Content-Type": 'application/json'
        }
    }).then((result)=>{
        return result.json();
    });
}

async function getPeersNumber() {
    return fetch("http://"+server_address+"/peer-number",{
        method:"GET",
        headers: {
            "Content-Type": 'application/json'
        }
    }).then((result)=>{
        return result.json();
    });
}

async function getBlockHeight() {
    return fetch("http://"+server_address+"/block-height",{
        method:"GET",
        headers: {
            "Content-Type": 'application/json'
        }
    }).then((result)=>{
        return result.json();
    });
}

async function getTxCount() {
    return fetch("http://"+server_address+"/transaction-count",{
        method:"GET",
        headers: {
            "Content-Type": 'application/json'
        }
    }).then((result)=>{
        return result.json();
    });
}

async function getInstantiateChaincodes() {
    return fetch("http://"+server_address+"/chaincodes",{
        method:"GET",
        headers: {
            "Content-Type": 'application/json'
        }
    }).then((result)=>{
        return result.json();
    });
}
async function getBlockList() {
    return fetch("http://"+server_address+"/block-list",{
        method:"GET",
        headers: {
            "Content-Type": 'application/json'
        }
    }).then((result)=>{
        return result.json();
    });
}

async function getTxList() {
    return fetch("http://"+server_address+"/tx-list",{
        method:"GET",
        headers: {
            "Content-Type": 'application/json'
        }
    }).then((result)=>{
        return result.json();
    });
}

async function getTxHistory() {
    return fetch("http://"+server_address+"/tx-history",{
        method:"GET",
        headers: {
            "Content-Type": 'application/json'
        }
    }).then((result)=>{
        return result.json();
    });
}

async function blockDataByPage(page) {
    return fetch("http://"+server_address+"/block-page/" + page,{
        method:"GET",
        headers: {
            "Content-Type": 'application/json'
        }
    }).then((result)=>{
        return result.json();
    });
}

async function txDataByPage(page) {
    return fetch("http://"+server_address+"/tx-page/" + page,{
        method:"GET",
        headers: {
            "Content-Type": 'application/json'
        }
    }).then((result)=>{
        return result.json();
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports.createChannel = createChannel;
module.exports.joinChannel = joinChannel;
module.exports.installChaincode = installChaincode;
module.exports.instantiateChaincode = instantiateChaincode;
module.exports.generateAccount = generateAccount;
module.exports.issueToken = issueToken;
module.exports.transfer = transfer;
module.exports.getAccount = getAccount;
module.exports.getBalance = getBalance;
module.exports.queryCounter = queryCounter;
module.exports.invoke = invoke;
module.exports.query = query;
module.exports.queryTx = queryTx;
module.exports.queryBlockByHash = queryBlockByHash;
module.exports.queryBlockByNumber = queryBlockByNumber;

module.exports.getPeersNumber = getPeersNumber;
module.exports.getBlockHeight = getBlockHeight;
module.exports.getInstantiateChaincodes = getInstantiateChaincodes;
module.exports.getTxCount = getTxCount;
module.exports.getBlockList = getBlockList;
module.exports.getTxList = getTxList;
module.exports.getTxHistory = getTxHistory;
module.exports.blockDataByPage = blockDataByPage;
module.exports.txDataByPage = txDataByPage;

