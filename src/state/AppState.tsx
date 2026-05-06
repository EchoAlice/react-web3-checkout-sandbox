import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import type {
  AuthErrorPhase,
  AuthState,
  CheckoutState,
  Order,
  Session,
} from "../types";
import { deriveEoa, deriveSmartWallet } from "../lib/fakeAddresses";
import {
  sendLoginCode,
  submitPurchase,
  verifyLoginCode,
  waitForSponsoredUserOp,
} from "../lib/mockApi";

type State = {
  auth: AuthState;
  checkout: CheckoutState;
  orders: ReadonlyArray<Order>;
};

type Action =
  | { type: "auth/sending"; email: string }
  | { type: "auth/awaiting"; email: string }
  | { type: "auth/verifying"; email: string }
  | { type: "auth/signed-in"; session: Session }
  | {
      type: "auth/error";
      phase: AuthErrorPhase;
      email: string;
      message: string;
    }
  | { type: "auth/sign-out" }
  | { type: "checkout/submitting"; planId: string }
  | {
      type: "checkout/sponsoring";
      planId: string;
      orderId: string;
      userOpHash: string;
    }
  | { type: "checkout/success"; orderId: string }
  | { type: "checkout/failure"; planId: string; reason: string }
  | { type: "checkout/reset" }
  | { type: "order/activate"; orderId: string }
  | { type: "order/fail"; orderId: string; reason: string };

const INITIAL_STATE: State = {
  auth: { status: "signed-out" },
  checkout: { status: "idle" },
  orders: [],
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "auth/sending":
      return {
        ...state,
        auth: { status: "sending-code", email: action.email },
      };
    case "auth/awaiting":
      return {
        ...state,
        auth: { status: "awaiting-code", email: action.email },
      };
    case "auth/verifying":
      return {
        ...state,
        auth: { status: "verifying", email: action.email },
      };
    case "auth/signed-in":
      return {
        ...state,
        auth: { status: "signed-in", session: action.session },
      };
    case "auth/error":
      return {
        ...state,
        auth: {
          status: "error",
          phase: action.phase,
          email: action.email,
          message: action.message,
        },
      };
    case "auth/sign-out":
      return INITIAL_STATE;
    case "checkout/submitting":
      return {
        ...state,
        checkout: { status: "submitting", planId: action.planId },
      };
    case "checkout/sponsoring":
      return {
        ...state,
        checkout: {
          status: "sponsoring-userop",
          planId: action.planId,
          userOpHash: action.userOpHash,
        },
        orders: [
          {
            status: "pending",
            id: action.orderId,
            planId: action.planId,
            userOpHash: action.userOpHash,
            createdAt: Date.now(),
          },
          ...state.orders,
        ],
      };
    case "checkout/success":
      return {
        ...state,
        checkout: { status: "success", orderId: action.orderId },
      };
    case "checkout/failure":
      return {
        ...state,
        checkout: {
          status: "failure",
          planId: action.planId,
          reason: action.reason,
        },
      };
    case "checkout/reset":
      return { ...state, checkout: { status: "idle" } };
    case "order/activate":
      return {
        ...state,
        orders: state.orders.map((order) =>
          order.id === action.orderId && order.status === "pending"
            ? {
                status: "active",
                id: order.id,
                planId: order.planId,
                createdAt: order.createdAt,
                userOpHash: order.userOpHash,
                activatedAt: Date.now(),
              }
            : order,
        ),
      };
    case "order/fail":
      return {
        ...state,
        orders: state.orders.map((order) =>
          order.id === action.orderId && order.status === "pending"
            ? {
                status: "failed",
                id: order.id,
                planId: order.planId,
                createdAt: order.createdAt,
                reason: action.reason,
              }
            : order,
        ),
      };
  }
}

type Actions = {
  requestCode: (email: string) => Promise<void>;
  verifyCode: (code: string) => Promise<void>;
  signOut: () => void;
  startCheckout: (planId: string) => Promise<void>;
  resetCheckout: () => void;
};

const StateContext = createContext<State | null>(null);
const ActionsContext = createContext<Actions | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  const requestCode = useCallback(async (email: string) => {
    dispatch({ type: "auth/sending", email });
    try {
      await sendLoginCode(email);
      dispatch({ type: "auth/awaiting", email });
    } catch (err) {
      dispatch({
        type: "auth/error",
        phase: "send",
        email,
        message: err instanceof Error ? err.message : "Could not send code.",
      });
    }
  }, []);

  const verifyCode = useCallback(
    async (code: string) => {
      const auth = state.auth;
      if (auth.status !== "awaiting-code" && auth.status !== "error") {
        return;
      }
      const email = auth.email;
      dispatch({ type: "auth/verifying", email });
      try {
        await verifyLoginCode(email, code);
        dispatch({
          type: "auth/signed-in",
          session: {
            email,
            eoa: deriveEoa(email),
            smartWallet: deriveSmartWallet(email),
          },
        });
      } catch (err) {
        dispatch({
          type: "auth/error",
          phase: "verify",
          email,
          message: err instanceof Error ? err.message : "Verification failed.",
        });
      }
    },
    [state.auth],
  );

  const signOut = useCallback(() => {
    dispatch({ type: "auth/sign-out" });
  }, []);

  const resetCheckout = useCallback(() => {
    dispatch({ type: "checkout/reset" });
  }, []);

  const startCheckout = useCallback(
    async (planId: string) => {
      if (state.auth.status !== "signed-in") return;
      const email = state.auth.session.email;
      dispatch({ type: "checkout/submitting", planId });
      try {
        const { orderId, userOpHash } = await submitPurchase(planId, email);
        dispatch({
          type: "checkout/sponsoring",
          planId,
          orderId,
          userOpHash,
        });
        try {
          await waitForSponsoredUserOp(userOpHash, planId);
          dispatch({ type: "order/activate", orderId });
          dispatch({ type: "checkout/success", orderId });
        } catch (err) {
          const reason =
            err instanceof Error ? err.message : "Sponsored UserOp failed.";
          dispatch({ type: "order/fail", orderId, reason });
          dispatch({ type: "checkout/failure", planId, reason });
        }
      } catch (err) {
        dispatch({
          type: "checkout/failure",
          planId,
          reason:
            err instanceof Error ? err.message : "Could not submit purchase.",
        });
      }
    },
    [state.auth],
  );

  const actions = useMemo<Actions>(
    () => ({
      requestCode,
      verifyCode,
      signOut,
      startCheckout,
      resetCheckout,
    }),
    [requestCode, verifyCode, signOut, startCheckout, resetCheckout],
  );

  return (
    <StateContext.Provider value={state}>
      <ActionsContext.Provider value={actions}>
        {children}
      </ActionsContext.Provider>
    </StateContext.Provider>
  );
}

export function useAppState(): State {
  const value = useContext(StateContext);
  if (!value) throw new Error("useAppState must be used inside AppProvider");
  return value;
}

export function useAppActions(): Actions {
  const value = useContext(ActionsContext);
  if (!value) throw new Error("useAppActions must be used inside AppProvider");
  return value;
}
