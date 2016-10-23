'use strict';

const webpush = require('web-push');
const firebase = require('firebase');

firebase.initializeApp({
    serviceAccount: "./serviceAccountCredentials.json",
    databaseURL: "https://lion-44fae.firebaseio.com"
});

firebase.database().ref('/push/').once("value", function(snapshot) {
    const push = snapshot.val();
    const payload = JSON.stringify(push.payload);
    const option = {
        vapidDetails: {
            subject: 'mailto:hosoyama@mediba.jp',
            publicKey: push.key.public,
            privateKey: push.key.private
        },
        TTL: 0
    };

    const promises = [];
    for (let key of Object.keys(push.endpoint)) {
        promises.push(webpush.sendNotification(push.endpoint[key], payload, option).then(function (res) {
        }).catch(function(error){
            console.log(error);
        }));
        Promise.all(promises).then(function() {
            process.exit();
        });
    }
});
