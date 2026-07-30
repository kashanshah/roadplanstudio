import { EmailButton, EmailShell } from "./shell";

export function WelcomeEmail({
  name = "traveler",
  confirmUrl = "https://www.roadplanstudio.com/auth/callback",
}: {
  name?: string;
  confirmUrl?: string;
}) {
  return (
    <EmailShell previewText="Confirm your RoadPlan Studio account and start mapping.">
      <h1
        style={{
          margin: "0 0 12px",
          fontFamily: "Georgia, serif",
          fontSize: 24,
          color: "#0B1210",
        }}
      >
        Welcome to the open road, {name}
      </h1>
      <p style={{ margin: "0 0 20px", color: "#5C675F", lineHeight: 1.6 }}>
        Confirm your email to sync itineraries, invite tripmates, and keep every
        stop safe in the cloud.
      </p>
      <EmailButton href={confirmUrl}>Confirm email</EmailButton>
    </EmailShell>
  );
}

export function PasswordResetEmail({
  resetUrl = "https://www.roadplanstudio.com/auth/forgot-password",
}: {
  resetUrl?: string;
}) {
  return (
    <EmailShell previewText="Reset your RoadPlan Studio password.">
      <h1
        style={{
          margin: "0 0 12px",
          fontFamily: "Georgia, serif",
          fontSize: 24,
          color: "#0B1210",
        }}
      >
        Reset your password
      </h1>
      <p style={{ margin: "0 0 20px", color: "#5C675F", lineHeight: 1.6 }}>
        Someone requested a password reset for your RoadPlan Studio account. If
        that was you, continue below. The link expires in 60 minutes.
      </p>
      <EmailButton href={resetUrl}>Choose a new password</EmailButton>
    </EmailShell>
  );
}

export function TripInviteEmail({
  inviterName = "A tripmate",
  tripTitle = "Western Canada Road Trip 2026",
  inviteUrl = "https://www.roadplanstudio.com/planner/new",
  permission = "EDITOR",
}: {
  inviterName?: string;
  tripTitle?: string;
  inviteUrl?: string;
  permission?: "VIEWER" | "EDITOR";
}) {
  return (
    <EmailShell previewText={`${inviterName} invited you to ${tripTitle}.`}>
      <h1
        style={{
          margin: "0 0 12px",
          fontFamily: "Georgia, serif",
          fontSize: 24,
          color: "#0B1210",
        }}
      >
        You&apos;re invited on the road
      </h1>
      <p style={{ margin: "0 0 20px", color: "#5C675F", lineHeight: 1.6 }}>
        <strong style={{ color: "#0B1210" }}>{inviterName}</strong> shared{" "}
        <strong style={{ color: "#0B1210" }}>{tripTitle}</strong> with you as a{" "}
        {permission === "EDITOR" ? "editor" : "viewer"}.
      </p>
      <EmailButton href={inviteUrl}>Open trip</EmailButton>
    </EmailShell>
  );
}

export function GuestSyncSuccessEmail({
  tripTitle = "Untitled road trip",
  plannerUrl = "https://www.roadplanstudio.com/planner/new",
}: {
  tripTitle?: string;
  plannerUrl?: string;
}) {
  return (
    <EmailShell previewText="Your guest itinerary is now saved to the cloud.">
      <h1
        style={{
          margin: "0 0 12px",
          fontFamily: "Georgia, serif",
          fontSize: 24,
          color: "#0B1210",
        }}
      >
        Trip synced to the cloud
      </h1>
      <p style={{ margin: "0 0 20px", color: "#5C675F", lineHeight: 1.6 }}>
        <strong style={{ color: "#0B1210" }}>{tripTitle}</strong> is no longer
        stuck in a browser tab. You can share it, invite tripmates, and pick up
        on any device.
      </p>
      <EmailButton href={plannerUrl}>Open workspace</EmailButton>
    </EmailShell>
  );
}
