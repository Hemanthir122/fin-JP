import { useEffect } from "react";

function SocialBar() {
  useEffect(() => {
    const numAds = 3;

    // Remove old container if exists (prevent duplicates)
    const oldContainer = document.getElementById("ads-wrapper");
    if (oldContainer) oldContainer.remove();

    // Create main wrapper
    const container = document.createElement("div");
    container.id = "ads-wrapper";

    Object.assign(container.style, {
      position: "fixed",
      bottom: "0",
      left: "0",
      width: "100%",
      display: "flex",
      flexDirection: "column-reverse", // stack from bottom
      alignItems: "center",
      gap: "10px",
      zIndex: "9999",
      pointerEvents: "none", // don't block UI
    });

    document.body.appendChild(container);

    // Load ads one by one
    for (let i = 0; i < numAds; i++) {
      const adBox = document.createElement("div");

      Object.assign(adBox.style, {
        width: "100%",
        display: "flex",
        justifyContent: "center",
        pointerEvents: "auto",
      });

      container.appendChild(adBox);

      setTimeout(() => {
        const script = document.createElement("script");
        script.src =
          "https://breachuptown.com/53/e5/58/53e55836ee891aa30b1843270191bee1.js";
        script.async = true;

        adBox.appendChild(script);
      }, i * 1500); // delay to avoid conflicts
    }

    return () => {
      const container = document.getElementById("ads-wrapper");
      if (container) container.remove();
    };
  }, []);

  return null;
}

export default SocialBar;