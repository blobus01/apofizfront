importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js");
importScripts(
  "https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyAm0F7vk26fsSPh2gNCxrWxo3IiD2ptSqI",
  authDomain: "qrcode-c45c7.firebaseapp.com",
  databaseURL: "https://qrcode-c45c7.firebaseio.com",
  projectId: "qrcode-c45c7",
  storageBucket: "qrcode-c45c7.appspot.com",
  messagingSenderId: "802231326985",
  appId: "1:802231326985:web:ac44c3167598dc6a765bd8",
  measurementId: "G-3S5JN9CB81",
});

const messaging = firebase.messaging();

const swScriptUrl = new URL(self.location);
const locale = swScriptUrl.searchParams.get("locale") ?? "en";
const notificationsPageUrl = `${swScriptUrl.origin}/notifications/`;

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("notificationclick", function (event) {
  const chatId = event.notification.data && event.notification.data.chat_id;
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then(function (clientList) {
        if (chatId) {
          const chatUrl = `${swScriptUrl.origin}/messenger/`;
          // for (let i = 0; i < clientList.length; i++) {
          //   let client = clientList[i];
          //   if (
          //     client.url &&
          //     client.url.includes(`/messenger/chat/${chatId}`)
          //   ) {
          //     client.focus();
          //     return;
          //   }
          // }
          return clients.openWindow(chatUrl);
        }
        if (notificationsPageUrl) {
          let client = null;

          for (let i = 0; i < clientList.length; i++) {
            let item = clientList[i];

            if (item.url) {
              client = item;
              break;
            }
          }

          if (client && "navigate" in client) {
            client.focus();
            event.notification.close();
            return client.navigate(notificationsPageUrl);
          } else {
            event.notification.close();
            // if client doesn't have navigate function, try to open a new browser window
            return clients.openWindow(notificationsPageUrl);
          }
        }
      })
  );
});

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );

  const data = payload?.data;
  if (!data) return;

  // Обработка уведомлений чата
  if (data.chat_id) {
    const notificationTitle = payload.notification?.title || "Новое сообщение";
    const notificationOptions = {
      body: payload.notification?.body || data.text || "",
      icon:
        data.icon ||
        payload.notification?.image ||
        "/android-chrome-192x192.png",
      badge: "/android-chrome-512x512.png",
      data: {
        chat_id: data.chat_id,
        message_id: data.message_id,
      },
    };
    // self.registration.showNotification(notificationTitle, notificationOptions);
  } else {
    let notificationTitle = data.title;
    const notificationOptions = {
      body: data.body,
      icon: data.icon,
      badge: "/android-chrome-512x512.png",
      sound: data.sound,
    };

    const type = data.type;
    const extraData = data.extra_data ? JSON.parse(data.extra_data) : null;

    switch (type) {
      case "organization_followed":
        notificationTitle = extraData.org_title;
        notificationOptions.body =
          extraData[
            `bg_description_client${locale === "ru" ? "_" + locale : ""}`
          ];
        notificationOptions.icon = JSON.parse(data.image)?.[0];
        break;
      case "followed_to_organization":
        notificationTitle = extraData.sender?.full_name;
        notificationOptions.body =
          extraData[`bg_description${locale === "ru" ? "_" + locale : ""}`];
        notificationOptions.icon = extraData.sender?.avatar?.small;
        break;
      default:
        break;
    }

    self.registration.showNotification(notificationTitle, notificationOptions);
  }
});
