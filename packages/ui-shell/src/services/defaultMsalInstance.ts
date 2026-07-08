import type { IPublicClientApplication } from "@azure/msal-browser";

export function createDefaultMsalInstance(): IPublicClientApplication {
  return new Proxy(
    {},
    {
      get(_target, prop: string) {
        return () => {
          throw new Error(
            `[ui-shell] No MSAL instance provided. Cannot call "${String(prop)}()". `,
          );
        };
      },
    },
  ) as IPublicClientApplication;
}
