import type { ReactNode } from "react";

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footerNote?: string;
};

export function AuthShell({ title, subtitle, children, footerNote }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-brand-50 px-4 py-10">
      <div className="mx-auto flex w-full max-w-md flex-col items-center">
        <header className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500 text-lg font-bold text-white shadow-sm">
            <span aria-hidden="true">&lt;&gt;</span>
          </div>
          <span className="text-2xl font-semibold text-brand-600">Devanta</span>
        </header>

        <h1 className="mb-2 text-center text-2xl font-bold text-slate-900">{title}</h1>
        <p className="mb-8 text-center text-sm text-slate-500">{subtitle}</p>

        <div className="w-full rounded-2xl bg-white p-6 shadow-md shadow-slate-200/60 ring-1 ring-slate-100">
          {children}
        </div>

        {footerNote ? (
          <p className="mt-8 max-w-sm text-center text-xs text-slate-400">{footerNote}</p>
        ) : null}
      </div>
    </div>
  );
}
