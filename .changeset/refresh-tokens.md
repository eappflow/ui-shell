---
"@eappflow/ui-shell": minor
---

Refresh tokens in token mode. `AuthResult` carries a `refreshToken` next to the `accessToken`, `AuthService` gets `refresh()` (required on `TokenAuthService`) and `logout()` receives `{ refreshToken }`. `useAuthStore().refreshAccessToken()` swaps the tokens - the host's HTTP client calls it on a 401 and retries once. Requests failing together share one refresh, other tabs wait on a Web Lock, and a failed refresh logs out.
