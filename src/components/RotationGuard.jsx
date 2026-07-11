import { useEffect, useState } from "react";

export function RotationGuard({ children }) {
  const [isLandscape, setIsLandscape] = useState(
    () => window.innerWidth > window.innerHeight
  );

  useEffect(() => {
    const check = () => setIsLandscape(window.innerWidth > window.innerHeight);
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);
    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
    };
  }, []);

  if (isLandscape) {
    return (
      <div style={{
        position: "fixed", inset: 0,
        background: "#0a0a0d",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 16, zIndex: 9999,
        fontFamily: "system-ui, sans-serif",
        color: "#fff", textAlign: "center", padding: 32,
      }}>
        <span style={{ fontSize: 56 }}>📱</span>
        <p style={{ fontSize: 20, fontWeight: 600 }}>Rotate your phone</p>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", maxWidth: 260 }}>
          FruitMerge is portrait only. Please rotate your device back to continue.
        </p>
      </div>
    );
  }

  return children;
}
