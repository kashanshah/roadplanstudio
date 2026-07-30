import type { Metadata } from "next";
import { SiteNav } from "@/components/layout/site-nav";
import { emailTemplates } from "@/emails/templates";

export const metadata: Metadata = {
  title: "Email templates",
  robots: { index: false, follow: false },
};

export default function EmailsPreviewPage() {
  return (
    <div className="min-h-full bg-background">
      <SiteNav />
      <main className="mx-auto max-w-5xl space-y-10 px-4 py-10 sm:px-6">
        <div>
          <p className="eyebrow text-primary">Transactional</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Email templates
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Brand-aligned HTML emails for auth and collaboration — ported from
            the Lovable design lab.
          </p>
        </div>
        {emailTemplates.map((preview) => (
          <section key={preview.id} className="space-y-3">
            <div>
              <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
                {preview.name}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Subject: {preview.subject}
              </p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-border bg-muted/30">
              <iframe
                title={preview.name}
                srcDoc={preview.html}
                className="h-[520px] w-full bg-white"
              />
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
