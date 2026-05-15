"use client";

import { useState, useRef } from "react";
import { Info } from "lucide-react";

interface InfoTooltipProps {
  content: string;
}

export function InfoTooltip({ content }: InfoTooltipProps) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLSpanElement>(null);

  function updatePosition(e: React.MouseEvent) {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) {
      setPos({ x: rect.left + rect.width / 2, y: rect.top });
    }
  }

  return (
    <>
      <span
        ref={ref}
        className="inline-flex cursor-help"
        onMouseEnter={(e) => {
          updatePosition(e);
          setShow(true);
        }}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
      >
        <Info className="h-3 w-3 text-zinc-600 hover:text-zinc-400 transition-colors" />
      </span>
      {show && (
        <div
          className="fixed z-50 w-56 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 shadow-xl text-left pointer-events-none"
          style={{
            left: pos.x,
            top: pos.y - 8,
            transform: "translate(-50%, -100%)",
          }}
        >
          <p className="text-[11px] text-zinc-300 leading-relaxed">{content}</p>
        </div>
      )}
    </>
  );
}
