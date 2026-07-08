export interface EafLogo {
    /** Path to the logo displayed in the authenticated area (e.g., sidebar). */
    srcInAuthorizedLayout?: string;
    /** Path to the logo displayed on public pages (e.g., login screen). */
    srcInUnauthorizedLayout?: string;
    /** Path to the logo for specific sub-components (e.g., login-card). */
    srcInUnauthorizedLayoutComponents?: string;
};

export type EafLogoSrc = string;

export enum LogoPlacement {
    UNAUTHORIZED_LAYOUT = 'unauthorizedLayout',
    UNAUTHORIZED_LAYOUT_COMPONENTS = 'unauthorizedLayoutComponents',
    AUTHORIZED_LAYOUT_SIDEBAR = 'authorizedLayoutSidebar',
}
