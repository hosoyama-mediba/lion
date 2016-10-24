var firebaseDatabase = firebase.database();
var reg;
var sub;
var isSubscribed = false;
var subscribeButton = document.querySelector('button');

if ('serviceWorker' in navigator) {
    console.log('Service Worker is supported');
    navigator.serviceWorker.register('/sw.js').then(function() {
        return navigator.serviceWorker.ready;
    }).then(function(serviceWorkerRegistration) {
        reg = serviceWorkerRegistration;
        subscribeButton.disabled = false;
        console.log('Service Worker is ready :^)', reg);
        reg.pushManager.getSubscription().then(function(pushSubscription) {
            console.log(pushSubscription);
            if (!pushSubscription) {
                return;
            }
            initPush(pushSubscription);
        });
    }).catch(function(error) {
        console.log('Service Worker Error :^(', error);
    });
}

subscribeButton.addEventListener('click', function() {
    if (isSubscribed) {
        unsubscribe();
    } else {
        subscribe();
    }
});

function string_to_buffer(src) {
    return (new Uint16Array([].map.call(src, function(c) {
        return c.charCodeAt(0)
    }))).buffer;
}

function initPush(pushSubscription) {
    sub = pushSubscription;
    console.log('Subscribed', sub);
    var subscription = {
        endpoint: sub.endpoint.replace(/android\.googleapis\.com\/gcm/, 'fcm.googleapis.com/fcm'),
        keys: {
            p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(sub.getKey('p256dh')))).replace(/\+/g, '-').replace(/\//g, '_'),
            auth: btoa(String.fromCharCode.apply(null, new Uint8Array(sub.getKey('auth')))).replace(/\+/g, '-').replace(/\//g, '_')
        }
    };
    save(subscription);
    subscribeButton.textContent = 'Unsubscribe';
    isSubscribed = true;
    subscribeButton.className = 'subscribed';
}

function subscribe() {
    firebaseDatabase.ref('/public_key/').once('value').then(function(snapshot) {
        var serverPublicKey = snapshot.val();
        console.log('serverPublicKey', serverPublicKey);
        reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: new TextEncoder("utf-8").encode(serverPublicKey).buffer
        }).then(function(pushSubscription) {
            initPush(pushSubscription);
            return sub.endpoint;
        });
    });
}

function unsubscribe() {
    remove(sub.endpoint);
    sub.unsubscribe().then(function(event) {
        subscribeButton.textContent = 'Subscribe';
        console.log('Unsubscribed!', event);
        isSubscribed = false;
    }).catch(function(error) {
        console.log('Error unsubscribing', error);
        subscribeButton.textContent = 'Subscribe';
    });
    subscribeButton.className = '';
}

function save(subscription) {
    var db = firebaseDatabase.ref('/subscription/' + replaceEndpoint(subscription.endpoint));
    db.set(subscription);
    console.log('save', db);
}

function remove(endpoint) {
    var db = firebaseDatabase.ref('/subscription/' + replaceEndpoint(sub.endpoint));
    db.remove();
    console.log('remove', db);
}

function replaceEndpoint(endpoint) {
    var tmp = endpoint.split('/');
    return tmp[tmp.length - 1];
}
