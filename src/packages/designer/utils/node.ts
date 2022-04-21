import { getDimensions } from './graph'
import { HandleElement, Position } from '~/packages/designer/types'

export const getHandleBoundsByHandleType = (
  selector: string,
  nodeElement: HTMLDivElement,
  parentBounds: ClientRect | DOMRect,
  k: number,
): HandleElement[] | null => {
  const handles = nodeElement.querySelectorAll(selector)

  if (!handles || !handles.length) return null

  const handlesArray = Array.from(handles) as HTMLDivElement[]

  return handlesArray.map((handle): HandleElement => {
    const bounds = handle.getBoundingClientRect()
    const dimensions = getDimensions(handle)
    const handleId = handle.getAttribute('data-handleid') ?? undefined
    const handlePosition = handle.getAttribute('data-handlepos') as Position

    return {
      id: handleId,
      position: handlePosition,
      x: (bounds.left - parentBounds.left) / k,
      y: (bounds.top - parentBounds.top) / k,
      ...dimensions,
    }
  })
}

export const getHandleBounds = (nodeElement: HTMLDivElement, scale: number, id?: string) => {
  const bounds = nodeElement.getBoundingClientRect()

  return {
    source: getHandleBoundsByHandleType(`.source${id ? `.vue-flow__handle-${id}` : ''}`, nodeElement, bounds, scale) ?? undefined,
    target: getHandleBoundsByHandleType(`.target${id ? `.vue-flow__handle-${id}` : ''}`, nodeElement, bounds, scale) ?? undefined,
  }
}
