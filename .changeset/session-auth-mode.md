---
"@eappflow/ui-shell": minor
---

- `AuthService.mode` selects the auth transport: `"token"` (default — `login()` resolves with `accessToken`, which the shell keeps in `localStorage`) or `"session"` (the backend keeps the session, e.g. an HttpOnly cookie; `login()` resolves with nothing and the shell calls `getCurrentUser()` on boot instead of looking for a stored token).
- `AuthService` stays a single interface — `login()` now returns `Promise<AuthResult | void>` — so existing implementations, including `class … implements AuthService`, keep compiling. `TokenAuthService` and `SessionAuthService` are exported as narrower convenience subtypes.
- `useAuthStore` gained `restoreSession()`; `initializeFromStorage()` remains as a deprecated alias. `isAuthenticated` is now derived from the loaded user alone, so it works in both modes without an access token.
