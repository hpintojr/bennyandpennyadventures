import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-10 bg-teal px-6 py-7 text-center text-sm text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 lg:flex-row">
        <p>© {new Date().getFullYear()} Benny &amp; Penny&rsquo;s Adventures. All rights reserved.</p>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-white/85">
          <Link href="/privacy" className="hover:text-white">Privacy</Link>
          <Link href="/privacy/california" className="hover:text-white">California Notice</Link>
          <Link href="/privacy/state-rights" className="hover:text-white">State Rights</Link>
          <Link href="/privacy/requests" className="hover:text-white">Do Not Sell/Share</Link>
          <Link href="/terms" className="hover:text-white">Terms</Link>
          <Link href="/sms-terms" className="hover:text-white">Messaging Terms</Link>
          <Link href="/contact" className="hover:text-white">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
