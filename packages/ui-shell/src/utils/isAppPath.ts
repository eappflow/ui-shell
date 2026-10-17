/** Whether `href` is a path in the app - not `//host` or `/\host`, which browsers take to another site */
export const isAppPath = (href: string): boolean => /^\/(?![/\\])/.test(href);
