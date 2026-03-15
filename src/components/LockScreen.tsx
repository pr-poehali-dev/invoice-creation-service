import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const PASS_KEY = "sweep_unlocked";
const CORRECT  = "1234"; // пароль — можно изменить здесь

interface Props {
  onUnlock: () => void;
}

export default function LockScreen({ onUnlock }: Props) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleDigit = (d: string) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    setError(false);
    if (next.length === 4) {
      setTimeout(() => check(next), 120);
    }
  };

  const check = (val: string) => {
    if (val === CORRECT) {
      sessionStorage.setItem(PASS_KEY, "1");
      onUnlock();
    } else {
      setShake(true);
      setError(true);
      setPin("");
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleDel = () => setPin(p => p.slice(0, -1));

  const dots = Array.from({ length: 4 }, (_, i) => i < pin.length);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0f1117]"
         style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>

      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <img
          src="https://cdn.poehali.dev/projects/68306774-d4e1-4aad-b342-c18426adb743/bucket/b3e1fdda-d623-45d7-8576-66d557372c36.png"
          alt="Бухгалтерия"
          className="h-10 object-contain brightness-0 invert"
        />
        <p className="text-white/50 text-sm font-medium">Введите PIN-код</p>
      </div>

      {/* Dots */}
      <div className={`flex gap-4 mb-10 ${shake ? "animate-[wiggle_0.4s_ease]" : ""}`}>
        {dots.map((filled, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
              filled ? "bg-blue-500 border-blue-500 scale-110" : "border-white/30"
            } ${error ? "border-red-500 bg-red-500" : ""}`}
          />
        ))}
      </div>

      {error && (
        <p className="text-red-400 text-sm mb-6 -mt-4">Неверный PIN</p>
      )}

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-3 w-64">
        {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((d, i) => {
          if (d === "") return <div key={i} />;
          const isDel = d === "⌫";
          return (
            <button
              key={i}
              onClick={() => isDel ? handleDel() : handleDigit(d)}
              className={`h-16 rounded-2xl text-xl font-medium transition-all duration-100 active:scale-95
                ${isDel
                  ? "text-white/50 hover:text-white hover:bg-white/10"
                  : "bg-white/10 text-white hover:bg-white/20 active:bg-blue-600"
                }`}
            >
              {d}
            </button>
          );
        })}
      </div>

      <style>{`
        @keyframes wiggle {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-8px)}
          40%{transform:translateX(8px)}
          60%{transform:translateX(-6px)}
          80%{transform:translateX(6px)}
        }
      `}</style>
    </div>
  );
}

export function useAuth() {
  const [unlocked, setUnlocked] = useState(() =>
    sessionStorage.getItem(PASS_KEY) === "1"
  );
  return { unlocked, unlock: () => setUnlocked(true) };
}
