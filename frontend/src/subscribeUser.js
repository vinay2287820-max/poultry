import { API_PATHS, BASE_URL } from "./utils/apiPaths";

export const subscribeUser = async (
  employeeId,
  role,
  browserId,
  PUBLIC_VAPID_KEY
) => {
  const register = await navigator.serviceWorker.register("/service-worker.js");

  // Check existing subscription
  let subscription = await register.pushManager.getSubscription();

  if (!subscription) {
    // If not exists, create new one
    const urlBase64ToUint8Array = (base64String) => {
      const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
      const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");
      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    };

    subscription = await register.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
    });
  }

  // Save subscription in backend
  await fetch(
    BASE_URL + API_PATHS.SUBSCRIPTION.SAVE,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        employeeId,
        role,
        subscription,
        browserId,
      }),
    }
  );
};
