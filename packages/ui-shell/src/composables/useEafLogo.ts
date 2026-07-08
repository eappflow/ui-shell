import {
  computed,
  inject,
  toValue,
  type ComputedRef,
  type MaybeRefOrGetter,
} from "vue";
import { APP_CONFIG_KEY } from "../services/interfaces";
import { LogoPlacement, EafLogo } from "../types/eaf-logo";

export interface UseLogoReturn {
  logoSrc: ComputedRef<string | undefined>;
}

/**
 * Resolves the correct logo source based on the current layout context.
 */
export function useEafLogo(
  placement?: MaybeRefOrGetter<LogoPlacement | undefined>,
): UseLogoReturn {
  const appConfig = inject(APP_CONFIG_KEY, { name: "App", version: "0.0.0" });

  const logoSrc = computed<string | undefined>(() => {
    const logo = appConfig.logo;
    if (!logo) return undefined;

    // Legacy fallback — plain string
    if (typeof logo === "string") return logo;

    const currentPlacement =
      toValue(placement) ?? LogoPlacement.AUTHORIZED_LAYOUT_SIDEBAR;

    return resolveLogoSrc(logo, currentPlacement);
  });

  return { logoSrc };
}

function resolveLogoSrc(
  logo: EafLogo,
  placement: LogoPlacement,
): string | undefined {
  switch (placement) {
    case LogoPlacement.AUTHORIZED_LAYOUT_SIDEBAR:
      return logo.srcInAuthorizedLayout;
    case LogoPlacement.UNAUTHORIZED_LAYOUT:
      return logo.srcInUnauthorizedLayout;
    case LogoPlacement.UNAUTHORIZED_LAYOUT_COMPONENTS:
      return logo.srcInUnauthorizedLayoutComponents;
    default:
      return logo.srcInAuthorizedLayout;
  }
}
