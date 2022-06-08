import { clampPosition, isGraphEdge, isGraphNode } from './graph'
import {
  EdgeChange,
  EdgeSelectionChange,
  ElementChange,
  FlowElements,
  GraphNode,
  NodeChange,
  NodeSelectionChange,
  NodePositionChange,
  Getters,
  CoordinateExtent,
  XYPosition,
  GraphEdge,
  Node,
  FlowElement,
  Edge,
} from '../types'

type CreatePositionChangeParams = {
  node: GraphNode
  nodeExtent: CoordinateExtent
  diff?: XYPosition
  dragging?: boolean
}

export const handleParentResizing = (updateItem: GraphNode, curr: GraphNode[]) => {
  if (updateItem) {
    const parent = updateItem.parentNode ? curr.find((el) => el.id === updateItem.parentNode) : undefined
    if (parent) {
      const restSize = 20;
      const extendWidth = updateItem.position.x + updateItem.dimensions.width - parent.dimensions.width + restSize
      const extendHeight = updateItem.position.y + updateItem.dimensions.height - parent.dimensions.height + restSize

      parent.style = { ...parent.style } || {}

      // Child 이동에 따른 Parent 조정
      if (extendWidth > 0 || extendHeight > 0 || updateItem.position.x < 0 || updateItem.position.y < 0) {
        if (extendWidth > 0) {
          if (!parent.style.width) {
            parent.style.width = parent.dimensions.width
          }
          if (typeof parent.style.width === 'string') {
            const currWidth = parseInt(parent.style.width, 10)
            parent.style.width = `${currWidth + extendWidth}px`
          } else {
            parent.style.width += extendWidth
          }
        }

        if (extendHeight > 0) {
          if (!parent.style.height) {
            parent.style.height = parent.dimensions.height
          }
          if (typeof parent.style.height === 'string') {
            const currWidth = parseInt(parent.style.height, 10)
            parent.style.height = `${currWidth + extendHeight + restSize}px`
          } else {
            parent.style.height += extendHeight
          }
        }

        if (updateItem.position.x < 0) {
          const xDiff = Math.abs(updateItem.position.x)
          parent.position.x = parent.position.x - xDiff
          if (typeof parent.style.width === 'string') {
            const currWidth = parseInt(parent.style.width, 10)
            parent.style.width = `${currWidth + xDiff}px`
          } else {
            ; (parent.style as any).width += xDiff
          }
          updateItem.position.x = 0
        }

        if (updateItem.position.y < 0) {
          const yDiff = Math.abs(updateItem.position.y)
          parent.position.y = parent.position.y - yDiff
          if (typeof parent.style.height === 'string') {
            const currWidth = parseInt(parent.style.height, 10)
            parent.style.height = `${currWidth + yDiff}px`
          } else {
            ; (parent.style as any).height += yDiff
          }
          updateItem.position.y = 0
        }
      }

      // 자식 노드들에 따른 최대 Width/Height 보정
      const childs = curr.filter(item => item.parentNode === parent.id);
      const limitSize = { width: 0, height: 0 }
      childs.forEach(c => {
        if (limitSize.width < (c.position.x + c.dimensions.width)) limitSize.width = (c.position.x + c.dimensions.width)
        if (limitSize.height < (c.position.y + c.dimensions.height)) limitSize.height = (c.position.y + c.dimensions.height)
      })
      limitSize.width += restSize;
      limitSize.height += restSize;

      if (typeof parent.style.width === 'string') {
        const parentWidth = parseInt(parent.style.width, 10)
        if (parentWidth > limitSize.width) {
          parent.style.width = `${limitSize.width}px`
        }
      } else {
        if (parent.style.width > limitSize.width) {
          parent.style.width = limitSize.width
        }
      }

      if (typeof parent.style.height === 'string') {
        const parentHeight = parseInt(parent.style.height, 10)
        if (parentHeight > limitSize.height) {
          parent.style.height = `${limitSize.height}px`
        }
      } else {
        if (parent.style.height > limitSize.height) {
          parent.style.height = limitSize.height
        }
      }

      parent.dimensions.width = (
        typeof parent.style.width === 'string' ? parseInt((<string>parent.style.width)!, 10) : parent.style.width
      )!
      parent.dimensions.height = (
        typeof parent.style.height === 'string' ? parseInt((<string>parent.style.height)!, 10) : parent.style.height
      )!
    }
  }
}

export const applyChanges = <
  T extends Node | GraphNode | Edge | GraphEdge | FlowElement = Node,
  C extends ElementChange = T extends GraphNode ? NodeChange : EdgeChange,
  >(
    changes: C[],
    elements: T[],
    addElement?: (els: T[]) => void,
): T[] => {
  let elementIds = elements.map((el) => el.id)
  changes.forEach((change) => {
    if (change.type === 'add') {
      if (addElement) addElement([change.item as any])
      else elements.push(change.item as any)
    }

    const i = elementIds.indexOf((<any>change).id)
    const el = elements[i]
    switch (change.type) {
      case 'select':
        if (isGraphNode(el) || isGraphEdge(el)) el.selected = change.selected
        break
      case 'position':
        if (isGraphNode(el)) {
          if (typeof change.position !== 'undefined') el.position = change.position
          if (typeof change.dragging !== 'undefined') el.dragging = change.dragging
          if (el.resizeParent && el.parentNode) handleParentResizing(el, elements as GraphNode[])
        }
        break
      case 'dimensions':
        if (isGraphNode(el)) {
          if (typeof change.dimensions !== 'undefined') el.dimensions = change.dimensions
          if (el.resizeParent && el.parentNode) handleParentResizing(el, elements as GraphNode[])
        }
        break
      case 'remove':
        elements.splice(i, 1)
        elementIds = elements.map((el) => el.id)
        break
    }
  })

  return elements
}

export const applyEdgeChanges = (changes: EdgeChange[], edges: GraphEdge[]) => applyChanges(changes, edges)
export const applyNodeChanges = (changes: NodeChange[], nodes: GraphNode[]) => applyChanges(changes, nodes)

export const createSelectionChange = (id: string, selected: boolean): NodeSelectionChange | EdgeSelectionChange => ({
  id,
  type: 'select',
  selected,
})

export const createPositionChange = (
  { node, diff, dragging, nodeExtent }: CreatePositionChangeParams,
  curr: GraphNode[],
): NodePositionChange => {
  const parent = node.parentNode ? curr.find((el) => el.id === node.parentNode) : undefined
  const change: NodePositionChange = {
    id: node.id,
    type: 'position',
    dragging: !!dragging,
  }

  if (diff) {
    const nextPosition = { x: node.position.x + diff.x, y: node.position.y + diff.y }
    let currentExtent = node.extent === 'parent' || typeof node.extent === 'undefined' ? nodeExtent : node.extent

    if (node.extent === 'parent' && parent && node.dimensions.width && node.dimensions.height) {
      currentExtent =
        parent.dimensions.width && parent.dimensions.height
          ? [
            [0, 0],
            [parent.dimensions.width - node.dimensions.width, parent.dimensions.height - node.dimensions.height],
          ]
          : currentExtent
    }

    change.position = currentExtent ? clampPosition(nextPosition, currentExtent) : nextPosition
  }

  return change
}

const isParentSelected = (node: GraphNode, selectedIds: string[], getNode: Getters['getNode']): boolean => {
  const parent = node.parentNode ? getNode(node.parentNode) : undefined
  if (!node.parentNode || !parent) return false
  if (selectedIds.includes(node.parentNode)) return true
  return isParentSelected(parent, selectedIds, getNode)
}

export const getSelectionChanges = (items: FlowElements, selectedIds: string[], getNode: Getters['getNode']) => {
  return items.reduce((res, item) => {
    const willBeSelected =
      selectedIds.includes(item.id) || !!(isGraphNode(item) && item.parentNode && isParentSelected(item, selectedIds, getNode))

    if (!item.selected && willBeSelected) {
      res.push(createSelectionChange(item.id, true))
    } else if (item.selected && !willBeSelected) {
      res.push(createSelectionChange(item.id, false))
    }

    return res
  }, [] as (NodeSelectionChange | EdgeSelectionChange)[])
}
