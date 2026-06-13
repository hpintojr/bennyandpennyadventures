import Link from "next/link";
import SiteShell from "../components/SiteShell";
import ImageSlot from "../components/ImageSlot";
import NewsletterForm from "../components/NewsletterForm";
import SocialLinks from "../components/SocialLinks";

const familyMembers = [
  { name: "Michelle", role: "Nurse. Mom. Writer.", image: "/images/michelle.png" },
  { name: "Hamilton", role: "Dev. Dad. Publisher.", image: "/images/hamilton.png" },
  { name: "Charlie", role: "Lead Adventurer", image: "/images/charlie.png" },
  { name: "Mary", role: "Lead Adventurer", image: "/images/mary.png" },
  { name: "Penelope", role: "The Real Penny", image: "/images/penelope.png" },
  { name: "Benjamin", role: "The Real Benny", image: "/images/benjamin.png" }
];

const pillars = [
  { image: "/images/icon-friendly.png", title: "Medical Experiences Made Friendly", text: "We turn medical equipment and procedures into characters children can trust." },
  { image: "/images/icon-nurse.png", title: "Written by a Registered Nurse", text: "Every book is created with medical knowledge, real experience, and a mother's heart." },
  { image: "/images/icon-brave.png", title: "Built for Brave Kids", text: "Our stories help children feel informed, confident, and less afraid during medical care." },
  { image: "/images/icon-journeys.png", title: "Inspired by Real Medical Journeys", text: "Based on our family's experiences with home infusions, PICC lines, ports, and more." },
  { image: "/images/icon-empower.png", title: "Education. Comfort. Empowerment.", text: "Because every child deserves to feel brave when facing medical adventures." }
];

function HeroContent({ className = "" }: { className?: string }) {
  return (
    <div className={`mx-auto max-w-xl text-center lg:mx-0 lg:text-left ${className}`}>
      <h1 className="font-serif text-[40px] font-bold leading-tight text-teal sm:text-5xl md:text-6xl">Helping Children Feel <span className="text-coral">Brave</span> About Medical Care</h1>
      <div className="my-5 text-5xl text-coral sm:text-6xl">♥</div>
      <p className="mx-auto max-w-md text-base leading-8 text-ink sm:text-lg lg:mx-0">Benny, Penny, and their medical friends help children understand infusions, PICC lines, ports, pumps, and more through fun, comforting adventures.</p>
      <Link href="/books" className="btn mt-7 text-lg sm:text-xl">Explore Our Books ♥</Link>
    </div>
  );
}

export default function HomePage() {
  return (
    <SiteShell>
      <section className="wrap pb-10 pt-2">
        <div className="lg:hidden">
          <HeroContent />
          <img
            src="/images/hero-family_mb.png"
            alt="Benny and Penny family illustration"
            className="mx-auto mt-8 block w-full rounded-[2rem]"
          />
        </div>

        <div className="hero-family-bg relative hidden min-h-[620px] items-center overflow-hidden rounded-[2rem] px-12 py-20 lg:flex xl:min-h-[680px]">
          <HeroContent />
        </div>
      </section>

      <section className="wrap py-8">
        <div className="grid overflow-hidden rounded-3xl border border-tan bg-white/45 md:grid-cols-2 lg:grid-cols-5">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="border-tan p-7 text-center lg:my-[22px] lg:border-r lg:px-[18px] lg:py-[10px] lg:last:border-r-0">
              <ImageSlot src={pillar.image} alt={`${pillar.title} icon`} label="Icon" note={pillar.image.replace("/images/", "")} className="mx-auto mb-4 h-[5.25rem] w-[5.25rem] rounded-2xl border-dashed" />
              <h3 className="font-serif text-[21px] leading-tight text-teal">{pillar.title}</h3>
              <p className="mt-4 text-sm leading-6 text-[#26383c]">{pillar.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="author" className="wrap grid scroll-mt-24 items-center gap-8 py-10 lg:grid-cols-[1fr_1.2fr_0.9fr]">
        <ImageSlot src="/images/author-michelle.png" alt="Michelle Marie Pinto writing illustration" label="Author Image" note="public/images/author-michelle.png" className="min-h-[360px] rounded-3xl" />
        <div className="text-center lg:text-left">
          <p className="font-serif text-2xl italic text-teal">Meet the Author ♥</p>
          <h2 className="mt-1 font-serif text-[32px] font-bold leading-tight text-teal sm:text-[35px]">Michelle Marie Pinto, RN</h2>
          <p className="mt-2 font-serif text-3xl text-coral">Nurse. Mom. Writer.</p>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-ink lg:mx-0 lg:max-w-none">With over 15 years as a registered nurse and a deep passion for helping children and families, I created Benny &amp; Penny Adventures to make medical experiences less scary and a little more understandable through stories, friendship, and imagination.</p>
        </div>
        <div className="mx-auto w-full max-w-lg rounded-3xl border border-tan bg-blush p-8 lg:mx-0 lg:max-w-none">
          <h3 className="font-serif text-[27px]">As Seen In My Life ♥</h3>
          <ul className="mt-6 space-y-2.5 text-[17px] text-ink">
            {[
              "Pediatric Nursing Experience",
              "Patient & Family Education",
              "Child Development Advocate",
              "Amazing Kids Mom",
              "Story Lover & Dreamer"
            ].map((item) => (
              <li key={item}><span className="align-middle text-[22px] text-coral">♥</span> {item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section id="family" className="wrap scroll-mt-24 py-8">
        <h2 className="text-center font-serif text-3xl italic md:text-4xl">♥ Meet the Real Family Behind the Adventures ♥</h2>
        <div className="mt-8 grid grid-cols-2 gap-5 md:flex md:snap-x md:overflow-x-auto md:pb-3 lg:grid lg:grid-cols-6 lg:overflow-visible">
          {familyMembers.map((member) => (
            <div key={member.name} className="rounded-2xl border border-tan bg-white/45 p-4 text-center md:w-[160px] md:flex-none md:snap-start lg:w-auto">
              <ImageSlot src={member.image} alt={member.name} label="Image" note={member.image.replace("/images/", "")} className="mb-4 aspect-square rounded-xl" />
              <h3 className="font-serif text-2xl text-teal">{member.name}</h3>
              <p className="mt-2 text-sm font-extrabold leading-snug text-coral">{member.role}</p>
              <div className="mt-3 text-coral">♥</div>
            </div>
          ))}
        </div>
      </section>

      <section id="community" className="mt-8 border-t border-tan bg-green px-6 py-10">
        <div className="mx-auto grid max-w-7xl items-center gap-8 md:grid-cols-3">
          <div>
            <h2 className="font-serif text-3xl">Join Our Community ♥</h2>
            <p className="mt-3 leading-7 text-ink">Get updates on new books, resources, and helpful tips.</p>
            <NewsletterForm />
          </div>
          <div className="text-center">
            <blockquote className="font-serif text-4xl italic leading-tight text-coral">&ldquo;Every child is braver than they believe.&rdquo;</blockquote>
            <p className="mt-4 font-serif text-xl">— Nurse Ivy ♥</p>
          </div>
          <div className="text-center md:text-right">
            <h2 className="font-serif text-3xl">Let&rsquo;s Connect ♥</h2>
            <SocialLinks align="right" />
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
