import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-10 bg-teal px-6 py-7 text-center text-sm text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
        <p>© {new Date().getFullYear()} Benny &amp; Penny&rsquo;s Adventures. All rights reserved.</p>
        <div className="flex gap-4 text-white/85">
          <Link href="/privacy" className="hover:text-white">Privacy</Link>
          <Link href="/terms" className="hover:text-white">Terms</Link>
          <Link href="/contact" className="hover:text-white">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
