let loadPromise: Promise<boolean> | null = null;

/**
 * Load Razorpay's Checkout script (window.Razorpay) exactly once, even if
 * called from multiple components. Resolves false if it fails to load
 * (e.g. no network) so callers can show a friendly error instead of
 * throwing on a missing global.
 */
export const loadRazorpayScript = (): Promise<boolean> => {
  if ((window as any).Razorpay) {
    return Promise.resolve(true);
  }

  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => {
      loadPromise = null;
      resolve(false);
    };
    document.body.appendChild(script);
  });

  return loadPromise;
};
