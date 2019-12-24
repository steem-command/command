/* eslint-disable no-console */

import { register } from "register-service-worker";

if (process.env.NODE_ENV === "production") {
  register(`${process.env.BASE_URL}service-worker.js`, {
    ready() {
      console.log(
        "App is being served from cache by a service worker.\n" +
          "For more details, visit https://goo.gl/AFskqB"
      );
    },
    registered() {
      console.log("Service worker has been registered.");
    },
    cached() {
      console.log("Content has been cached for offline use.");
    },
    updatefound() {
      console.log("New content is downloading.");
    },
    updated(registration) {
      console.log("New content is available; please refresh.");

      var snackbar = document.createElement("div");
      document.body.appendChild(snackbar);

      snackbar.innerHTML = `
         <div
          class="sw-snackbar"
          style="background:#323232; color:#fff; width: 100%; max-width: 344px; height:48px; padding: 1rem; border-radius:2px; font-size: 1em; position:fixed; right:1rem; bottom: 1rem; display:flex; align-items:center; justify-content:space-between;"
        >
          <span>New content is available.</span>
          <button
            style="background:none; color:#2ecc71; font-size: 0.875em; letter-spacing:.08929em; border:none; outline:none; text-transform: uppercase; cursor: pointer;"
          >Reload</button>
        </div>`;

      snackbar.addEventListener("click", e => {
        if (e.target.nodeName === "BUTTON") {
          snackbar.style.display = "none";
          setTimeout(function() {
            window.location.reload();
          }, 200);
        }
      });
    },
    offline() {
      console.log(
        "No internet connection found. App is running in offline mode."
      );
    },
    error(error) {
      console.error("Error during service worker registration:", error);
    }
  });

  let refreshing;
  navigator.serviceWorker.addEventListener("controllerchange", e => {
    if (refreshing) return;
    window.location.reload();
    refreshing = true;
  });
}
