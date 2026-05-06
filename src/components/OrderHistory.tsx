import { MOCK_PLANS } from "../data/mockPlans";
import { useAppState } from "../state/AppState";
import type { Order } from "../types";

function planName(planId: string): string {
  return MOCK_PLANS.find((p) => p.id === planId)?.name ?? planId;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString();
}

function OrderRow({ order }: { order: Order }) {
  const name = planName(order.planId);
  switch (order.status) {
    case "pending":
      return (
        <li className="order">
          <div>
            <strong>{name}</strong>{" "}
            <span className="muted">· {formatTime(order.createdAt)}</span>
          </div>
          <span className="status status-pending">pending</span>
        </li>
      );
    case "active":
      return (
        <li className="order">
          <div>
            <strong>{name}</strong>{" "}
            <span className="muted">
              · activated {formatTime(order.activatedAt)}
            </span>
          </div>
          <span className="status status-active">active</span>
        </li>
      );
    case "failed":
      return (
        <li className="order">
          <div>
            <strong>{name}</strong>{" "}
            <span className="muted">· {formatTime(order.createdAt)}</span>
            <div className="muted small">{order.reason}</div>
          </div>
          <span className="status status-failed">failed</span>
        </li>
      );
  }
}

export function OrderHistory() {
  const { auth, orders } = useAppState();
  if (auth.status !== "signed-in") return null;

  return (
    <section className="card">
      <h2>Orders</h2>
      {orders.length === 0 ? (
        <p className="muted">No orders yet.</p>
      ) : (
        <ul className="order-list">
          {orders.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))}
        </ul>
      )}
    </section>
  );
}
