import { fakeOrderId, fakeUserOpHash } from "./fakeAddresses";

const FIXED_OTP = "424242";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendLoginCode(email: string): Promise<void> {
  await delay(700);
  if (!email.includes("@")) {
    throw new Error("Enter a valid email address.");
  }
}

export async function verifyLoginCode(
  email: string,
  code: string,
): Promise<void> {
  await delay(700);
  if (code.trim() !== FIXED_OTP) {
    throw new Error(`Invalid code. (Demo hint: the code is ${FIXED_OTP}.)`);
  }
  if (email.startsWith("blocked")) {
    throw new Error("This account is blocked in the demo.");
  }
}

export type SubmitPurchaseResult = {
  orderId: string;
  userOpHash: string;
};

export async function submitPurchase(
  planId: string,
  email: string,
): Promise<SubmitPurchaseResult> {
  await delay(900);
  const seed = `${email}:${planId}:${Date.now()}`;
  return {
    orderId: fakeOrderId(seed),
    userOpHash: fakeUserOpHash(seed),
  };
}

export async function waitForSponsoredUserOp(
  userOpHash: string,
  planId: string,
): Promise<void> {
  await delay(1200);
  // Pro plan fails ~half the time so the failure UI is reachable.
  if (planId === "pro" && userOpHash.charCodeAt(3) % 2 === 0) {
    throw new Error("Sponsored UserOp reverted (demo failure).");
  }
}
