CHANNEL_NAME="mychannel"
CC_SRC_LANGUAGE="javascript"
VERSION="1"
DELAY="3"
MAX_RETRY="5"
VERBOSE="false"

if [ "$CC_SRC_LANGUAGE" = "javascript" ]; then
    CC_RUNTIME_LANGUAGE=node
    CC_SRC_PATH="chaincode/"
else
    echo "The chaincode language ${CC_SRC_LANGUAGE} is not supported by this script"
    echo "Supported chaincode languages are: javascript"
    exit 1
fi

. scripts/envVar.sh

export PATH=${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=$PWD/../config/

checkCommitReadiness() {
  ORG=$1
  shift 1
  setGlobals $ORG
  echo "===================== Checking the commit readiness of the chaincode definition on peer0.org${ORG} on channel '$CHANNEL_NAME'... ===================== "
	local rc=1
	local COUNTER=1
	# continue to poll
  # we either get a successful response, or reach MAX RETRY
	while [ $rc -ne 0 -a $COUNTER -lt $MAX_RETRY ] ; do
    sleep $DELAY
    echo "Attempting to check the commit readiness of the chaincode definition on peer0.org${ORG}, Retry after $DELAY seconds."
    set -x
    peer lifecycle chaincode checkcommitreadiness --channelID $CHANNEL_NAME --name emr --version ${VERSION} --sequence ${VERSION} --output json --init-required >&log.txt
    res=$?
    set +x
    let rc=0
    for var in "$@"
    do
      grep "$var" log.txt &>/dev/null || let rc=1
    done
		COUNTER=$(expr $COUNTER + 1)
	done
  cat log.txt
  if test $rc -eq 0; then
    echo "===================== Checking the commit readiness of the chaincode definition successful on peer0.org${ORG} on channel '$CHANNEL_NAME' ===================== "
  else
    echo "!!!!!!!!!!!!!!! After $MAX_RETRY attempts, Check commit readiness result on peer0.org${ORG} is INVALID !!!!!!!!!!!!!!!!"
    echo
    exit 1
  fi
} 


setGlobals 1
peer lifecycle chaincode package emr.tar.gz --path ${CC_SRC_PATH} --lang ${CC_RUNTIME_LANGUAGE} --label emr_${VERSION} >&log.txt
echo "===================== Chaincode packaged - peer0.org1 ===================== "

# Install chaincode on peer0.org1
echo "Installing chaincode -> peer0.org1"
setGlobals 1
peer lifecycle chaincode install emr.tar.gz >&log.txt
echo "===================== Chaincode is installed on peer0.org1 ===================== "

# Install chaincode on peer0.org2
echo "Install chaincode on peer0.org2..."
setGlobals 2
peer lifecycle chaincode install emr.tar.gz >&log.txt
echo "===================== Chaincode is installed on peer0.org2 ===================== "

# Query installed chaincode
echo "Query installed chaincode..."
setGlobals 1
peer lifecycle chaincode queryinstalled >&log.txt
cat log.txt
PACKAGE_ID=$(sed -n "/emr_${VERSION}/{s/^Package ID: //; s/, Label:.*$//; p;}" log.txt)
echo "===================== Query installed successful on peer0.org1 on channel ===================== "

# Approve chaincode definition for org1
echo "Approve chaincode definition for org1..."
setGlobals 1
peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name emr --version ${VERSION} --init-required --package-id ${PACKAGE_ID} --sequence ${VERSION} >&log.txt
cat log.txt
echo "===================== Chaincode definition approved on peer0.org1 on channel ===================== "

## expect org1 to have approved and org2 not to
checkCommitReadiness 1 "\"Org1MSP\": true" "\"Org2MSP\": false"
checkCommitReadiness 2 "\"Org1MSP\": true" "\"Org2MSP\": false"

# Approve chaincode definition for org2
echo "Approve chaincode definition for org2..."
setGlobals 2
peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name emr --version ${VERSION} --init-required --package-id ${PACKAGE_ID} --sequence ${VERSION} >&log.txt
echo "===================== Chaincode definition approved on peer0.org2 on channel ===================== "

## expect them both to have approved
checkCommitReadiness 1 "\"Org1MSP\": true" "\"Org2MSP\": true"
checkCommitReadiness 2 "\"Org1MSP\": true" "\"Org2MSP\": true"

# Commit chaincode definition to channel
echo "------------------==================xxxxxxxxxxxxxx{$@}"
parsePeerConnectionParameters 1 2
echo "asdasdasdas---PEER_CONN_PARMS: ${PEER_CONN_PARMS[@]}"
peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name emr ${PEER_CONN_PARMS[@]} --version ${VERSION} --sequence ${VERSION} --init-required >&log.txt
echo "===================== Chaincode definition committed on channel '$CHANNEL_NAME' ===================== "

# Query committed chaincode
echo "Query committed chaincode..."
# Query chaincode definition on peer0.org1
echo "Query chaincode definition on peer0.org1..."
setGlobals 1
peer lifecycle chaincode querycommitted --channelID $CHANNEL_NAME --name emr >&log.txt

# Query chaincode definition on peer0.org2
echo "Query chaincode definition on peer0.org2..."
setGlobals 2
peer lifecycle chaincode querycommitted --channelID $CHANNEL_NAME --name emr >&log.txt

# Invoke chaincode
echo "Invoke chaincode..."

parsePeerConnectionParameters 1 2
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile $ORDERER_CA -C $CHANNEL_NAME -n emr ${PEER_CONN_PARMS[@]} --isInit -c '{"function":"initLedger","Args":[]}' >&log.txt

sleep 8
exit 0