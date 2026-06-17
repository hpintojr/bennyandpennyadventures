"use client";

import React, { useState } from "react";

type SubmitState = "idle" | "submitting" | "success" | "error";

type Props = {
  disabled?: boolean;
  printJobId: string;
  status: string;
};

export function LuluSubmitButton({ disabled, printJobId, status }: Props) {
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");
  const canSubmit = !disabled && status === "ready" && state !== "submitting";

  async function submitToLulu() {
    if (!canSubmit) return;

    const confirmed = window.confirm("Submit this ready print job to LuLu sandbox now?");
    if (!confirmed) return;

    setState("submitting");
    setMessage("Submitting to LuLu...");

    try {
      const response = await fetch(`/api/admin/print-jobs/${printJobId}/submit-lulu`, {
        method: "POST",
        credentials: "include"
      });
      const json = await response.json().catch(() => ({}));

      if (!response.ok || json?.ok === false) {
        setState("error");
        setMessage(typeof json?.error === "string" ? json.error : "LuLu submission failed.");
        return;
      }

      setState("success");
      setMessage("Submitted. Refreshing the print-job list...");
      window.setTimeout(() => window.location.reload(), 1200);
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "LuLu submission failed.");
    }
  }

  return (
    <div className="bp-lulu-submit__action">
      <button className="bp-lulu-submit__button" disabled={!canSubmit} onClick={submitToLulu} type="button">
        {state === "submitting" ? "Submitting..." : "Submit to LuLu"}
      </button>
      {message ? <p className={`bp-lulu-submit__message bp-lulu-submit__message--${state}`}>{message}</p> : null}
    </div>
  );
}

export default LuluSubmitButton;
