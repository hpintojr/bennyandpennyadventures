type PortalPageHeaderProps = {
  eyebrow: string;
  title: string;
  intro?: string;
  action?: React.ReactNode;
};

export default function PortalPageHeader({ eyebrow, title, intro, action }: PortalPageHeaderProps) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="small-label">{eyebrow}</p>
        <h1 className="mt-1 font-serif text-3xl font-bold leading-tight text-teal sm:text-4xl">{title}</h1>
        {intro && <p className="mt-2 max-w-2xl text-ink/80">{intro}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
