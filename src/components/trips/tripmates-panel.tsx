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
          {...tip("Close")}
        >
          <X className="h-5 w-5" />
        </button>
        <p className="eyebrow text-primary">Collaborate</p>
        <h2 className="mt-3 font-display text-3xl font-semibold">Tripmates</h2>
        <p className="mt-3 text-base text-muted-foreground">
          Invite by email or share a link. Viewers can look; Editors can edit
          the itinerary.
        </p>

        {loading ? (
          <div className="mt-8 flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading…
          </div>
        ) : (
          <>
            <section className="mt-6 space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                People
              </h3>
              <ul className="space-y-2">
                {owner ? (
                  <li className="flex items-center justify-between gap-3 rounded-2xl border border-border px-4 py-3">
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
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{displayName(c)}</p>
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
                  <li className="rounded-2xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
                    No tripmates yet — invite someone below.
                  </li>
                ) : null}
              </ul>
            </section>

            {requests.length > 0 ? (
              <section className="mt-6 space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Pending requests
                </h3>
                <ul className="space-y-2">
                  {requests.map((r) => (
                    <li
                      key={r.id}
                      className="rounded-2xl border border-border px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {displayName(r)}
                        </p>
                        <p className="truncate text-sm text-muted-foreground">
                          Wants{" "}
                          {r.permission === "EDITOR" ? "Editor" : "Viewer"}{" "}
                          access
                          {r.email ? ` · ${r.email}` : ""}
                        </p>
                      </div>
                      <div className="mt-3 flex gap-2">
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

            <section className="mt-8 space-y-4 border-t border-border pt-6">
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Shareable link
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Anyone with the link can accept. For private trips they only see
                the invite — not the itinerary — until they join.
              </p>

              <label className="block space-y-2 text-base">
                <span className="font-medium">Link permission</span>
                <select
                  value={linkPermission}
                  onChange={(e) =>
                    setLinkPermission(e.target.value as "VIEWER" | "EDITOR")
                  }
                  className="h-12 w-full rounded-full border border-input bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="VIEWER">Viewer</option>
                  <option value="EDITOR">Editor</option>
                </select>
              </label>

              <label className="flex items-start gap-3 text-base">
                <Checkbox
                  checked={requireApproval}
                  onCheckedChange={(v) => setRequireApproval(v === true)}
                  className="mt-0.5"
                />
                <span>
                  <span className="font-medium">Require approval</span>
                  <span className="mt-0.5 block text-sm text-muted-foreground">
                    People request to join; you approve before they become
                    tripmates. Turn off for instant join.
                  </span>
                </span>
              </label>

              {inviteLink ? (
                <>
                  <label className="flex items-start gap-3 text-base">
                    <Checkbox
                      checked={inviteLink.enabled}
                      disabled={linkBusy}
                      onCheckedChange={(v) => toggleLinkEnabled(v === true)}
                      className="mt-0.5"
                    />
                    <span>
                      <span className="font-medium">Allow joins via link</span>
                      <span className="mt-0.5 block text-sm text-muted-foreground">
                        Disable anytime to stop new people from using this link.
                      </span>
                    </span>
                  </label>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      readOnly
                      value={inviteLink.url}
                      className="h-12 min-w-0 flex-1 rounded-full border border-input bg-background px-4 text-sm outline-none"
                    />
                    <Button
                      type="button"
                      size="lg"
                      variant="secondary"
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

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      type="button"
                      size="lg"
                      className="flex-1"
                      disabled={linkBusy}
                      onClick={() => createOrUpdateLink(false)}
                    >
                      {linkBusy ? "Saving…" : "Save link settings"}
                    </Button>
                    <Button
                      type="button"
                      size="lg"
                      variant="outline"
                      className="flex-1"
                      disabled={linkBusy}
                      onClick={() => createOrUpdateLink(true)}
                    >
                      Regenerate
                    </Button>
                  </div>
                </>
              ) : (
                <Button
                  type="button"
                  size="lg"
                  className="w-full"
                  disabled={linkBusy}
                  onClick={() => createOrUpdateLink(false)}
                >
                  {linkBusy ? "Creating…" : "Create invite link"}
                </Button>
              )}
            </section>

            <section className="mt-8 space-y-4 border-t border-border pt-6">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Invite by email
                </h3>
              </div>
              <form className="space-y-4" onSubmit={onInvite}>
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
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={pending}
                >
                  {pending ? "Inviting…" : "Invite tripmate"}
                </Button>
              </form>
            </section>
          </>
        )}

        {error ? (
          <p className="mt-4 text-base text-destructive" role="alert">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="mt-4 break-all text-base text-primary">{message}</p>
        ) : null}
      </div>
    </div>
  );
}
