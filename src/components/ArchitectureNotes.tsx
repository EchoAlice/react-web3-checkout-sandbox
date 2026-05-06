export function ArchitectureNotes() {
  return (
    <section className="card notes">
      <details>
        <summary>
          <span>Architecture notes</span>
          <span className="chevron" aria-hidden="true">
            ▾
          </span>
        </summary>

      <h3>Local UI state</h3>
      <ul>
        <li>
          Form inputs (email, OTP code) — owned by the component that renders
          the form, with <code>useState</code>.
        </li>
        <li>
          Auth and checkout step machines — discriminated unions inside a
          single <code>useReducer</code>. Each visible step is a tagged status
          so the renderer can switch on it exhaustively.
        </li>
      </ul>

      <h3>Would be server state in a real app</h3>
      <ul>
        <li>The OTP send / verify endpoints (returns a session token).</li>
        <li>
          The plan catalog — pricing, availability, regional rules. Today it
          is a static module; in production it would be a query.
        </li>
        <li>
          Orders — created server-side, then polled or streamed for status
          transitions (pending → active / failed). A cache like TanStack
          Query would own this and dedupe refetches.
        </li>
        <li>
          UserOp status — the bundler / paymaster reports it; the UI mirrors
          it. Treat it as remote, never authoritative on the client.
        </li>
      </ul>

      <h3>Should not be cached persistently</h3>
      <ul>
        <li>
          Session tokens, OTP codes, anything that proves identity. Memory
          only; no <code>localStorage</code>, no <code>sessionStorage</code>.
        </li>
        <li>
          Wallet addresses tied to a user. They are not secrets, but caching
          them across sign-in changes leaks one user's identifiers into
          another user's session.
        </li>
        <li>
          In-flight checkout state. If a tab is closed mid-purchase, the
          server is the source of truth on retry — not a stale client cache.
        </li>
      </ul>
      </details>
    </section>
  );
}
