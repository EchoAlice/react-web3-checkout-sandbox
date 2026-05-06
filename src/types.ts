export type HexAddress = `0x${string}`;

export type Plan = {
  id: string;
  name: string;
  description: string;
  priceUsd: number;
};

export type Session = {
  email: string;
  eoa: HexAddress;
  smartWallet: HexAddress;
};

export type AuthErrorPhase = "send" | "verify";

export type AuthState =
  | { status: "signed-out" }
  | { status: "sending-code"; email: string }
  | { status: "awaiting-code"; email: string }
  | { status: "verifying"; email: string }
  | { status: "signed-in"; session: Session }
  | {
      status: "error";
      phase: AuthErrorPhase;
      email: string;
      message: string;
    };

export type CheckoutState =
  | { status: "idle" }
  | { status: "submitting"; planId: string }
  | { status: "sponsoring-userop"; planId: string; userOpHash: string }
  | { status: "success"; orderId: string }
  | { status: "failure"; planId: string; reason: string };

export type Order =
  | {
      status: "pending";
      id: string;
      planId: string;
      createdAt: number;
      userOpHash: string;
    }
  | {
      status: "active";
      id: string;
      planId: string;
      createdAt: number;
      activatedAt: number;
      userOpHash: string;
    }
  | {
      status: "failed";
      id: string;
      planId: string;
      createdAt: number;
      reason: string;
    };
