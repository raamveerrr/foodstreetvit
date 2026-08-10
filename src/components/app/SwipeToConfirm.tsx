import { useRef, useState } from "react";
import { motion, useMotionValue, useTransform } from "motion/react";
import { ChevronsRight, Check } from "lucide-react";

/**
 * Counter-staff gesture: the worker swipes the student's phone to confirm
 * pickup. Local UI state today; a redeem mutation later.
 */
export function SwipeToConfirm({ onConfirm }: { onConfirm: () => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [done, setDone] = useState(false);
  const [max, setMax] = useState(220);
  const opacity = useTransform(x, [0, max * 0.7], [1, 0]);

  return (
    <div
      ref={(el) => {
        trackRef.current = el;
        if (el) setMax(el.clientWidth - 60);
      }}
      className="relative h-[60px] w-full select-none overflow-hidden rounded-2xl bg-primary-soft"
    >
      <motion.span
        style={{ opacity }}
        className="pointer-events-none absolute inset-0 grid place-items-center text-sm font-semibold text-accent-foreground"
      >
        Slide to confirm pickup
      </motion.span>
      <motion.button
        drag={done ? false : "x"}
        dragConstraints={{ left: 0, right: max }}
        dragElastic={0.02}
        dragMomentum={false}
        style={{ x }}
        onDragEnd={() => {
          if (x.get() > max * 0.85) {
            setDone(true);
            x.set(max);
            onConfirm();
          } else {
            x.set(0);
          }
        }}
        aria-label="Slide to confirm pickup"
        className="absolute left-1 top-1 grid h-[52px] w-[52px] cursor-grab place-items-center rounded-xl bg-primary text-primary-foreground active:cursor-grabbing"
      >
        {done ? <Check size={20} /> : <ChevronsRight size={20} />}
      </motion.button>
    </div>
  );
}
