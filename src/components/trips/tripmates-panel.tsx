"use client";

import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  tripId: string;
  onClose: () => void;
};

export function TripmatesPanel({ tripId, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<"VIEWER" | "EDITOR">("VIEWER");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onInvite(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);

    const collabRes = await fetch(`/api/trips/${tripId}/collaborators`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, permission }),
    });

    if (collabRes.ok) {
      setPending(false);
      setMessage(`Added ${email} as ${permission === "EDITOR" ? "Editor" : "Viewer"}.`);
      setEmail("");
      return;
    }

    const collabData = (await collabRes.json().catch(() => ({}))) as {
      code?: string;
      error?: string;
    };

    if (collabData.code === "USER_NOT_FOUND") {
      const inviteRes = await fetch(`/api/trips/${tripId}/invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, permission }),
      });
      setPending(false);
      if (!inviteRes.ok) {
        setError("Could not create invite");
        return;
      }
      const inviteData = (await inviteRes.json()) as { acceptUrl?: string };
      setMessage(
        inviteData.acceptUrl
          ? `Invite created. Share this link: ${inviteData.acceptUrl}`
          : `Invite sent to ${email}.`,
      );
      setEmail("");
      return;
    }

    setPending(false);
    setError(collabData.error || "Could not invite tripmate");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/55 p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[min(92dvh,720px)] w-full max-w-md overflow-y-auto overscroll-contain rounded-3xl border border-border bg-card p-6 shadow-elevated sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="sticky top-0 float-right z-10 -mr-1 -mt-1 grid size-10 place-items-center rounded-full text-muted-foreground hover:bg-muted"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <p className="eyebrow text-primary">Collaborate</p>
        <h2 className="mt-3 font-display text-3xl font-semibold">Tripmates</h2>
        <p className="mt-3 text-base text-muted-foreground">
          Invite registered users by email. Viewers can look; Editors can edit
          the itinerary.
        </p>

        <form className="mt-6 space-y-4" onSubmit={onInvite}>
          <label className="block space-y-2 text-base">
            <span className="font-medium">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 w-full rounded-full border border-input bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="friend@example.com"
            />
          </label>
          <label className="block space-y-2 text-base">
            <span className="font-medium">Permission</span>
            <select
              value={permission}
              onChange={(e) =>
                setPermission(e.target.value as "VIEWER" | "EDITOR")
              }
              className="h-12 w-full rounded-full border border-input bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="VIEWER">Viewer</option>
              <option value="EDITOR">Editor</option>
            </select>
          </label>
          {error ? (
            <p className="text-base text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          {message ? (
            <p className="break-all text-base text-primary">{message}</p>
          ) : null}
          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending ? "Inviting…" : "Invite tripmate"}
          </Button>
        </form>
      </div>
    </div>
  );
}
