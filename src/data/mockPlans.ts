import type { Plan } from "../types";

export const MOCK_PLANS: ReadonlyArray<Plan> = [
  {
    id: "starter",
    name: "Starter",
    description: "A small monthly plan for trying the demo flow.",
    priceUsd: 5,
  },
  {
    id: "builder",
    name: "Builder",
    description: "Mid-tier plan with extra fake quota.",
    priceUsd: 19,
  },
  {
    id: "pro",
    name: "Pro",
    description: "Top-tier plan; this one occasionally fails on purpose.",
    priceUsd: 49,
  },
];
