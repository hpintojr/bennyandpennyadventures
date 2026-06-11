import Header from "./Header";
import Footer from "./Footer";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-cream text-teal">
      <Header />
      {children}
      <Footer />
    </main>
  );
}
