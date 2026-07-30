"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function ContactForm({ dict }: { dict: Dictionary }) {
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
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          topic: form.get("topic"),
          message: form.get("message"),
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
        <Label htmlFor="contact-name">{dict.contact.name}</Label>
        <Input id="contact-name" name="name" required autoComplete="name" />
      </div>
      <div>
        <Label htmlFor="contact-email">{dict.contact.email}</Label>
        <Input
          id="contact-email"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
      </div>
      <div>
        <Label htmlFor="contact-topic">{dict.contact.topic}</Label>
        <Select id="contact-topic" name="topic" defaultValue="general" required>
          <option value="general">General</option>
          <option value="support">Account / support</option>
          <option value="press">Press</option>
          <option value="partnership">Partnership</option>
          <option value="other">Other</option>
        </Select>
      </div>
      <div>
        <Label htmlFor="contact-message">{dict.contact.message}</Label>
        <Textarea id="contact-message" name="message" required rows={6} />
      </div>
      {status === "sent" ? (
        <p className="text-base text-success" role="status">
          {dict.contact.success}
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
        className="text-base"
        disabled={status === "sending"}
      >
        {status === "sending" ? dict.common.sending : dict.common.submit}
      </Button>
    </form>
  );
}
