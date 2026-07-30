"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function FeatureRequestForm({ dict }: { dict: Dictionary }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/feature-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          title: form.get("title"),
          category: form.get("category"),
          details: form.get("details"),
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error || "Failed to send");
      }
      setStatus("sent");
      e.currentTarget.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed to send");
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-xl space-y-5">
      <div>
        <Label htmlFor="feature-name">{dict.feature.name}</Label>
        <Input id="feature-name" name="name" required autoComplete="name" />
      </div>
      <div>
        <Label htmlFor="feature-email">{dict.feature.email}</Label>
        <Input
          id="feature-email"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
      </div>
      <div>
        <Label htmlFor="feature-title">{dict.feature.titleField}</Label>
        <Input id="feature-title" name="title" required maxLength={120} />
      </div>
      <div>
        <Label htmlFor="feature-category">Category</Label>
        <Select
          id="feature-category"
          name="category"
          defaultValue="planner"
          required
        >
          <option value="planner">Planner / map</option>
          <option value="templates">Trip templates</option>
          <option value="collaboration">Tripmates / sharing</option>
          <option value="mobile">Mobile experience</option>
          <option value="i18n">Languages / regions</option>
          <option value="other">Other</option>
        </Select>
      </div>
      <div>
        <Label htmlFor="feature-details">{dict.feature.details}</Label>
        <Textarea id="feature-details" name="details" required rows={6} />
      </div>
      {status === "sent" ? (
        <p className="text-base text-success" role="status">
          {dict.feature.success}
        </p>
      ) : null}
      {status === "error" && error ? (
        <p className="text-base text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <Button
        type="submit"
        size="lg"
        variant="accent"
        className="text-base"
        disabled={status === "sending"}
      >
        {status === "sending" ? dict.common.sending : dict.common.submit}
      </Button>
    </form>
  );
}
