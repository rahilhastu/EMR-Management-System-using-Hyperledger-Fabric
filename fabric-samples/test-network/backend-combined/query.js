"use strict";

const { Gateway, Wallets } = require("fabric-network");
const path = require("path");
const fs = require("fs");

let ccp;
let wallet;

async function initialize(userType) {
  try {
    const ccpPath = path.resolve(
      __dirname,
      "../..",
      "test-network",
      "organizations",
      "peerOrganizations",
      "org1.example.com",
      "connection-org1.json"
    );
    ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"));
    const walletPath = path.join(process.cwd(), "wallet");
    wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    const identity = await wallet.get(userType);
    if (!identity) {
      console.log(
        `An identity for the ${userType} user does not exist in the wallet`
      );
      console.log("Run enrollAdmin.js and registerUser.js before retrying");
      return;
    }
  } catch (error) {
    console.error(`Failed transaction: ${error}`);
    process.exit(1);
  }
}

//Doctor functions
async function doctor_addEMR(userEmail, adderEmail, emrID, type, content) {
  try {
    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: "doctor",
      discovery: { enabled: true, asLocalhost: true },
    });

    const network = await gateway.getNetwork("mychannel");

    const contract = network.getContract("emr");

    const result = await contract.submitTransaction(
      "addEMR",
      userEmail,
      adderEmail,
      emrID,
      type,
      content
    );
    console.log(`Transaction successful. Result : ${result.toString()}`);

    await gateway.disconnect();

    return result.toString();
  } catch (error) {
    console.error(`doctor_addEMR: Failed transaction: ${error}`);
    return error.toString();
  }
}

async function doctor_getEMR(emrID, email) {
  try {
    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: "doctor",
      discovery: { enabled: true, asLocalhost: true },
    });

    const network = await gateway.getNetwork("mychannel");

    const contract = network.getContract("emr");

    const result = await contract.submitTransaction("getEMR", emrID, email);
    console.log(`Transaction successful. Result : ${result.toString()}`);

    await gateway.disconnect();

    return result.toString();
  } catch (error) {
    console.error(`doctor_getEMR: Failed transaction: ${error}`);
    return error.toString();
  }
}

// Patient functions
async function patient_addEMR(userEmail, adderEmail, emrID, type, content) {
  try {
    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: "patient",
      discovery: { enabled: true, asLocalhost: true },
    });

    const network = await gateway.getNetwork("mychannel");

    const contract = network.getContract("emr");
    const result = await contract.submitTransaction(
      "addEMR",
      userEmail,
      adderEmail,
      emrID,
      type,
      content
    );
    console.log(`Transaction successful. Result is: ${result.toString()}`);

    await gateway.disconnect();

    return result.toString();
  } catch (error) {
    console.error(`patient_addEMR: Failed transaction: ${error}`);
    return error.toString();
  }
}

async function patient_getEMR(emrID, email) {
  try {
    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: "patient",
      discovery: { enabled: true, asLocalhost: true },
    });

    const network = await gateway.getNetwork("mychannel");

    const contract = network.getContract("emr");

    const result = await contract.submitTransaction("getEMR", emrID, email);
    console.log(`Transaction successful. Result is: ${result.toString()}`);

    await gateway.disconnect();

    return result.toString();
  } catch (error) {
    console.error(`patient_getEMR: Failed to evaluate transaction: ${error}`);
    return error.toString();
  }
}

async function patient_grantViewAccess(userEmail, viewerEmail, emrID) {
  try {
    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: "patient",
      discovery: { enabled: true, asLocalhost: true },
    });

    const network = await gateway.getNetwork("mychannel");

    const contract = network.getContract("emr");

    const result = await contract.submitTransaction(
      "grantViewAccess",
      userEmail,
      viewerEmail,
      emrID
    );

    console.log(`Transaction successful. Result is: ${result.toString()}`);

    await gateway.disconnect();

    return result.toString();
  } catch (error) {
    console.error(`patient_grantViewAccess: Failed transaction: ${error}`);
    return error.toString();
  }
}

async function patient_revokeViewAccess(userEmail, viewerEmail, emrID) {
  try {
    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: "patient",
      discovery: { enabled: true, asLocalhost: true },
    });

    const network = await gateway.getNetwork("mychannel");

    const contract = network.getContract("emr");

    const result = await contract.submitTransaction(
      "revokeViewAccess",
      userEmail,
      viewerEmail,
      emrID
    );
    console.error(`patient_addEMR: Failed transaction: ${error}`);

    await gateway.disconnect();

    return result.toString();
  } catch (error) {
    console.error(
      `patient_revokeViewAccess: Failed to evaluate transaction: ${error}`
    );
    return error.toString();
  }
}

async function patient_grantAddAccess(userEmail, viewerEmail) {
  try {
    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: "patient",
      discovery: { enabled: true, asLocalhost: true },
    });

    const network = await gateway.getNetwork("mychannel");

    const contract = network.getContract("emr");

    const result = await contract.submitTransaction(
      "grantAddAccess",
      userEmail,
      viewerEmail
    );
    console.log(`Transaction successful. Result is: ${result.toString()}`);

    await gateway.disconnect();

    return result.toString();
  } catch (error) {
    console.error(`patient_grantAddAccess: Failed transaction: ${error}`);
    return error.toString();
  }
}

async function patient_revokeAddAccess(userEmail, viewerEmail) {
  try {
    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: "patient",
      discovery: { enabled: true, asLocalhost: true },
    });

    const network = await gateway.getNetwork("mychannel");

    const contract = network.getContract("emr");
    const result = await contract.submitTransaction(
      "revokeAddAccess",
      userEmail,
      viewerEmail
    );
    console.log(`Transaction successful. Result is: ${result.toString()}`);

    await gateway.disconnect();

    return result.toString();
  } catch (error) {
    console.error(`patient_revokeAddAccess: Failed transaction: ${error}`);
    return error.toString();
  }
}

//Admin functions
async function admin_addEntityUser(name, email, type) {
  try {
    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: "admin1",
      discovery: { enabled: true, asLocalhost: true },
    });

    const network = await gateway.getNetwork("mychannel");

    const contract = network.getContract("emr");

    const result = await contract.submitTransaction(
      "addEntityUser",
      name,
      email,
      type
    );
    console.log(`Transaction successful. Result is: ${result.toString()}`);

    await gateway.disconnect();

    return result.toString();
  } catch (error) {
    console.error(`admin_addUser: Failed transaction: ${error}`);
    return error.toString();
  }
}

async function viewAllEMR(email) {
  try {
    // create a new gateway for connecting to our peer node.
    console.log("viewAllEMR: " + email);
    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: "patient",
      discovery: { enabled: true, asLocalhost: true },
    });

    // get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork("mychannel");

    // get the contract from the network.
    const contract = network.getContract("emr");

    // evaluate the specified transaction.
    const result = await contract.submitTransaction("viewAllEMR", email);
    console.log(
      `Transaction has been evaluated. Result is: ${result.toString()}`
    );

    await gateway.disconnect();
    console.log("viewAllEMR: " + typeof result);
    return result;
  } catch (error) {
    console.error(`viewAllEMR: Failed to evaluate transaction: ${error}`);
    return error.toString();
  }
}

async function viewAllUsersWithAddAccess(email) {
  try {
    // create a new gateway for connecting to our peer node.
    const gateway = new Gateway();

    await gateway.connect(ccp, {
      wallet,
      identity: "patient",
      discovery: { enabled: true, asLocalhost: true },
    });

    // get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork("mychannel");

    // get the contract from the network.
    const contract = network.getContract("emr");

    // evaluate the specified transaction.
    const result = await contract.submitTransaction(
      "viewAllUsersWithAddAccess",
      email
    );
    console.log(
      `Transaction has been evaluated. Result is: ${result.toString()}`
    );

    await gateway.disconnect();

    return result.toString();
  } catch (error) {
    console.error(
      `viewAllUsersWithAddAccess: Failed to evaluate transaction: ${error}`
    );
    return error.toString();
  }
}

// Get granted
async function getGrantedUserForEMR(emrID, email) {
  try {
    // create a new gateway for connecting to our peer node.
    const gateway = new Gateway();

    await gateway.connect(ccp, {
      wallet,
      identity: "patient",
      discovery: { enabled: true, asLocalhost: true },
    });

    // get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork("mychannel");

    // get the contract from the network.
    const contract = network.getContract("emr");

    console.log(`send transaction emrID` + emrID + " email" + email);

    // evaluate the specified transaction.
    const result = await contract.submitTransaction(
      "getGrantedUserForEMR",
      emrID,
      email
    );

    console.log(` Result is:: ` + result);
    console.log(
      `Transaction has been evaluated. Result is: ${result.toString()}`
    );

    await gateway.disconnect();

    return result.toString(); // change
  } catch (error) {
    console.error(
      `getGrantedUserForEMR: Failed to evaluate transaction: ${error}`
    );
    return error.toString();
  }
}

exports.initialize = initialize;

exports.doctor_addEMR = doctor_addEMR;
exports.doctor_getEMR = doctor_getEMR;

exports.patient_addEMR = patient_addEMR;
exports.patient_getEMR = patient_getEMR;
exports.patient_grantViewAccess = patient_grantViewAccess;
exports.patient_revokeViewAccess = patient_revokeViewAccess;
exports.patient_revokeAddAccess = patient_revokeAddAccess;
exports.patient_grantAddAccess = patient_grantAddAccess;
exports.viewAllEMR = viewAllEMR;
exports.viewAllUsersWithAddAccess = viewAllUsersWithAddAccess;
exports.getGrantedUserForEMR = getGrantedUserForEMR;

exports.admin_addEntityUser = admin_addEntityUser;
