'use strict';

const webpush = require('web-push');
const firebase = require('firebase');

firebase.initializeApp({
    serviceAccount: "./serviceAccountCredentials.json",
    databaseURL: "https://lion-44fae.firebaseio.com"
});

const database = firebase.database();

const setting = {};
const refs = [];

refs.push(database.ref('/private_key/').once('value', (snapshot) => {
    setting.privateKey = snapshot.val();
}));

refs.push(database.ref('/public_key/').once('value', (snapshot) => {
    setting.publicKey = snapshot.val();
}));

refs.push(database.ref('/payload/').once('value', (snapshot) => {
    setting.payload = snapshot.val();
}));

refs.push(database.ref('/subscription/').once('value', (snapshot) => {
    setting.subscription = snapshot.val();
}));

refs.push(database.ref('/ttl/').once('value', (snapshot) => {
    setting.ttl = snapshot.val();
}));

Promise.all(refs).then(() => {
    const payload = JSON.stringify(setting.payload);
    const option = {
        vapidDetails: {
            subject: 'mailto:hosoyama@mediba.jp',
            publicKey: setting.publicKey,
            privateKey: setting.privateKey
        },
        TTL: setting.ttl
    };

    const sends = [];
    for (let key of Object.keys(setting.subscription)) {
        sends.push(webpush.sendNotification(setting.subscription[key], payload, option).then((res) => {
            // console.log(res);
        }).catch(function(error){
            console.log(error);
        }));

        Promise.all(sends).then(function() {
            process.exit();
        });
    }
});
