export function log(...args: any[]): void {
  if (useRuntimeConfig().public.DRAGGABLE_DEBUG) console.log(...args)
}
