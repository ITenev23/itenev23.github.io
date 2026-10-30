import { motion, useScroll, useSpring } from "motion/react";

/** A thin glowing bar under the nav that fills as the page is read. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 160, damping: 32, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-16 z-40 h-[2px] origin-left print:hidden bg-gradient-to-r from-matrix via-[#00c43a] to-[#9cff57] shadow-[0_0_14px_var(--color-matrix)]"
      style={{ scaleX }}
    />
  );
}
