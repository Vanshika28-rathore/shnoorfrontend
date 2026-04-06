
// Service Worker for Web Push Notifications

self.addEventListener("push", function (event) {
    if (event.data) {
        const data = event.data.json();
        console.log("Push received:", data);

        const title = data.title || "LMS Notification";
        const options = {
            body: data.message || "You have a new update!",
            icon: data.icon || "/just_logo.svg",
            badge: "/just_logo.svg", // Small monochrome icon for Android/Status bar
            data: {
                link: data.link || "/student/dashboard",
                id: data.id
            },
            tag: data.id // distinct tag
        };

        event.waitUntil(self.registration.showNotification(title, options));
    } else {
        console.log("Push event but no data");
    }
});

self.addEventListener("notificationclick", function (event) {
    console.log("Notification clicked", event.notification);
    event.notification.close();

    const link = event.notification.data.link || "/";

    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
            // If a window is already open, focus it
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url.includes(link) && "focus" in client) {
                    return client.focus();
                }
            }
            // Otherwise open a new window
            if (clients.openWindow) {
                return clients.openWindow(link);
            }
        })
    );
});
