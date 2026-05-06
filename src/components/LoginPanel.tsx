import { useState, type FormEvent } from "react";
import { useAppActions, useAppState } from "../state/AppState";
import type { AuthState } from "../types";

type Step = "email" | "code";

function stepFor(auth: AuthState): Step {
  switch (auth.status) {
    case "signed-out":
    case "sending-code":
      return "email";
    case "awaiting-code":
    case "verifying":
      return "code";
    case "error":
      return auth.phase === "send" ? "email" : "code";
    case "signed-in":
      return "email";
  }
}

function emailFromAuth(auth: AuthState): string | null {
  switch (auth.status) {
    case "sending-code":
    case "awaiting-code":
    case "verifying":
    case "error":
      return auth.email;
    case "signed-out":
    case "signed-in":
      return null;
  }
}

export function LoginPanel() {
  const { auth } = useAppState();
  const actions = useAppActions();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  if (auth.status === "signed-in") return null;

  const step = stepFor(auth);
  const sentToEmail = emailFromAuth(auth);

  const onSubmitEmail = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void actions.requestCode(email.trim());
  };

  const onSubmitCode = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void actions.verifyCode(code);
  };

  return (
    <section className="card login">
      <h2>Sign in</h2>
      <p className="muted">
        Fake email + OTP. The demo OTP is shown in the error if you enter the
        wrong code.
      </p>

      {step === "email" ? (
        <form onSubmit={onSubmitEmail}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            disabled={auth.status === "sending-code"}
          />
          <button type="submit" disabled={auth.status === "sending-code"}>
            {auth.status === "sending-code" ? "Sending..." : "Send code"}
          </button>
        </form>
      ) : (
        <form onSubmit={onSubmitCode}>
          <p>
            Code sent to <strong>{sentToEmail ?? email}</strong>
          </p>
          <label htmlFor="code">6-digit code</label>
          <input
            id="code"
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="424242"
            required
            disabled={auth.status === "verifying"}
          />
          <button type="submit" disabled={auth.status === "verifying"}>
            {auth.status === "verifying" ? "Verifying..." : "Verify"}
          </button>
          <button
            type="button"
            className="link"
            onClick={() => {
              setCode("");
              actions.signOut();
            }}
          >
            Use a different email
          </button>
        </form>
      )}

      {auth.status === "error" ? (
        <p className="error" role="alert">
          {auth.message}
        </p>
      ) : null}
    </section>
  );
}
