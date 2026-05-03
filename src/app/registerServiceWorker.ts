export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', () => {
    void navigator.serviceWorker.register(
      `${import.meta.env.BASE_URL}service-worker.js`,
      {
        scope: import.meta.env.BASE_URL,
      },
    );
  });
}
