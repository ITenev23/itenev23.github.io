import { createFileRoute } from "@tanstack/react-router";
import { Credentials } from "@/features/credentials/Credentials";
import { useTitle } from "@/shared/lib/useTitle";
import { Section } from "@/shared/ui/Section";

export const Route = createFileRoute("/certifications")({ component: Certifications });

function Certifications() {
  useTitle("Certifications");
  return (
    <div className="pt-16">
      <Section id="certifications" eyebrow="~/certifications" title="Certifications and courses">
        <p className="-mt-6 mb-10 max-w-2xl text-lg text-muted">
          Certifications, certificates and courses, and an event I attended. Each one links to the
          issuer's own page, where it can be verified.
        </p>
        <Credentials grouped />
      </Section>
    </div>
  );
}
