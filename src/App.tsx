import { AccountPanel } from "./components/AccountPanel";
import { ArchitectureNotes } from "./components/ArchitectureNotes";
import { Checkout } from "./components/Checkout";
import { LoginPanel } from "./components/LoginPanel";
import { OrderHistory } from "./components/OrderHistory";
import { PlanList } from "./components/PlanList";
import { AppProvider } from "./state/AppState";

export function App() {
  return (
    <AppProvider>
      <div className="page">
        <header className="page-header">
          <h1>React Web3 Checkout Sandbox</h1>
          <p className="muted">
            A learning playground. No real wallets, no real payments, no
            backend. All state is in-memory.
          </p>
        </header>

        <main className="grid">
          <LoginPanel />
          <AccountPanel />
          <PlanList />
          <Checkout />
          <OrderHistory />
          <ArchitectureNotes />
        </main>
      </div>
    </AppProvider>
  );
}
