let snapPromise = null;

export function loadSnapScript(scriptUrl, clientKey) {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Snap hanya tersedia di browser"));
  }
  if (window.snap) return Promise.resolve(window.snap);
  if (!scriptUrl) {
    return Promise.reject(new Error("URL Snap tidak tersedia"));
  }
  if (snapPromise) return snapPromise;

  snapPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = scriptUrl;
    script.async = true;
    if (clientKey) script.setAttribute("data-client-key", clientKey);
    script.onload = () => {
      if (window.snap) resolve(window.snap);
      else reject(new Error("Snap gagal dimuat"));
    };
    script.onerror = () => reject(new Error("Snap gagal dimuat"));
    document.body.appendChild(script);
  });

  return snapPromise;
}
