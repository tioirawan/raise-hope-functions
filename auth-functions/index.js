const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
});


exports.registerVolunteer = functions.https.onCall(async (volunteer, _) => {
  // validate the volunteer data
  // volunteer should have:
  // - full name
  // - email
  // - phone number
  // - address
  // - availability (array of ints)
  // - prefered time (array of name of time [morning, afternoon, etc])
  // - interests (array of strings)
  if (!volunteer.name || !volunteer.email || !volunteer.phone || !volunteer.address || !volunteer.availability || !volunteer.preferedTime || !volunteer.interests) {
    return {
      error: "Invalid volunteer data",
    };
  }

  // create the user
  const user = await admin.auth().createUser({
    email: volunteer.email,
    password: volunteer.password,
    displayName: volunteer.name
  })

  // set custom claims on the user
  await admin.auth().setCustomUserClaims(user.uid, {
    role: 'volunteer'
  })

  // add the user to the databases
  await admin.firestore().collection('volunteers').doc(user.uid).set(volunteer)

  // generate custom token
  const token = await admin.auth().createCustomToken(user.uid)

  // return the token


  return {
    message: 'Volunteer created successfully',
    uuid: user.uid,
    email: user.email,
    token,
    error: null
  }
});

