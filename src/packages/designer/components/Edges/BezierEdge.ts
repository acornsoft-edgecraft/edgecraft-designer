import type { FunctionalComponent } from 'vue'
import { getBezierCenter, getBezierPath } from './utils'
import BaseEdge from './BaseEdge'
import { Position } from '../../types'
import type { EdgeProps } from '../../types'

const BezierEdge: FunctionalComponent<EdgeProps> = function ({
    sourcePosition = Position.Bottom,
    targetPosition = Position.Top,
    label,
    labelStyle = {},
    labelShowBg = true,
    labelBgStyle = {},
    labelBgPadding,
    labelBgBorderRadius,
    sourceY,
    sourceX,
    targetX,
    targetY,
    curvature,
    markerEnd,
    markerStart,
    style,
}) {
    const [centerX, centerY] = getBezierCenter({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
        curvature,
    })

    const path = getBezierPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
        curvature,
    })

    return h(BaseEdge, {
        path,
        centerX,
        centerY,
        label,
        labelStyle,
        labelShowBg,
        labelBgStyle,
        labelBgPadding,
        labelBgBorderRadius,
        style,
        markerEnd,
        markerStart,
    })
}

BezierEdge.props = [
    'sourcePosition',
    'targetPosition',
    'label',
    'labelStyle',
    'labelShowBg',
    'labelBgStyle',
    'labelBgPadding',
    'labelBgBorderRadius',
    'sourceY',
    'sourceX',
    'targetX',
    'targetY',
    'curvature',
    'markerEnd',
    'markerStart',
    'style',
]
BezierEdge.inheritAttrs = false

export default BezierEdge
