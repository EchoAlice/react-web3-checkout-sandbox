import { useAppActions, useAppState } from "../state/AppState";

function shorten(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function AccountPanel() {
  const { auth } = useAppState();
  const actions = useAppActions();

  if (auth.status !== "signed-in") return null;
  const { session } = auth;

  return (
    <section className="card">
      <header className="row">
        <h2>Account</h2>
        <button className="link" onClick={actions.signOut}>
          Sign out
        </button>
      </header>
      <dl>
        <dt>Email</dt>
        <dd>{session.email}</dd>

        <dt>Embedded EOA</dt>
        <dd>
          <code title={session.eoa}>{shorten(session.eoa)}</code>
          <span className="badge">fake</span>
        </dd>

        <dt>Smart wallet</dt>
        <dd>
          <code title={session.smartWallet}>{shorten(session.smartWallet)}</code>
          <span className="badge">fake</span>
        </dd>
      </dl>
    </section>
  );
}
