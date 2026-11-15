import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

function useTime() {
  const [t, setT] = useState<string[] | null>(null);
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setT([String(d.getHours()).padStart(2, "0"), String(d.getMinutes()).padStart(2, "0")]);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

export function Header() {
  const t = useTime();
  const [contactOpen, setContactOpen] = useState(false);
  const contactRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (contactRef.current && !contactRef.current.contains(e.target as Node)) {
        setContactOpen(false);
      }
    };
    if (contactOpen) {
      window.addEventListener("pointerdown", handleClickOutside);
    }
    return () => window.removeEventListener("pointerdown", handleClickOutside);
  }, [contactOpen]);

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-50 h-1 bg-brand" />
      <header className="grid-4 fixed inset-x-0 top-1 z-40 items-start pt-4 ui-text">
        <Link to="/" className="block w-max">
          Houida
          <br />
          Tamer
        </Link>
        <div className="hidden md:block" />
        <nav className="relative justify-self-end md:justify-self-start" ref={contactRef}>
          <button
            onClick={() => setContactOpen((prev) => !prev)}
            className="block cursor-pointer uppercase transition-opacity hover:opacity-60"
          >
            Contact
          </button>

          {contactOpen && (
            <div className="absolute right-0 md:left-0 md:right-auto top-full mt-3 w-max rounded bg-background/95 p-3 shadow-lg backdrop-blur border border-foreground/10 flex flex-col gap-2 z-50">
              <a
                href="mailto:tamerhouida@gmail.com"
                className="block hover:opacity-60 transition-opacity text-xs md:text-sm normal-case"
              >
                tamerhouida@gmail.com
              </a>
              <a
                href="tel:+33781599959"
                className="block hover:opacity-60 transition-opacity text-xs md:text-sm normal-case"
              >
                +33 7 81 59 99 59
              </a>
            </div>
          )}
        </nav>
        <div className="hidden md:flex justify-between">
          <div>
            Local time
            <br />
            {t ? (
              <span>
                {t[0]} <span className="blink">:</span> {t[1]}
              </span>
            ) : (
              <span>&nbsp;</span>
            )}
          </div>
        </div>
      </header>
    </>
  );
}