// The whole app is client-only: lesson progress lives in localStorage, so
// server-rendered HTML would never match what a returning user sees.
export const ssr = false;
