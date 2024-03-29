<script lang="ts" setup>
import Viewport from '../Viewport/Viewport.vue'
import { createHooks, useHooks } from '../../store'
import { useVueFlow } from '../../composables'
import type { FlowProps } from '../../types/flow'
import { Slots } from '../../context'
import useWatch from './watch'

const props = withDefaults(defineProps<FlowProps>(), {
  snapToGrid: undefined,
  onlyRenderVisibleElements: undefined,
  edgesUpdatable: undefined,
  nodesConnectable: undefined,
  nodesDraggable: undefined,
  elementsSelectable: undefined,
  selectNodesOnDrag: undefined,
  preventScrolling: undefined,
  zoomOnScroll: undefined,
  zoomOnPinch: undefined,
  zoomOnDoubleClick: undefined,
  panOnScroll: undefined,
  panOnDrag: undefined,
  applyDefault: undefined,
  fitViewOnInit: undefined,
  connectOnClick: undefined,
  connectionLineStyle: undefined,
})

const emit = defineEmits([...Object.keys(createHooks()), 'update:modelValue', 'update:nodes', 'update:edges'])

const modelProps = useVModels(props, emit)

const { id, hooks, getNodeTypes, getEdgeTypes, ...rest } = useVueFlow()

useWatch(modelProps, { id, hooks, getNodeTypes, getEdgeTypes, ...rest })

useHooks(emit, hooks.value)

provide(Slots, useSlots())
</script>
<script lang="ts">
export default {
  name: 'VueFlow',
}
</script>
<template>
  <div class="vue-flow">
    <Viewport :key="`renderer-${id}`">
      <template #nodes>
        <template v-for="nodeName of Object.keys(getNodeTypes)" :key="`node-${nodeName}-${id}`">
          <slot :name="`node-${nodeName}`" />
        </template>
      </template>
      <template #edges>
        <template v-for="edgeName of Object.keys(getEdgeTypes)" :key="`edge-${edgeName}-${id}`">
          <slot :name="`edge-${edgeName}`" />
        </template>
      </template>
      <template #connection-name>
        <slot name="connection-line" />
      </template>
      <slot name="zoom-pane" />
    </Viewport>
    <slot />
  </div>
</template>
