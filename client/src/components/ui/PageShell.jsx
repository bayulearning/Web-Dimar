import { useDocumentTitle } from "../../hooks/useDocumentTitle.js";

export function PageShell({ title, description, children }) {
  useDocumentTitle(title);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 md:py-12">
      <header className="mb-8 border-b border-border pb-6">
        <h1 className="text-2xl font-bold uppercase tracking-wide md:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm text-muted">{description}</p>
        ) : null}
      </header>
      {children}
    </div>
  );
}
