// @ts-nocheck
import { useEffect, useState } from "react";
import { useMotionValue, animate } from "framer-motion";

export default function AnimatedStat({ value, label, suffix = "" }) {
  const motionValue = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 1.8,
      ease: "easeOut",
      onUpdate: (latest) => {
        setDisplayValue(Math.round(latest));
      },
    });

    return () => controls.stop();
  }, [value, motionValue]);

  return (
    <div className="text-center">
      <div className="flex items-baseline justify-center gap-1">
        <span className="text-3xl font-extrabold text-primary">
          {displayValue}
        </span>
        {suffix && (
          <span className="text-3xl font-extrabold text-primary">
            {suffix}
          </span>
        )}
      </div>

      <p className="text-sm text-accent dark:text-white/60 mt-1">
        {label}
      </p>
    </div>
  );
}