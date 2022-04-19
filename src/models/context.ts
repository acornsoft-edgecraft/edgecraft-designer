import { Ref } from 'vue'
import type { Focus } from './state'
import { Options, defaultOptions } from './options'
import { createContext } from './createContext'

export interface CanvasContext {
    options: Options
    svgRef: Ref<SVGAElement | null>
    nodesRef: Ref<SVGAElement | null>
    edgesRef: Ref<SVGAElement | null>
    previewRef: Ref<SVGAElement | null>
    onFocus: (subject: Focus | null) => void
}

export const CanvasContext = createContext<CanvasContext>({
    options: defaultOptions,
    svgRef: ref(),
    nodesRef: ref(),
    edgesRef: ref(),
    previewRef: ref(),
    onFocus: (subject) => { },
})