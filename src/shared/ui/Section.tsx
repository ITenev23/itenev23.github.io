import { motion } from "motion/react";
import type { ReactNode } from "react";

type Props = {
  id: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
};

/** Consistent section rhythm + reveal-on-scroll for every page block. */
export function Section({ id, eyebrow, title, children }: Props) {
  return (
    <section id={id} className="mx-auto max-w-6xl scroll-mt-24 px-6 py-28">
      <motion.header
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-12"
      >
        <p className="font-mono text-sm text-matrix">{eyebrow}</p>
        <h2 className="mt-2 text-4xl font-extrabold tracking-tight md:text-5xl">{title}</h2>
      </motion.header>
      {children}
    </section>
  );
}
