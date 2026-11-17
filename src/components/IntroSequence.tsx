import { useEffect, useState } from "react";

export function IntroSequence({ onComplete }: { onComplete: () => void }) {
  const [hidden, setHidden] = useState(() => {
    // Check if it already played in this browser session
    return sessionStorage.getItem("portfolio_intro_played") === "true";
  });
  const [stage, setStage] = useState<0 | 1 | 2 | 3>(0);

  useEffect(() => {
    if (hidden) {
      onComplete();
      return;
    }

    // Mark as played so it never triggers again during internal navigation or hovers
    sessionStorage.setItem("portfolio_intro_played", "true");

    const t1 = setTimeout(() => setStage(1), 350);
    const t2 = setTimeout(() => setStage(2), 700);
    const t3 = setTimeout(() => setStage(3), 1050);
    const t4 = setTimeout(() => {
      setHidden(true);
      onComplete();
    }, 1450);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [hidden, onComplete]);

  if (hidden) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      {/* Grey Slide */}
      <div
        className="absolute inset-0 bg-[#808080] transition-transform duration-[700ms] ease-[cubic-bezier(0.77,0,0.175,1)]"
        style={{
          transform: stage >= 3 ? "translateY(-100%)" : "translateY(0%)",
        }}
      />
      {/* Black Slide */}
      <div
        className="absolute inset-0 bg-[#0f0f0f] transition-transform duration-[700ms] ease-[cubic-bezier(0.77,0,0.175,1)]"
        style={{
          transform: stage >= 2 ? "translateY(-100%)" : "translateY(0%)",
        }}
      />
      {/* White Slide */}
      <div
        className="absolute inset-0 bg-[#ffffff] transition-transform duration-[700ms] ease-[cubic-bezier(0.77,0,0.175,1)]"
        style={{
          transform: stage >= 1 ? "translateY(-100%)" : "translateY(0%)",
        }}
      />
    </div>
  );
}