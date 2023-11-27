"use strict";

const express = require("express");
const cors = require("cors");
const app = express();
const PORT_DOCTOR = 3002;
const PORT_PATIENT = 3000;
const ADMIN_PORT = 3001;

const admin = require("./enrollAdmin.js");
const user = require("./registerUser.js");
const query = require("./query.js");

async function init() {
  app.use(cors());
  app.use(express.json());

  await connect();

  app.get("/", (req, res) => res.send("Hello World!"));

  // Doctor Routes
  app.post("/doctor/addEMR", (req, res) => doctor_addEMR(req, res));
  app.post("/doctor/getEMR", (req, res) => doctor_getEMR(req, res));

  // Patient Routes
  app.post("/patient/grantViewAccess", (req, res) =>
    patient_grantViewAccess(req, res)
  );
  app.post("/patient/revokeViewAccess", (req, res) =>
    patient_revokeViewAccess(req, res)
  );
  app.post("/patient/grantAddAccess", (req, res) =>
    patient_grantAddAccess(req, res)
  );
  app.post("/patient/revokeAddAccess", (req, res) =>
    patient_revokeAddAccess(req, res)
  );
  app.post("/patient/getEMR", (req, res) => patient_getEMR(req, res));
  app.post("/patient/viewAllEMR", (req, res) => viewAllEMR(req, res));

  app.post("/patient/viewAllUsersWithAddAccess", (req, res) =>
    viewAllUsersWithAddAccess(req, res)
  );

  app.post("/patient/getGrantedUserForEMR", (req, res) =>
    getGrantedUserForEMR(req, res)
  );

  app.post("/admin/addEntityUser", (req, res) => admin_addEntityUser(req, res));

  app.listen(PORT_DOCTOR, () =>
    console.log(`Doctor App listening on port ${PORT_DOCTOR}`)
  );
  app.listen(PORT_PATIENT, () =>
    console.log(`Patient App listening on port ${PORT_PATIENT}`)
  );
  app.listen(ADMIN_PORT, () =>
    console.log(`Admin App listening on port ${ADMIN_PORT}`)
  );
}

async function connect() {
  const userTypes = ["admin1", "doctor", "patient"];
  await admin.enrollAdmin("admin");

  // Comment out the following line to prevent registering users after first run
  for (const userType of userTypes) {
    await user.registerUser(userType);
  }
}

// Doctor Routes
async function doctor_addEMR(req, res) {
  try {
    await query.initialize("doctor");
    const result = await query.doctor_addEMR(
      req.body.userEmail,
      req.body.adderEmail,
      req.body.emrID,
      req.body.type,
      req.body.content
    );
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send(error);
    console.error(`error: doctor_addEMR: ${error}`);
  }
}

async function doctor_getEMR(req, res) {
  try {
    await query.initialize("doctor");
    const result = await query.doctor_getEMR(
      req.body.emrID,
      req.body.userEmail
    );
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send(error.toString());
    console.error(`error: doctor_getEMR: ${error}`);
  }
}

// Patient Routes
async function patient_grantViewAccess(req, res) {
  try {
    await query.initialize("patient");
    const result = await query.patient_grantViewAccess(
      req.body.userEmail,
      req.body.viewerEmail,
      req.body.emrID
    );
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send(error);
    console.error(`error: patient_grantViewAccess: ${error}`);
  }
}

async function patient_revokeViewAccess(req, res) {
  try {
    await query.initialize("patient");
    const result = await query.patient_revokeViewAccess(
      req.body.userEmail,
      req.body.viewerEmail,
      req.body.emrID
    );
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send(error);
    console.error(`erroe: patient_revokeViewAccess: ${error}`);
  }
}

async function patient_grantAddAccess(req, res) {
  try {
    await query.initialize("patient");
    const result = await query.patient_grantAddAccess(
      req.body.userEmail,
      req.body.adderEmail
    );
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send(error);
    console.error(`error: patient_grantAddAccess: ${error}`);
  }
}

async function patient_revokeAddAccess(req, res) {
  try {
    await query.initialize("patient");
    const result = await query.patient_revokeAddAccess(
      req.body.userEmail,
      req.body.adderEmail
    );
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send(error);
    console.error(`error: patient_revokeAddAccess: ${error}`);
  }
}

async function patient_getEMR(req, res) {
  try {
    await query.initialize("patient");
    const result = await query.patient_getEMR(
      req.body.emrID,
      req.body.userEmail
    );
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send("Nothing is tough");
    console.error(`error: patient_getEMR: ${error}`);
  }
}

async function viewAllUsersWithAddAccess(req, res) {
  try {
    await query.initialize("patient");
    const result = await query.viewAllUsersWithAddAccess(req.body.userEmail);
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send("Internal server error");
    console.error(`error on getEMRRoute: ${error}`);
  }
}

async function getGrantedUserForEMR(req, res) {
  try {
    await query.initialize("patient");
    const result = await query.getGrantedUserForEMR(
      req.body.emrID,
      req.body.userEmail
    );
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send("Internal server error");
    console.error(`error on getEMRRoute: ${error}`);
  }
}

async function viewAllEMR(req, res) {
  // emrID: emrID,
  // userEmail: userEmail
  try {
    console.log(req.body.userEmail);
    await query.initialize("patient");
    const result = await query.viewAllEMR(req.body.userEmail);
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send("Internal server error");
    console.error(`error on getEMRRoute: ${error}`);
  }
}
// Admin Routes
async function admin_addEntityUser(req, res) {
  try {
    await query.initialize();
    const result = await query.admin_addEntityUser(
      req.body.name,
      req.body.email,
      req.body.type
    );
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send(error);
    console.error(`error: admin_addUser: ${error}`);
  }
}

init();
