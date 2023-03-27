import * as admin from "firebase-admin";
import {getAuth} from "firebase-admin/auth";
import * as functions from "firebase-functions";
import {institutionRegistrationSchema, volunteerRegistrationSchema} from "./schemas";
import Joi = require("joi");

const serviceAccount = require("../serviceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

exports.helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

exports.registerVolunteer = functions.https.onCall(async (data) => {
  try {
    const schema = Joi.object({
      ...volunteerRegistrationSchema,
      password: Joi.string().required(),
    });

    const {error, ...validated} = schema.validate(data);

    if (error) {
      return {
        error: error.details[0].message,
      };
    }

    const {password, ...volunteer} = validated.value;

    // // create the user
    const user = await getAuth().createUser({
      email: volunteer.email,
      password: password,
      displayName: volunteer.name,
      // TODO: sanitize phone number to comply with E.164
    });

    functions.logger.info(`user(volunteer) created: ${user.uid}`, {structuredData: true});

    // // set custom claims on the user
    await admin.auth().setCustomUserClaims(user.uid, {
      role: "volunteer",
    });

    // store additional data in the database
    await admin.firestore().collection("volunteers").doc(user.uid).set(volunteer);

    const token = await admin.auth().createCustomToken(user.uid);

    return {
      message: "Volunteer created successfully",
      uuid: user.uid,
      email: user.email,
      role: "volunteer",
      token,
      error: null,
    };
  } catch (error: Error | any) {
    return {
      error: error?.message || error,
    };
  }
});

exports.registerInstitution = functions.https.onCall(async (data) => {
  try {
    const schema = Joi.object({
      ...institutionRegistrationSchema,
      password: Joi.string().required(),
    });

    const {error, ...validated} = schema.validate(data);

    if (error) {
      return {
        error: error.details[0].message,
      };
    }

    const {password, ...institution} = validated.value;

    // create the user
    const user = await getAuth().createUser({
      email: institution.email,
      password: password,
      displayName: institution.name,
      // TODO: sanitize phone number to comply with E.164
    });

    functions.logger.info(`user(institution) created: ${user.uid}`, {structuredData: true});

    // set custom claims on the user
    await admin.auth().setCustomUserClaims(user.uid, {
      role: "institution",
    });

    // store additional data in the database
    await admin.firestore().collection("institutions").doc(user.uid).set(institution);

    const token = await admin.auth().createCustomToken(user.uid);

    return {
      message: "Institution created successfully",
      uuid: user.uid,
      email: user.email,
      role: "institution",
      token,
      error: null,
    };
  } catch (error: Error | any) {
    return {
      error: error?.message || error,
    };
  }
});

exports.registerVolunteerWithCurrentUser = functions.https.onCall(async (data, context) => {
  try {
    const schema = Joi.object(volunteerRegistrationSchema);

    const {error, ...validated} = schema.validate(data);

    if (error) {
      return {
        error: error.details[0].message,
      };
    }

    if (context.auth === null) {
      return {
        error: "User is not authenticated",
      };
    }

    const user = await admin.auth().getUser(context.auth!.uid);

    await admin.auth().setCustomUserClaims(user.uid, {
      role: "volunteer",
    });

    // store additional data in the database
    await admin.firestore().collection("volunteers").doc(user.uid).set(validated.value);

    return {
      message: "Volunteer created successfully",
      uuid: user.uid,
      email: user.email,
      role: "volunteer",
      error: null,
    };
  } catch (error: Error | any) {
    return {
      error: error?.message || error,
    };
  }
});

exports.registerInstitutionWithCurrentUser = functions.https.onCall(async (data, context) => {
  try {
    const schema = Joi.object(institutionRegistrationSchema);

    const {error, ...validated} = schema.validate(data);

    if (error) {
      return {
        error: error.details[0].message,
      };
    }

    if (context.auth === null) {
      return {
        error: "User is not authenticated",
      };
    }

    const user = await admin.auth().getUser(context.auth!.uid);

    await admin.auth().setCustomUserClaims(user.uid, {
      role: "institution",
    });

    // store additional data in the database
    await admin.firestore().collection("institutions").doc(user.uid).set(validated.value);

    return {
      message: "Institution created successfully",
      uuid: user.uid,
      email: user.email,
      role: "institution",
      error: null,
    };
  } catch (error: Error | any) {
    return {
      error: error?.message || error,
    };
  }
});


exports.userDetails = functions.https.onCall(async (data, context) => {
  // check if the user is authenticated
  if (!context.auth) {
    return {
      error: "User is not authenticated",
    };
  }

  // get the user details
  const user = await admin.auth().getUser(context.auth.uid);

  // get the user role
  const role = user.customClaims?.role || "volunteer";

  // get the user details from the database
  const userDetails = await admin
    .firestore()
    .collection(role + "s")
    .doc(context.auth.uid)
    .get();

  return {
    ...user,
    ...userDetails.data(),
  };
});
