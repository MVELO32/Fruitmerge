import { useEffect, useState } from "react";

// Only show the rotation warning on touch/mobile devices.
// Desktop users can play in any orientation.
const isMobile = () =>
  "ontouchstart" in window ||
  navigator.maxTouchPoints > 0 ||
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

export function RotationGuard({ children, engineRef }) {
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    if (!isMobile()) return; // desktop — never block

    const check = () => {
      const landscape = window.innerWidth > window.innerHeight;
      setIsLandscape(landscape);
      const engine = engineRef?.current;
      if (engine) engine.timing.timeScale = landscape ? 0 : 1;
    };

    check();
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);
    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
    };
  }, [engineRef]);

  return (
    <>
      {children}
      {isLandscape && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "#0a0a0d",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: 20, fontFamily: "system-ui, sans-serif",
          color: "#fff", textAlign: "center", padding: 40,
        }}>
          <div style={{ fontSize: 64, animation: "tilt 1.5s ease-in-out infinite alternate" }}>📱</div>
          <p style={{ fontSize: 22, fontWeight: 700 }}>Rotate back to portrait</p>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", maxWidth: 280, lineHeight: 1.6 }}>
            Your game is paused and waiting — no progress lost.
          </p>
          <style>{`@keyframes tilt { from{transform:rotate(-20deg)} to{transform:rotate(20deg)} }`}</style>
        </div>
      )}
    </>
  );
}
