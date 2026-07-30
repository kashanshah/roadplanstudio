"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  Check,
  Copy,
  Link2,
  Loader2,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { tip } from "@/components/ui/app-tooltip";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

type Props = {
  tripId: string;
  onClose: () => void;
};

type CollaboratorRow = {
  id?: string;
  userId: string;
  permission: "VIEWER" | "EDITOR";
  joinedAt?: string;
  fullName: string | null;
  email: string | null;
  avatarUrl: string | null;
  isOwner: boolean;
};

type JoinRequestRow = {
  id: string;
  userId: string;
  permission: "VIEWER" | "EDITOR";
  createdAt: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
};

type InviteLink = {
  id: string;
  token: string;
  permission: "VIEWER" | "EDITOR";
  enabled: boolean;
  requireApproval: boolean;
  url: string;
};

type PanelSnapshot = {
  owner: CollaboratorRow | null;
  collaborators: CollaboratorRow[];
  inviteLink: InviteLink | null;
  requests: JoinRequestRow[];
};

function displayName(row: {
  fullName: string | null;
  email: string | null;
  userId: string;
}) {
  return row.fullName || row.email || "Tripmate";
}

async function fetchPanelData(tripId: string): Promise<PanelSnapshot> {
  const [collabRes, linkRes, reqRes] = await Promise.all([
    fetch(`/api/trips/${tripId}/collaborators`),
    fetch(`/api/trips/${tripId}/invite-link`),
    fetch(`/api/trips/${tripId}/join-requests`),
  ]);

  let owner: CollaboratorRow | null = null;
  let collaborators: CollaboratorRow[] = [];
  let inviteLink: InviteLink | null = null;
  let requests: JoinRequestRow[] = [];

  if (collabRes.ok) {
    const data = (await collabRes.json()) as {
      owner: CollaboratorRow;
      collaborators: CollaboratorRow[];
    };
    owner = data.owner;
    collaborators = data.collaborators;
  }

  if (linkRes.ok) {
    const data = (await linkRes.json()) as { link: InviteLink | null };
    inviteLink = data.link;
  }

  if (reqRes.ok) {
    const data = (await reqRes.json()) as { requests: JoinRequestRow[] };
    requests = data.requests;
  }

  return { owner, collaborators, inviteLink, requests };
}

export function TripmatesPanel({ tripId, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<"VIEWER" | "EDITOR">("VIEWER");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const [loading, setLoading] = useState(true);
  const [owner, setOwner] = useState<CollaboratorRow | null>(null);
  const [collaborators, setCollaborators] = useState<CollaboratorRow[]>([]);
  const [requests, setRequests] = useState<JoinRequestRow[]>([]);
  const [inviteLink, setInviteLink] = useState<InviteLink | null>(null);

  const [linkPermission, setLinkPermission] = useState<"VIEWER" | "EDITOR">(
    "VIEWER",
  );
  const [requireApproval, setRequireApproval] = useState(false);
  const [linkBusy, setLinkBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  function applySnapshot(snapshot: PanelSnapshot) {
    setOwner(snapshot.owner);
    setCollaborators(snapshot.collaborators);
    setInviteLink(snapshot.inviteLink);
    setRequests(snapshot.requests);
    if (snapshot.inviteLink) {
      setLinkPermission(snapshot.inviteLink.permission);
      setRequireApproval(snapshot.inviteLink.requireApproval);
    }
  }

  async function refresh() {
    const snapshot = await fetchPanelData(tripId);
    applySnapshot(snapshot);
  }

  useEffect(() => {
    let cancelled = false;
    fetchPanelData(tripId)
      .then((snapshot) => {
        if (cancelled) return;
        applySnapshot(snapshot);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load tripmates");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tripId]);

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
      setMessage(
        `Added ${email} as ${permission === "EDITOR" ? "Editor" : "Viewer"}.`,
      );
      setEmail("");
      await refresh();
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

  async function createOrUpdateLink(regenerate = false) {
    setLinkBusy(true);
    setError(null);
    const method = inviteLink && !regenerate ? "PATCH" : "POST";
    const body =
      method === "POST"
        ? {
            permission: linkPermission,
            requireApproval,
            regenerate,
          }
        : {
            permission: linkPermission,
            requireApproval,
            regenerate,
            enabled: true,
          };

    const res = await fetch(`/api/trips/${tripId}/invite-link`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLinkBusy(false);
    if (!res.ok) {
      setError("Could not update invite link");
      return;
    }
    const data = (await res.json()) as { link: InviteLink };
    setInviteLink(data.link);
    setMessage(
      regenerate
        ? "Invite link regenerated. Old links no longer work."
        : "Invite link ready to share.",
    );
  }

  async function toggleLinkEnabled(enabled: boolean) {
    if (!inviteLink) return;
    setLinkBusy(true);
    setError(null);
    const res = await fetch(`/api/trips/${tripId}/invite-link`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled }),
    });
    setLinkBusy(false);
    if (!res.ok) {
      setError("Could not update link");
      return;
    }
    const data = (await res.json()) as { link: InviteLink };
    setInviteLink(data.link);
  }

  async function copyLink() {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function removeCollaborator(userId: string) {
    setRemovingId(userId);
    setError(null);
    const res = await fetch(`/api/trips/${tripId}/collaborators/${userId}`, {
      method: "DELETE",
    });
    setRemovingId(null);
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error || "Could not remove tripmate");
      return;
    }
    setMessage("Tripmate removed.");
    await refresh();
  }

  async function resolveRequest(
    requestId: string,
    action: "approve" | "reject",
  ) {
    setResolvingId(requestId);
    setError(null);
    const res = await fetch(
      `/api/trips/${tripId}/join-requests/${requestId}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      },
    );
    setResolvingId(null);
    if (!res.ok) {
      setError("Could not update join request");
      return;
    }
    setMessage(action === "approve" ? "Request approved." : "Request rejected.");
    await refresh();
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-ink/55">
      <button
        type="button"
        className="fixed inset-0"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative flex min-h-full items-end justify-center p-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:items-center sm:p-6 sm:pt-[max(1.5rem,env(safe-area-inset-top))] sm:pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div
        role="dialog"
        aria-labelledby="tripmates-title"
        className="relative z-10 flex max-h-[min(92dvh,880px)] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-elevated"
      >
        <header className="shrink-0 border-b border-border px-5 py-5 sm:px-8 sm:py-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="eyebrow text-primary">Collaborate</p>
              <h2
                id="tripmates-title"
                className="mt-2 font-display text-2xl font-semibold sm:text-3xl"
              >
                Tripmates
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">
                Viewers can look · Editors can change the itinerary
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid size-10 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted"
              aria-label="Close"
              {...tip("Close")}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {error || message ? (
            <div className="mt-4 space-y-1">
              {error ? (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              ) : null}
              {message ? (
                <p className="break-all text-sm text-primary">{message}</p>
              ) : null}
            </div>
          ) : null}
        </header>

        {loading ? (
          <div className="flex flex-1 items-center justify-center gap-2 p-10 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </div>
        ) : (
          <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
            <aside className="flex min-h-0 flex-col border-b border-border lg:border-r lg:border-b-0">
              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6 sm:py-6">
                <section className="space-y-2">
                  <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    People
                    <span className="ml-1.5 font-normal normal-case tabular-nums">
                      ({(owner ? 1 : 0) + collaborators.length})
                    </span>
                  </h3>
                  <ul className="space-y-2">
                    {owner ? (
                      <li className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/60 px-3.5 py-2.5">
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {displayName(owner)}
                          </p>
                          <p className="truncate text-sm text-muted-foreground">
                            Owner · Editor
                            {owner.email ? ` · ${owner.email}` : ""}
                          </p>
                        </div>
                      </li>
                    ) : null}
                    {collaborators.map((c) => (
                      <li
                        key={c.userId}
                        className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/60 px-3.5 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {displayName(c)}
                          </p>
                          <p className="truncate text-sm text-muted-foreground">
                            {c.permission === "EDITOR" ? "Editor" : "Viewer"}
                            {c.email ? ` · ${c.email}` : ""}
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          disabled={removingId === c.userId}
                          onClick={() => removeCollaborator(c.userId)}
                          aria-label={`Remove ${displayName(c)}`}
                          {...tip("Remove tripmate")}
                        >
                          {removingId === c.userId ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-destructive" />
                          )}
                        </Button>
                      </li>
                    ))}
                    {collaborators.length === 0 ? (
                      <li className="rounded-xl border border-dashed border-border px-3.5 py-3 text-sm text-muted-foreground">
                        No tripmates yet — invite by email or link.
                      </li>
                    ) : null}
                  </ul>
                </section>

                {requests.length > 0 ? (
                  <section className="space-y-2">
                    <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Pending requests
                      <span className="ml-1.5 font-normal normal-case tabular-nums">
                        ({requests.length})
                      </span>
                    </h3>
                    <ul className="space-y-2">
                      {requests.map((r) => (
                        <li
                          key={r.id}
                          className="rounded-xl border border-border px-3.5 py-2.5"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {displayName(r)}
                            </p>
                            <p className="truncate text-sm text-muted-foreground">
                              Wants{" "}
                              {r.permission === "EDITOR" ? "Editor" : "Viewer"}
                              {r.email ? ` · ${r.email}` : ""}
                            </p>
                          </div>
                          <div className="mt-2.5 flex gap-2">
                            <Button
                              type="button"
                              size="sm"
                              disabled={resolvingId === r.id}
                              onClick={() => resolveRequest(r.id, "approve")}
                            >
                              Approve
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={resolvingId === r.id}
                              onClick={() => resolveRequest(r.id, "reject")}
                            >
                              Reject
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}
              </div>
            </aside>

            <div className="min-h-0 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6 sm:py-6">
              <div className="mx-auto flex max-w-xl flex-col gap-6">
                <section className="space-y-3">
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-primary" />
                    <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Invite by email
                    </h3>
                  </div>
                  <form
                    className="flex flex-col gap-3 sm:flex-row sm:items-end"
                    onSubmit={onInvite}
                  >
                    <label className="block min-w-0 flex-1 space-y-1.5 text-sm">
                      <span className="font-medium">Email</span>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11 w-full rounded-xl border border-input bg-background px-3.5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        placeholder="friend@example.com"
                      />
                    </label>
                    <label className="block w-full space-y-1.5 text-sm sm:w-36">
                      <span className="font-medium">Role</span>
                      <select
                        value={permission}
                        onChange={(e) =>
                          setPermission(e.target.value as "VIEWER" | "EDITOR")
                        }
                        className="h-11 w-full rounded-xl border border-input bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="VIEWER">Viewer</option>
                        <option value="EDITOR">Editor</option>
                      </select>
                    </label>
                    <Button
                      type="submit"
                      size="lg"
                      className="h-11 shrink-0"
                      disabled={pending}
                    >
                      {pending ? "Inviting…" : "Invite"}
                    </Button>
                  </form>
                </section>

                <section className="space-y-3 border-t border-border pt-6">
                  <div className="flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-primary" />
                    <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Shareable link
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Anyone with the link can accept. On private trips they see
                    the invite only until they join.
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-muted-foreground">
                        Role
                      </span>
                      <select
                        value={linkPermission}
                        onChange={(e) =>
                          setLinkPermission(
                            e.target.value as "VIEWER" | "EDITOR",
                          )
                        }
                        className="h-10 rounded-xl border border-input bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="VIEWER">Viewer</option>
                        <option value="EDITOR">Editor</option>
                      </select>
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={requireApproval}
                        onCheckedChange={(v) => setRequireApproval(v === true)}
                      />
                      <span className="font-medium">Require approval</span>
                    </label>
                    {inviteLink ? (
                      <label className="flex items-center gap-2 text-sm">
                        <Checkbox
                          checked={inviteLink.enabled}
                          disabled={linkBusy}
                          onCheckedChange={(v) =>
                            toggleLinkEnabled(v === true)
                          }
                        />
                        <span className="font-medium">Link active</span>
                      </label>
                    ) : null}
                  </div>

                  {inviteLink ? (
                    <div className="space-y-3">
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <input
                          readOnly
                          value={inviteLink.url}
                          className="h-11 min-w-0 flex-1 rounded-xl border border-input bg-background px-3.5 text-sm outline-none"
                        />
                        <Button
                          type="button"
                          size="lg"
                          variant="secondary"
                          className="h-11 shrink-0"
                          onClick={copyLink}
                          disabled={!inviteLink.enabled}
                        >
                          {copied ? (
                            <>
                              <Check className="h-4 w-4" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" /> Copy
                            </>
                          )}
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          disabled={linkBusy}
                          onClick={() => createOrUpdateLink(false)}
                        >
                          {linkBusy ? "Saving…" : "Save settings"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={linkBusy}
                          onClick={() => createOrUpdateLink(true)}
                        >
                          Regenerate
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      size="lg"
                      disabled={linkBusy}
                      onClick={() => createOrUpdateLink(false)}
                    >
                      {linkBusy ? "Creating…" : "Create invite link"}
                    </Button>
                  )}
                </section>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
