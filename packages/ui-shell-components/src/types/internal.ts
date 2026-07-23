/**
 * DON'T EXPORT THIS TYPES IN index.ts, it's for internal use only
 * @internal
 */

export type IfExtends<T, U, Then, Else = unknown> = T extends U ? Then : Else;
