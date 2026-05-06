# React Web3 Checkout Sandbox

A small, public learning sandbox for practicing **frontend state modeling**,
**async flows**, and **mock web3 checkout UX**.

It is a generic playground — not tied to any real product, company, chain, or
wallet provider. Everything is fake and lives in memory.

## What it is not

- No real payments.
- No real wallet integration (no MetaMask, no WalletConnect, no embedded SDK).
- No blockchain RPC calls. No bundler. No paymaster.
- No backend. No database.
- No `localStorage`, no `sessionStorage`, no cookies.

If you reload the tab, all state is gone. That is intentional.

## What it does

- Fake **email + OTP** sign-in flow (the demo OTP is `424242`; an incorrect
  code will tell you what to type).
- Mock **account panel** showing a deterministic fake embedded EOA address
  and a fake smart-wallet address derived from the email.
- Mock **plan list** (Starter / Builder / Pro).
- A **checkout flow** that walks through `submitting → sponsoring-userop →
  success | failure`, displaying a fake sponsored UserOp hash along the way.
  The Pro plan is wired to fail roughly half the time so you can see the
  failure path.
- An **order history** with `pending / active / failed` rows.
- A short **architecture notes** section in the UI explaining what is local
  state, what would be server state in a real app, and what should never be
  cached persistently.

## Scripts

```bash
npm install
npm run dev        # start Vite at http://localhost:5173
npm run build      # type-check + production build
npm run typecheck  # tsc -b --noEmit
npm run preview    # preview the production build
```

## Component structure

```
src/
  main.tsx
  App.tsx
  styles.css
  types.ts                     # discriminated unions for auth/checkout/orders
  data/
    mockPlans.ts               # static plan catalog
  lib/
    fakeAddresses.ts           # deterministic fake hex addresses + ids
    mockApi.ts                 # setTimeout-backed fake async API
  state/
    AppState.tsx               # useReducer + context, async action handlers
  components/
    LoginPanel.tsx
    AccountPanel.tsx
    PlanList.tsx
    Checkout.tsx
    OrderHistory.tsx
    ArchitectureNotes.tsx
```

## Design notes

### Discriminated unions for important UI states

`AuthState`, `CheckoutState`, and `Order` in `src/types.ts` are tagged unions.
Components `switch` on the `status` field, which means:

- Each visual step has exactly one set of fields it can read.
- Adding a new state forces every consumer to handle it (TypeScript flags the
  missing branch).
- Impossible states (`status: "success"` with no `orderId`) are unrepresentable.

### Async flows live in event handlers, not `useEffect`

The checkout flow is a sequence of awaited steps inside a single async action
handler in `AppState.tsx`. Each step dispatches a reducer action when it
resolves. There is no `useEffect` orchestrating any of the async work.

`useEffect` is reserved for **synchronizing** with something external (a
subscription, a non-React API). It is not a place to *trigger* work — that
belongs in event handlers, where the cause is a user action.

### State ownership

- Form inputs are `useState` inside the form components.
- Cross-cutting state (auth, checkout, orders) lives in a single
  `useReducer` exposed via context, with a separate context for action
  callbacks so consumers that only need to dispatch don't re-render on
  state changes.

### What would be server state in a real app

See the in-app *Architecture notes* card. Short version: plans, orders, and
UserOp status would all be queries in a real app, owned by a cache like
TanStack Query and revalidated by the server's truth.

## TODO — TanStack Query practice

Ideas for follow-up exercises against this sandbox:

- [ ] Replace the `MOCK_PLANS` import in `PlanList` with a `useQuery` against
      a fake `fetchPlans()` that returns a Promise. Show the loading and
      error states.
- [ ] Convert `submitPurchase` into a `useMutation`, and the `pending →
      active` transition into a polled `useQuery` keyed by `orderId`.
- [ ] Add an "orders" `useQuery` that lists orders from a fake server, and
      use `queryClient.setQueryData` to optimistically insert the new pending
      order on mutation success.
- [ ] Practice query invalidation: invalidate the orders query when checkout
      succeeds, so the list refetches instead of being mutated by hand.
- [ ] Add `staleTime` and `gcTime` to the plans query, and observe how that
      changes refetch behavior on focus/reconnect.
- [ ] Wire a `retry` policy on the UserOp poll so the demo's pro-plan
      failure shows a couple of attempts before giving up.

None of those need a real backend — keep using `setTimeout`-based fakes in
`mockApi.ts`. The point of the exercise is the cache shape, not the network.
