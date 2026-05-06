import { MOCK_PLANS } from "../data/mockPlans";
import { useAppActions, useAppState } from "../state/AppState";

function planName(planId: string): string {
  return MOCK_PLANS.find((p) => p.id === planId)?.name ?? planId;
}

export function Checkout() {
  const { auth, checkout } = useAppState();
  const actions = useAppActions();

  if (auth.status !== "signed-in") return null;
  if (checkout.status === "idle") return null;

  return (
    <section className="card">
      <h2>Checkout</h2>
      {checkout.status === "submitting" ? (
        <p>
          Submitting purchase for <strong>{planName(checkout.planId)}</strong>...
        </p>
      ) : null}

      {checkout.status === "sponsoring-userop" ? (
        <div>
          <p>
            Sponsored UserOp pending for{" "}
            <strong>{planName(checkout.planId)}</strong>
          </p>
          <p className="muted">
            UserOp hash: <code>{checkout.userOpHash.slice(0, 18)}…</code>
          </p>
          <p className="status status-pending">Waiting for bundler...</p>
        </div>
      ) : null}

      {checkout.status === "success" ? (
        <div>
          <p className="status status-active">
            Purchase complete. Order <code>{checkout.orderId}</code>.
          </p>
          <button onClick={actions.resetCheckout}>Done</button>
        </div>
      ) : null}

      {checkout.status === "failure" ? (
        <div>
          <p className="status status-failed">
            Failed: {checkout.reason}
          </p>
          <div className="actions">
            <button onClick={() => void actions.startCheckout(checkout.planId)}>
              Retry
            </button>
            <button className="link" onClick={actions.resetCheckout}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
