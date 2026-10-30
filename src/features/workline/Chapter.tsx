import { clsx } from "clsx";
import type { ReactNode } from "react";

type Props = {
  id: string;
  eyebrow?: ReactNode;
  title?: string;
  children: ReactNode;
};

/**
 * One stop on the work line. Its node sits on the line level with the first line
 * of the chapter (the eyebrow, or the title when there is none) and lights when
 * the line's head reaches it; --node-top keeps the two aligned.
 */
export function Chapter({ id, eyebrow, title, children }: Props) {
  return (
    <section
      id={id}
      className={clsx(
        "chapter relative scroll-mt-20 pt-14 pb-4 pl-8 md:pt-20 md:pb-6 md:pl-14",
        eyebrow
          ? "[--node-top:4.1rem] md:[--node-top:5.6rem]"
          : "[--node-top:4.6rem] md:[--node-top:6.5rem]",
      )}
    >
      <span className="chapter-node" aria-hidden />
      {eyebrow && <p className="mb-2 font-mono text-matrix text-sm">{eyebrow}</p>}
      {title && <h2 className="font-extrabold text-3xl tracking-tight md:text-5xl">{title}</h2>}
      <div className="mt-8">{children}</div>
    </section>
  );
}
