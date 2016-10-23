console.log('Started', self);

self.addEventListener('install', function(event) {
    self.skipWaiting();
    console.log('Installed', event);
});

self.addEventListener('activate', function(event) {
    console.log('Activated', event);
});

self.addEventListener('push', function(event) {
    console.log('Push message received', event);
    var notification = event.data.json();
    var title = notification.title;
    delete notification.title;
    // notification.tag = 'notification';

    event.waitUntil(self.registration.showNotification(title, notification));
});

self.addEventListener('notificationclick', function(event) {
    console.log('Click notification message', event);
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(function(evt) {
            var p = location.pathname.split('/');
            p.pop();
            p = location.protocol + '//' + location.hostname + (location.port ? ':'+location.port : '') + p.join('/') + '/';
            for (var i = 0 ; i < evt.length ; i++) {
                var c = evt[i];
                if (((c.url == p) || (c.url == p + 'index.html')) && ('focus' in c)) {
                    return c.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('./');
            }
        })
    );
});
