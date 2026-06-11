const socialLinks = [
  {
    label: "Instagram",
    href: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "#",
    path: "M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.43.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.43.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.43-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.43-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.3-1.46.72-2.13 1.38C1.35 2.67.93 3.34.63 4.14.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.8.72 1.47 1.38 2.13.66.66 1.34 1.08 2.13 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.9 5.9 0 0 0 2.13-1.38 5.9 5.9 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.9 5.9 0 0 0-1.38-2.13A5.9 5.9 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0z M12 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84M12 16a4 4 0 1 1 4-4 4 4 0 0 1-4 4M18.41 4.15a1.44 1.44 0 1 0 1.44 1.44 1.44 1.44 0 0 0-1.44-1.44z"
  },
  {
    label: "Facebook",
    href: process.env.NEXT_PUBLIC_FACEBOOK_URL || "#",
    path: "M24 12a12 12 0 1 0-13.88 11.85v-8.38H7.08V12h3.04V9.36c0-3 1.79-4.67 4.53-4.67 1.31 0 2.68.24 2.68.24v2.95h-1.51c-1.49 0-1.95.92-1.95 1.87V12h3.32l-.53 3.47h-2.79v8.38A12 12 0 0 0 24 12z"
  },
  {
    label: "TikTok",
    href: process.env.NEXT_PUBLIC_TIKTOK_URL || "#",
    path: "M16.6 5.82a4.28 4.28 0 0 1-1.06-2.82h-3.3v13.2a2.59 2.59 0 1 1-2.59-2.59c.27 0 .53.04.78.12V8.36a5.96 5.96 0 0 0-.78-.05A5.92 5.92 0 1 0 15.57 14.2V8.07a7.55 7.55 0 0 0 4.43 1.42V6.19a4.27 4.27 0 0 1-3.4-.37z"
  },
  {
    label: "YouTube",
    href: process.env.NEXT_PUBLIC_YOUTUBE_URL || "#",
    path: "M23.5 6.2a3 3 0 0 0-2.11-2.13C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.39.52A3 3 0 0 0 .5 6.2 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.8 3 3 0 0 0 2.11 2.13c1.89.52 9.39.52 9.39.52s7.5 0 9.39-.52a3 3 0 0 0 2.11-2.13A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z"
  }
];

export default function SocialLinks({ align = "left" }: { align?: "left" | "center" | "right" }) {
  const justify = align === "right" ? "justify-center md:justify-end" : align === "center" ? "justify-center" : "justify-start";
  return (
    <div className={`mt-5 flex gap-3 ${justify}`}>
      {socialLinks.map((link) => (
        <a key={link.label} href={link.href} aria-label={link.label} className="grid h-12 w-12 place-items-center rounded-full bg-teal text-white transition hover:bg-[#0a5f68]">
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d={link.path} />
          </svg>
        </a>
      ))}
      <a href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@bennyandpenny.com"}`} aria-label="Email" className="grid h-12 w-12 place-items-center rounded-full bg-teal text-white transition hover:bg-[#0a5f68]">
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm9 7L4 7v.6l8 5 8-5V7l-8 5z" /></svg>
      </a>
    </div>
  );
}
