#!/bin/bash
#
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
#

jq --version > /dev/null 2>&1
if [ $? -ne 0 ]; then
	echo "Please Install 'jq' https://stedolan.github.io/jq/ to execute this script"
	echo
	exit 1
fi

starttime=$(date +%s)

# Print the usage message
function printHelp () {
  echo "Usage: "
  echo "  ./testHalalAPIs.sh -l golang|node"
  echo "    -l <language> - chaincode language (defaults to \"golang\")"
}
# Language defaults to "golang"
LANGUAGE="golang"

# Parse commandline args
while getopts "h?l:" opt; do
  case "$opt" in
    h|\?)
      printHelp
      exit 0
    ;;
    l)  LANGUAGE=$OPTARG
    ;;
  esac
done

##set chaincode path
function setChaincodePath(){
	LANGUAGE=`echo "$LANGUAGE" | tr '[:upper:]' '[:lower:]'`
	case "$LANGUAGE" in
		"golang")
		CC_SRC_PATH="github.com/token"
		;;
		"node")
		CC_SRC_PATH="$PWD/utils/chaincode/src/github.com/token"
		;;
		*) printf "\n ------ Language $LANGUAGE is not supported yet ------\n"$
		exit 1
	esac
}

setChaincodePath

echo
echo "POST request Create channel  ..."
echo
curl -s -X POST \
  http://localhost:8081/create-channel \
  -H "content-type: application/json" \
  -d "{
	\"channelName\":\"mychannel\",
	\"channelConfigPath\":\"../../inkchain-samples/artifacts/channel/mychannel.tx\"
}"
echo
echo
sleep 5

echo "POST request Join channel on Org1"
echo
curl -s -X POST \
  http://localhost:8081/join-channel \
  -H "content-type: application/json" \
  -d "{
	\"channelName\":\"mychannel\",
	\"peers\":[\"peer1\",\"peer2\"]
}"
echo
echo

echo "POST Install chaincode on Org1"
echo
curl -s -X POST \
  http://localhost:8081/install-cc \
  -H "content-type: application/json" \
  -d "{
	\"peers\":[\"peer1\",\"peer2\"],
	\"chaincodeName\":\"token\",
	\"chaincodePath\":\"$CC_SRC_PATH\",
	\"chaincodeVersion\":\"1.0\"
}"
echo
echo

echo "POST instantiate chaincode on peer1 of Org1"
echo
curl -s -X POST \
  http://localhost:8081/instantiate-cc \
  -H "content-type: application/json" \
  -d "{
	\"chaincodeName\":\"token\",
	\"chaincodeVersion\":\"1.0\",
	\"channelName\":\"mychannel\",
	\"fcn\":\"init\",
	\"args\":[]
}"
echo
echo

echo "POST issue token on peer1 of Org1"
echo
curl -s -X POST \
  http://localhost:8081/issue-token \
  -H "content-type: application/json" \
  -d "{
	\"coin_name\":\"INK\",
	\"totalSupply\":\"1000000000000000000000000000\",
	\"decimals\":\"18\",
	\"publish_address\":\"i411b6f8f24F28CaAFE514c16E11800167f8EBd89\"
}"
echo
echo