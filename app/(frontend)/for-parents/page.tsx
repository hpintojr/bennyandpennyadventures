import type { Metadata } from "next";
import SiteShell from "../../components/SiteShell";

export const metadata: Metadata = {
  title: "For Parents",
  description: "Parent resources and guides for Benny and Penny's Adventures."
};

const guides = [
  ["Home Infusions", "How to explain a home infusion day and make it feel cozy and calm."],
  ["Ports", "Talking about the little button under the skin and why it helps."],
  ["PICC Lines", "Helping your child understand a PICC line without fear."],
  ["MRI Scans", "Preparing for the loud but safe machine and how to hold still."],
  ["Hospital Stays", "What to pack and how to make an overnight stay feel safe."],
  ["Lab Draws", "Tips for a calmer, braver blood draw."]
];

export default function ForParentsPage() {
  return (
    <SiteShell>
      <div className="page-wrap pb-16 pt-4">
        <section className="text-center">
          <h1 className="font-serif text-4xl font-semibold text-teal sm:text-5xl">For Parents</h1>
          <p className="mx-auto mt-4 max-w-2xl text-ink">Simple resources to help families prepare for medical moments with confidence and comfort.</p>
        </section>
        <section className="py-10">
          <h2 className="section-title mb-5">Talk-to-Your-Child Guides</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map(([title, text]) => (
              <article key={title} className="panel-card rounded-2xl p-5">
                <h3 className="font-serif text-xl text-teal">{title}</h3>
                <p className="mt-2 text-sm text-ink">{text}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
