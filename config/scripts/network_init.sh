#!/usr/bin/env bash

#
#Copyright Ziggurat Corp. 2017 All Rights Reserved.
#
#SPDX-License-Identifier: Apache-2.0
#

# Detecting whether can import the header file to render colorful cli output
if [ -f ./header.sh ]; then
 source ./header.sh
elif [ -f scripts/header.sh ]; then
 source scripts/header.sh
else
 alias echo_r="echo"
 alias echo_g="echo"
 alias echo_b="echo"
fi

CHANNEL_NAME="$1"
: ${CHANNEL_NAME:="mychannel"}
: ${TIMEOUT:="60"}
COUNTER=0
MAX_RETRY=5
SIGN_A=145991461c0cf5834980686e45e2e60908a5731c9560d789cd0df4bc18e223ee48bd0068a04927ead01a1d59315f3079eab3b78cf9dacfaab5b30b34f2430c7401
SIGN_B=1d7b5c51c3fdd5d6086ed9d8e79b4d52889a8efdd8a6874732daeb210ae3766d31aa9dd28c2e63bcad73acb57fdcade0bf159671191f6d75a9960608b4f0aaf300
SIGN_C=258a3344660fad7a2f7b5c1179e3ffe6de169810727216963b420845f220448d7bc0cf4c1897fb0f1df24d2213aab9743903f5a65049f7c508ae98cd6f99243e01
SIGN_D=2b71b953d38a69537d5fa7e8fd71d860d66655b17980d64a22c1b1da517592d9534a69545a0f71caa8ce58e03cae6c8e0800a76a139448c32c11b8f299345e1700

ORDERER_CA=/opt/gopath/src/github.com/inklabsfoundation/inkchain/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

echo_b "Chaincode Path : "$CC_PATH
echo_b "Channel name : "$CHANNEL_NAME

verifyResult () {
    if [ $1 -ne 0 ] ; then
        echo_b "!!!!!!!!!!!!!!! "$2" !!!!!!!!!!!!!!!!"
        echo_r "================== ERROR !!! FAILED to execute MVE =================="
        echo
        exit 1
    fi
}

issueToken(){
    peer chaincode invoke -o orderer.example.com:7050  --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA -C ${CHANNEL_NAME} -n ascc -c '{"Args":["registerAndIssueToken","'$1'","1000000000000000000000000000","9","iba1146d431d12cab51c3e0e106d6264b4b378f91"]}' >log.txt
    res=$?
    cat log.txt
    verifyResult $res "Issue a new token using ascc has Failed."
    echo_g "===================== A new token has been successfully issued======================= "
    echo
}

chaincodeQueryA () {
    echo_b "Attempting to Query account A's balance on peer "
    sleep 3
    peer chaincode query -C mychannel -n token -c '{"Args":["getBalance","iba1146d431d12cab51c3e0e106d6264b4b378f91","INK"]}' >log.txt
    res=$?
    cat log.txt
    verifyResult $res "query account A Failed."
}

addUser(){
    echo_b "Attempting to add user "
    sleep 5
    peer chaincode invoke -o orderer.example.com:7050  --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA -C ${CHANNEL_NAME} -n network -c '{"Args":["addUser","'$1'", "'$2'"]}' -i "1000000000" -z b17e3169bc49db69938ce3750c49a20015d28b3e4d512666f221d51de3db3105 >log.txt
    res=$?
    cat log.txt
    verifyResult $res "add user has Failed."
    echo_g "===================== user add successfully======================= "
    echo
}

issueAuthorityToken(){
    echo_b "Attempting to Issue Authority Token "
    sleep 5
    peer chaincode invoke -o orderer.example.com:7050  --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA -C ${CHANNEL_NAME} -n network -c '{"Args":["issueAuthorityToken","'$1'"]}' -i "1000000000" -z b17e3169bc49db69938ce3750c49a20015d28b3e4d512666f221d51de3db3105 #>log.txt
    res=$?
    #cat log.txt
    verifyResult $res "issue token has Failed."
    echo_g "===================== token issue successfully======================= "
    echo
}

deleteAuthorityToken(){
    echo_b "Attempting to Delete Authority Token "
    sleep 5
    peer chaincode invoke -o orderer.example.com:7050  --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA -C ${CHANNEL_NAME} -n network -c '{"Args":["deleteAuthorityToken","'$1'"]}' -i "1000000000" -z b17e3169bc49db69938ce3750c49a20015d28b3e4d512666f221d51de3db3105 >log.txt
    res=$?
    cat log.txt
    verifyResult $res "delete token has Failed."
    echo_g "===================== token issue successfully======================= "
    echo
}

sendAuthorityTokenToUser(){
    echo_b "Attempting to Send Authority Token "
    sleep 5
    peer chaincode invoke -o orderer.example.com:7050  --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA -C ${CHANNEL_NAME} -n network -c '{"Args":["sendAuthorityTokenToUser","'$1'","'$2'"]}' -i "1000000000" -z b17e3169bc49db69938ce3750c49a20015d28b3e4d512666f221d51de3db3105 >log.txt
    res=$?
    cat log.txt
    verifyResult $res "send authority token has Failed."
    echo_g "===================== token send successfully======================= "
    echo
}

withdrawAuthorityTokenFromUser(){
    echo_b "Attempting to Withdraw Authority Token "
    sleep 5
    peer chaincode invoke -o orderer.example.com:7050  --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA -C ${CHANNEL_NAME} -n network -c '{"Args":["withdrawAuthorityTokenFromUser","'$1'","'$2'"]}' -i "1000000000" -z b17e3169bc49db69938ce3750c49a20015d28b3e4d512666f221d51de3db3105 >log.txt
    res=$?
    cat log.txt
    verifyResult $res "withdraw authority send token has Failed."
    echo_g "===================== token send successfully======================= "
    echo
}

userQuery () {
    echo_b "Attempting to Query User "
    sleep 5
    peer chaincode query -C mychannel -n network -c '{"Args":["queryUser","'$1'"]}' >log.txt
    res=$?
    cat log.txt
    verifyResult $res "query user failed."
}

queryAuthorityToken () {
    echo_b "Attempting to Query Authority Token "
    sleep 5
    peer chaincode query -C mychannel -n network -c '{"Args":["queryAuthorityToken"]}' >log.txt
    res=$?
    cat log.txt
    verifyResult $res "query token failed."
}

sendTokenToUser(){
    echo_b "Attempting to Send Token "
    sleep 5
    peer chaincode invoke -o orderer.example.com:7050  --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA -C ${CHANNEL_NAME} -n network -c '{"Args":["sendTokenToUser","'$1'","'$2'"]}' -i "1000000000" -z b17e3169bc49db69938ce3750c49a20015d28b3e4d512666f221d51de3db3105 >log.txt
    res=$?
    cat log.txt
    verifyResult $res "send token has Failed."
    echo_g "===================== token send successfully======================= "
    echo
}

insertDataInfo(){
    echo_b "Attempting to Insert Data Info"
    sleep 5
    peer chaincode invoke -o orderer.example.com:7050  --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA -C ${CHANNEL_NAME} -n network -c '{"Args":["insertDataInfo","'$1'","'$2'","'$3'","'$4'"]}' -i "1000000000" -z b17e3169bc49db69938ce3750c49a20015d28b3e4d512666f221d51de3db3105 >log.txt
    res=$?
    cat log.txt
    verifyResult $res "Failed to insert data info."
    echo_g "===================== insert data info successfully======================= "
    echo
}

insertAccessRule(){
    echo_b "Attempting to Insert Access Rule"
    sleep 5
    peer chaincode invoke -o orderer.example.com:7050  --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA -C ${CHANNEL_NAME} -n network -c '{"Args":["insertAccessRule","'$1'","'$2'","'$3'","'$4'","'$5'"]}' -i "1000000000" -z b17e3169bc49db69938ce3750c49a20015d28b3e4d512666f221d51de3db3105 >log.txt
    res=$?
    cat log.txt
    verifyResult $res "Failed to insert access rule."
    echo_g "===================== insert access rule successfully======================= "
    echo
}

getDataTag(){
    echo_b "Attempting to Get Data Tag"
    sleep 5
    peer chaincode invoke -o orderer.example.com:7050  --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA -C ${CHANNEL_NAME} -n network -c '{"Args":["getDataTag","'$1'"]}' -i "1000000000" -z f62fb9b8c4e0273afe34ed1cd8164af0a8f638836b87d1543256fad46e6eba99 >log.txt
    res=$?
    cat log.txt
    verifyResult $res "Failed to get data tag."
    echo_g "===================== get data tag successfully======================= "
    echo
}


getDataAccessPermissionA(){
    echo_b "Attempting to Get Data Access Permission"
    sleep 5
    peer chaincode invoke -o orderer.example.com:7050  --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA -C ${CHANNEL_NAME} -n network -c '{"Args":["getDataAccessPermission","'$1'","'$2'","'$3'","'$4'","'$5'","'$6'","'$7'"]}' -i "1000000000" -z f62fb9b8c4e0273afe34ed1cd8164af0a8f638836b87d1543256fad46e6eba99 >log.txt
    res=$?
    cat log.txt
    verifyResult $res "Failed to get data access permission."
    echo_g "===================== get data access permission successfully======================= "
    echo
}

getDataAccessPermissionB(){
    echo_b "Attempting to Get Data Access Permission"
    sleep 5
    peer chaincode invoke -o orderer.example.com:7050  --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA -C ${CHANNEL_NAME} -n network -c '{"Args":["getDataAccessPermission","'$1'","'$2'","'$3'","'$4'","'$5'","'$6'","'$7'"]}' -i "1000000000" -z 74aceb1de660b91895ec2ea7251f10c0c5ca74f778723f2ebbdcd4c5dd542d11 >log.txt
    res=$?
    cat log.txt
    verifyResult $res "Failed to get data access permission."
    echo_g "===================== get data access permission successfully======================= "
    echo
}

permissionVerify(){
    echo_b "Attempting to Verify Permission"
    sleep 5
    peer chaincode invoke -o orderer.example.com:7050  --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA -C ${CHANNEL_NAME} -n network -c '{"Args":["permissionVerify","'$1'","{\"permission\":true,\"operation tag\":4,\"user address\":\"ie43e15257182377bc957a99ce0ff65ff1c876a1b\",\"data hash\":\"JunJiB\",\"data tag\":\"131074\",\"timestamp\":\"2018-07-27T12:36:04.1680779Z\",\"validity period\":20}"]}' -i "1000000000" -z f62fb9b8c4e0273afe34ed1cd8164af0a8f638836b87d1543256fad46e6eba99 >log.txt
    res=$?
    cat log.txt
    verifyResult $res "Failed to verify sign data."
    echo_g "===================== verified permission successfully======================= "
    echo
}

testSign(){
    echo_b "Attempting to Sign Data"
    sleep 5
    peer chaincode invoke -o orderer.example.com:7050  --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA -C ${CHANNEL_NAME} -n network -c '{"Args":["testSign","'$1'","'$2'","'$3'","'$4'"]}' -i "1000000000" -z f62fb9b8c4e0273afe34ed1cd8164af0a8f638836b87d1543256fad46e6eba99 >log.txt
    res=$?
    cat log.txt
    verifyResult $res "Failed to sign data."
    echo $res
    echo_g "===================== get data sign successfully======================= "
    echo
}

testVerify(){
    echo_b "Attempting to Verify Sign Data"
    sleep 5
    peer chaincode invoke -o orderer.example.com:7050  --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA -C ${CHANNEL_NAME} -n network -c '{"Args":["testVerify"]}' -i "1000000000" -z f62fb9b8c4e0273afe34ed1cd8164af0a8f638836b87d1543256fad46e6eba99 >log.txt
    res=$?
    cat log.txt
    verifyResult $res "Failed to verify sign data."
    echo_g "===================== verified sign data successfully======================= "
    echo
}

echo_b "=====================6.network invoke======================="
#issueToken INK

echo_b "=====================7.query account======================="
#chaincodeQueryA

echo_b "=====================8.add user======================="
#addUser Alice ie43e15257182377bc957a99ce0ff65ff1c876a1b
##f62fb9b8c4e0273afe34ed1cd8164af0a8f638836b87d1543256fad46e6eba99
#addUser Bob i3caf082aa98a78f4aafe1268cea4a4154a9b84f4
##74aceb1de660b91895ec2ea7251f10c0c5ca74f778723f2ebbdcd4c5dd542d11
#addUser Zxbt i50601cac9fd70ee1b129c36de687c1f53e8035a9
#addUser Zxbt2 ib935cdc4dc42f500f9c20e0ba180defb65dd6841
addUser Monitor i215a4ab64ae82f6a90df8b13c1c46ea9a441c855

echo_b "=====================9.issue token======================="
#issueAuthorityToken MJJU
#issueAuthorityToken MJJI
#issueAuthorityToken MJMM
#issueAuthorityToken MJGK

#issueAuthorityToken JZKJ
#issueAuthorityToken JZHA
#issueAuthorityToken JZLJ

#issueAuthorityToken ZQZB
#issueAuthorityToken ZQBB
#issueAuthorityToken ZQXB
#issueAuthorityToken ZQNB
#issueAuthorityToken ZQDB
#issueAuthorityToken JWAA

#queryAuthorityToken

echo_b "=====================10.send token======================="
#sendTokenToUser ie43e15257182377bc957a99ce0ff65ff1c876a1b 1000000000000000
#sendAuthorityTokenToUser ie43e15257182377bc957a99ce0ff65ff1c876a1b JWAA
#sendAuthorityTokenToUser ie43e15257182377bc957a99ce0ff65ff1c876a1b MJJU
#userQuery ie43e15257182377bc957a99ce0ff65ff1c876a1b
#sendTokenToUser i3caf082aa98a78f4aafe1268cea4a4154a9b84f4 1000000000000000
#sendAuthorityTokenToUser i3caf082aa98a78f4aafe1268cea4a4154a9b84f4 JWAA
#sendAuthorityTokenToUser i3caf082aa98a78f4aafe1268cea4a4154a9b84f4 MJGK
#userQuery i3caf082aa98a78f4aafe1268cea4a4154a9b84f4

#sendTokenToUser i50601cac9fd70ee1b129c36de687c1f53e8035a9 1000000000000000
#sendAuthorityTokenToUser i50601cac9fd70ee1b129c36de687c1f53e8035a9 JWAA
#sendAuthorityTokenToUser i50601cac9fd70ee1b129c36de687c1f53e8035a9 MJJU
#userQuery i50601cac9fd70ee1b129c36de687c1f53e8035a9

#sendTokenToUser ib935cdc4dc42f500f9c20e0ba180defb65dd6841 1000000000000000
#sendAuthorityTokenToUser ib935cdc4dc42f500f9c20e0ba180defb65dd6841 JWAA
#sendAuthorityTokenToUser ib935cdc4dc42f500f9c20e0ba180defb65dd6841 MJGK
#userQuery ib935cdc4dc42f500f9c20e0ba180defb65dd6841 

sendTokenToUser i215a4ab64ae82f6a90df8b13c1c46ea9a441c855 1000000000000000
sendAuthorityTokenToUser i215a4ab64ae82f6a90df8b13c1c46ea9a441c855 JWAA
#sendAuthorityTokenToUser ib935cdc4dc42f500f9c20e0ba180defb65dd6841 MJGK
userQuery i215a4ab64ae82f6a90df8b13c1c46ea9a441c855

echo_b "=====================11.insert data access rule====================="
#insertAccessRule 131073 2097183 2097192 2097224 2097288
#insertAccessRule 131074 2097172 2097199 2097224 2097288
#insertAccessRule 131076 2097172 2097188 2097231 2097288
#insertAccessRule 131080 2097172 2097188 2097220 2097295
#insertAccessRule 67585 1081375 1081384 1081416 1081480
#insertAccessRule 67586 1081364 1081391 1081416 1081480
#insertAccessRule 67588 1081364 1081380 1081423 1081480
#insertAccessRule 67592 1081364 1081380 1081412 1081487
#insertAccessRule 66561 1064991 1065000 1065032 1065096
#insertAccessRule 66562 1064980 1065007 1065032 1065096
#insertAccessRule 66564 1064980 1064996 1065039 1065096
#insertAccessRule 66568 1064980 1064996 1065028 1065103
#insertAccessRule 66049 1056799 1056808 1056840 1056904
#insertAccessRule 66050 1056788 1056815 1056840 1056904
#insertAccessRule 66052 1056788 1056804 1056847 1056904
#insertAccessRule 66056 1056788 1056804 1056836 1056911
#insertAccessRule 34817 557087 557096 557128 557192
#insertAccessRule 34818 557076 557103 557128 557192
#insertAccessRule 34820 557076 557092 557135 557192
#insertAccessRule 34824 557076 557092 557124 557199
#insertAccessRule 33793 540703 540712 540744 540808
#insertAccessRule 33794 540692 540719 540744 540808
#insertAccessRule 33796 540692 540708 540751 540808
#insertAccessRule 33800 540692 540708 540740 540815
#insertAccessRule 33281 532511 532520 532552 532616
#insertAccessRule 33282 532500 532527 532552 532616
#insertAccessRule 33284 532500 532516 532559 532616
#insertAccessRule 33288 532500 532516 532548 532623

#echo_b "=====================12.get data tag====================="
#getDataTag ie43e15257182377bc957a99ce0ff65ff1c876a1b
#getDataTag i3caf082aa98a78f4aafe1268cea4a4154a9b84f4

#echo_b "=====================13.get data access permission====================="
# 0: user address [1]: register sign [2]: hash [3]: tag [4]: price [5]: data onwer's address [6]: required operation
#userQuery ie43e15257182377bc957a99ce0ff65ff1c876a1b
#getDataAccessPermissionA ie43e15257182377bc957a99ce0ff65ff1c876a1b $SIGN_A JunJueA 131073 100 ie43e15257182377bc957a99ce0ff65ff1c876a1b 8

# failed case
#getDataAccessPermissionA ie43e15257182377bc957a99ce0ff65ff1c876a1b $SIGN_B JunJiA 131074 50 ie43e15257182377bc957a99ce0ff65ff1c876a1b 8

#getDataAccessPermissionB i3caf082aa98a78f4aafe1268cea4a4154a9b84f4 $SIGN_C JunJiB 131074 50 i3caf082aa98a78f4aafe1268cea4a4154a9b84f4 8

#userQuery ie43e15257182377bc957a99ce0ff65ff1c876a1b
#getDataAccessPermissionA ie43e15257182377bc957a99ce0ff65ff1c876a1b $SIGN_C JunJiB 131074 50 i3caf082aa98a78f4aafe1268cea4a4154a9b84f4 4
#userQuery ie43e15257182377bc957a99ce0ff65ff1c876a1b

# failed case
#getDataAccessPermissionB i3caf082aa98a78f4aafe1268cea4a4154a9b84f4 $SIGN_A JunJueA 131073 100 ie43e15257182377bc957a99ce0ff65ff1c876a1b 4

#permissionVerify $SIGN_D

#echo_b "=====================14.test sign====================="
#SIGN_A
#testSign JunJueA 131073 100 ie43e15257182377bc957a99ce0ff65ff1c876a1b
#SIGN_B
#testSign JunJiA  131074 50  ie43e15257182377bc957a99ce0ff65ff1c876a1b
#SIGN_C
#testSign JunJiB  131074 50  i3caf082aa98a78f4aafe1268cea4a4154a9b84f4
#SIGN_D
#testVerify

echo
echo_g "=====================All GOOD, MVE Test completed 0710===================== "
echo
exit 0


#content：eyJwZXJtaXNzaW9uIjoiVUdWeWJXbDBkR1ZrTGc9PSIsIm9wZXJhdGlvbiB0YWciOjgsInVzZXIgYWRkcmVzcyI6ImllNDNlMTUyNTcxODIzNzdiYzk1N2E5OWNlMGZmNjVmZjFjODc2YTFiIiwiZGF0YSBoYXNoIjoiSnVuSnVlQSIsImRhdGEgdGFnIjoiMTMxMDczIiwidGltZXN0YW1wIjoiMjAxOC0wNy0yNVQxNTowNzozMy4wOTY0Njc0WiIsInZhbGlkaXR5IHBlcmlvZCI6IjIifQ==\
#sign：3b272909805fd420832f0cc1ea236573a54dad13c79f0a9fd236dd0e47d6a1bf5e97ecb16aa89098e36882c50837b862149c0d5d4a907fe92e75ab1f90abf97a01\
#8406336b3e6776d211be8c624320707d39518a61d479589a25fc9161745b4292d492b723f88645c90822be9897be6e3378daba8d60381224397049a6ef2dd381

#f62fb9b8c4e0273afe34ed1cd8164af0a8f638836b87d1543256fad46e6eba99
#0a689f16ea9d8b7b0a1ae73963ef90c819f390642349d751ad7ed1c9d60f9f908265032d2dc163a8380c98a3a1f3bca7e51a450827417851231528dad57ad433
