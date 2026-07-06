// ─── Authorized layout ───────────────────────────────────────────────────────

export interface SidebarClasses {
    root?: string;
    header?: string;
    body?: string;
}

export interface HeaderClasses {
    root?: string;
    title?: string;
}

export interface FooterClasses {
    root?: string;
}

export interface MenuClasses {
    root?: string;
    item?: string;
    /** Active (selected) menu item */
    "item-active"?: string;
    /** Menu group / section label */
    "group-label"?: string;
}

export interface AuthorizedLayoutClasses {
    /** Outer wrapper element */
    page?: { root?: string };
    /** `<main>` content area */
    content?: { root?: string };
    sidebar?: SidebarClasses;
    header?: HeaderClasses;
    footer?: FooterClasses;
    menu?: MenuClasses;
}

// ─── Unauthorized layout ─────────────────────────────────────────────────────

export interface UnauthorizedLayoutClasses {
    /** Outer wrapper element */
    page?: { root?: string };
    /** Header bar with app name */
    header?: { root?: string; title?: string };
    /** `<main>` content area */
    content?: { root?: string };
    footer?: { root?: string };
}

// ─── Shared UI components ────────────────────────────────────────────────────

export interface UiCardClasses {
    root?: string;
    title?: string;
    subtitle?: string;
}

export interface UiClasses {
    /** PrimeVue Card */
    card?: UiCardClasses;
    /** PrimeVue Button */
    button?: string;
    /** Form inputs: InputText, Password, etc. */
    input?: string;
    /** `<label>` element in form fields */
    label?: string;
    /** Generic heading / title text */
    heading?: string;
}

// ─── Top-level ───────────────────────────────────────────────────────────────

/**
 * CSS class overrides for shell elements.
 *
 * `layout` controls structural shell areas (sidebar, header, footer, menu, etc.).
 * `ui` controls shared PrimeVue / form components (card, button, input, label).
 */
export interface EafClasses {
    layout?: {
        /** Components inside AuthorizedLayout (sidebar, header, footer, menu) */
        authorized?: AuthorizedLayoutClasses;
        /** Unauthorized / public layout — login, password reset */
        unauthorized?: UnauthorizedLayoutClasses;
    };
    /** Shared UI component overrides (card, button, input, label) */
    ui?: UiClasses;
}