import { createHooks } from './hooks'
import {
  ConnectionMode,
  State,
  PanOnScrollMode,
  DefaultNodeTypes,
  DefaultEdgeTypes,
  ConnectionLineType,
  FlowOptions,
} from '~/packages/designer/types'
import {
  DefaultNode,
  InputNode,
  OutputNode,
  BezierEdge,
  SmoothStepEdge,
  StepEdge,
  StraightEdge,
  SimpleBezierEdge,
} from '~/packages/designer/components'

export const defaultNodeTypes: DefaultNodeTypes = {
  input: InputNode,
  default: DefaultNode,
  output: OutputNode,
}

export const defaultEdgeTypes: DefaultEdgeTypes = {
  default: BezierEdge,
  straight: StraightEdge,
  step: StepEdge,
  smoothstep: SmoothStepEdge,
  simplebezier: SimpleBezierEdge,
}

const isDef = <T>(val: T): val is NonNullable<T> => typeof val !== 'undefined'

const defaultState = (): State => ({
  nodes: [],
  edges: [],

  paneReady: false,
  initialized: false,
  instance: null,

  dimensions: {
    width: 0,
    height: 0,
  },
  transform: [0, 0, 1],

  d3Zoom: null,
  d3Selection: null,
  d3ZoomHandler: null,
  minZoom: 0.5,
  maxZoom: 2,

  translateExtent: [
    [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
    [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY],
  ],
  nodeExtent: [
    [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
    [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY],
  ],

  preventScrolling: true,
  zoomOnScroll: true,
  zoomOnPinch: true,
  zoomOnDoubleClick: true,
  panOnScroll: false,
  panOnScrollSpeed: 0.5,
  panOnScrollMode: PanOnScrollMode.Free,
  panOnDrag: true,
  edgeUpdaterRadius: 10,
  onlyRenderVisibleElements: false,
  defaultZoom: 1,
  defaultPosition: [0, 0],

  nodesSelectionActive: false,
  userSelectionActive: false,
  selectedNodesBbox: { x: 0, y: 0, width: 0, height: 0 },

  defaultMarkerColor: '#b1b1b7',
  connectionLineStyle: {},
  connectionLineType: ConnectionLineType.Bezier,
  connectionNodeId: null,
  connectionHandleId: null,
  connectionHandleType: null,
  connectionPosition: { x: NaN, y: NaN },
  connectionMode: ConnectionMode.Loose,
  connectionStartHandle: null,
  connectOnClick: true,

  snapGrid: [15, 15],
  snapToGrid: false,

  edgesUpdatable: false,
  nodesConnectable: true,
  nodesDraggable: true,
  elementsSelectable: true,
  selectNodesOnDrag: true,
  multiSelectionActive: false,
  selectionKeyCode: 'Shift',
  multiSelectionKeyCode: 'Meta',
  zoomActivationKeyCode: 'Meta',
  deleteKeyCode: 'Backspace',

  hooks: createHooks(),

  applyDefault: true,

  fitViewOnInit: false,
  noDragClassName: 'nodrag',
  noWheelClassName: 'nowheel',
  noPanClassName: 'nopan',
  defaultEdgeOptions: undefined,

  vueFlowVersion: "0.4.1",
})

export default (opts?: FlowOptions): State => {
  const state = defaultState()
  if (opts) {
    Object.keys(opts).forEach((o) => {
      const option = opts[o as keyof typeof opts]
      if (isDef(option)) (state as any)[o] = option
    })
  }

  return state
}
