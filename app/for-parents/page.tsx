import type { Metadata } from "next";
import SiteShell from "../components/SiteShell";
import ImageSlot from "../components/ImageSlot";

export const metadata: Metadata = {
  title: "For Parents",
  description: "Parent resources, guides, printable activity sheets, and glossary for children's medical experiences."
};

const guides = [
  ["Home Infusions", "How to explain a home infusion day and make it feel cozy and calm."],
  ["Ports", "Talking about the little button under the skin and why it helps."],
  ["PICC Lines", "Helping your child understand a PICC line without fear."],
  ["Central / Special Lines", "Hickman, Broviac, tunneled, and central lines — explained simply."],
  ["MRI Scans", "Preparing for the loud-but-safe machine and how to hold still."],
  ["Hospital Stays", "What to pack and how to make an overnight stay feel safe."],
  ["Ambulance Rides", "Taking the scary out of sirens and lights."],
  ["Surgery Day", "Walking through the special sleep and waking up brave."],
  ["Lab Draws", "Tips for a calmer, braver blood draw."]
];

const printables = [
  { title: "Benny & Penny Coloring Pages", text: "Color the characters and their medical helpers.", image: "/images/printable-coloring.png", href: "/downloads/coloring-pages.pdf" },
  { title: "My Bravery Chart", text: "A sticker chart to celebrate every brave step.", image: "/images/printable-bravery.png", href: "/downloads/bravery-chart.pdf" },
  { title: "Find-It & Match Activities", text: "Gentle games that introduce medical tools.", image: "/images/printable-activities.png", href: "/downloads/activities.pdf" }
];

const glossary = [
  ["Infusion", "Medicine or fluids that go into the body slowly through a small tube."],
  ["Port", "A tiny helper under the skin that gives medicine an easy doorway."],
  ["PICC Line", "A special line in the arm that helps give medicine without lots of pokes."],
  ["MRI", "A big camera that takes pictures inside the body. It can be loud, but it does not hurt."],
  ["Lab Draw", "A quick blood check that helps doctors learn how the body is doing."]
];

const organizations = [
  ["For Hospitals & Clinics", "Use these books and printables as child-life support tools in waiting rooms or infusion spaces."],
  ["For Schools & Libraries", "Invite Benny and Penny into story time with gentle medical education for young readers."],
  ["For Parents & Caregivers", "Start with a story, then use the guide and activity sheet for the medical moment your child is facing."],
  ["For Bulk Orders", "Reach out for classroom, clinic, nonprofit, or support-group quantities."]
];

export default function ForParentsPage() {
  return (
    <SiteShell>
      <div className="page-wrap pb-16 pt-4">
        <section className="text-center">
          <h1 className="font-serif text-4xl font-semibold text-teal sm:text-5xl">For Parents <span className="text-coral">♥</span></h1>
          <p className="mx-auto mt-4 max-w-2xl text-ink">Tools to help you prepare your child — and yourself — for medical moments. Written by a registered nurse and mom, these resources turn the unknown into something gentle and brave.</p>
        </section>

        <section className="py-10">
          <div className="mb-5 flex items-baseline gap-3">
            <h2 className="section-title">Talk-to-Your-Child Guides</h2><span className="text-coral">♥</span>
          </div>
          <p className="mb-6 text-sm text-ink">Short, plain-language guides for preparing your child before each kind of procedure.</p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map(([title, text]) => (
              <article key={title} className="panel-card rounded-2xl p-5">
                <h3 className="font-serif text-xl text-teal">{title}</h3>
                <p className="mt-2 text-sm text-ink">{text}</p>
                <a href="#" className="btn-ghost mt-4 px-4 py-2 text-sm">Read guide →</a>
              </article>
            ))}
          </div>
        </section>

        <section className="py-6">
          <div className="mb-5 flex items-baseline gap-3">
            <h2 className="section-title">Printable Activity Sheets</h2><span className="text-coral">♥</span>
          </div>
          <p className="mb-6 text-sm text-ink">Free downloadable coloring pages and activities to do together before or after a visit.</p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {printables.map((item) => (
              <article key={item.title} className="panel-card rounded-2xl p-5">
                <ImageSlot src={item.image} alt={`${item.title} preview`} label="Printable preview" note={item.image} className="mb-4 aspect-[4/3] rounded-2xl border-2 border-dashed" />
                <h3 className="font-serif text-xl text-teal">{item.title}</h3>
                <p className="mt-2 text-sm text-ink">{item.text}</p>
                <a className="btn mt-4 px-4 py-2 text-sm" href={item.href}>Download PDF ♥</a>
              </article>
            ))}
          </div>
        </section>

        <section className="py-8">
          <div className="mb-5 flex items-baseline gap-3">
            <h2 className="section-title">Kid-Friendly Glossary</h2><span className="text-coral">♥</span>
          </div>
          <div className="rounded-3xl border border-tan bg-white/55 px-6 py-2">
            {glossary.map(([term, text]) => (
              <div key={term} className="border-b border-tan py-5 last:border-b-0">
                <b className="font-serif text-xl text-coral">{term}</b>
                <p className="mt-1 text-sm text-ink">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-8">
          <div className="mb-5 flex items-baseline gap-3">
            <h2 className="section-title">Support & Sharing</h2><span className="text-coral">♥</span>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {organizations.map(([title, text]) => (
              <article key={title} className="rounded-2xl border border-tan bg-blush p-5">
                <h3 className="font-serif text-xl text-teal">{title}</h3>
                <p className="mt-2 text-sm text-ink">{text}</p>
              </article>
            ))}
          </div>
          <p className="mt-5 text-xs italic text-[#8a7c6a]">These resources are educational and comforting, but they do not replace medical advice from your child&rsquo;s care team.</p>
        </section>
      </div>
    </SiteShell>
  );
}
