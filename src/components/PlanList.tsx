import { MOCK_PLANS } from "../data/mockPlans";
import { useAppActions, useAppState } from "../state/AppState";

export function PlanList() {
  const { auth, checkout } = useAppState();
  const actions = useAppActions();

  if (auth.status !== "signed-in") return null;

  const busyPlanId =
    checkout.status === "submitting" ||
    checkout.status === "sponsoring-userop"
      ? checkout.planId
      : null;
  const anyBusy = busyPlanId !== null;

  return (
    <section className="card">
      <h2>Plans</h2>
      <ul className="plan-list">
        {MOCK_PLANS.map((plan) => {
          const isBusy = busyPlanId === plan.id;
          return (
            <li key={plan.id} className="plan">
              <div>
                <h3>{plan.name}</h3>
                <p className="muted">{plan.description}</p>
              </div>
              <div className="plan-action">
                <span className="price">${plan.priceUsd}/mo</span>
                <button
                  onClick={() => void actions.startCheckout(plan.id)}
                  disabled={anyBusy}
                >
                  {isBusy ? "Processing..." : "Buy"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
