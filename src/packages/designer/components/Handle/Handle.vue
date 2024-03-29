<script lang="ts" setup>
import { useHandle, useVueFlow } from '../../composables'
import { ConnectionMode, Position } from '../../types'
import { NodeId } from '../../context'
import type { HandleProps } from '../../types/handle'

const { connectionStartHandle, connectionMode } = useVueFlow()
const props = withDefaults(defineProps<HandleProps>(), {
  type: 'source',
  position: 'top' as Position,
  connectable: true,
})

const nodeId = inject(NodeId, '')

const handleId = computed(
  () => props.id ?? (connectionMode.value === ConnectionMode.Strict ? null : `${nodeId}__handle-${props.position}`),
)

const { onMouseDown, onClick } = useHandle()
const onMouseDownHandler = (event: MouseEvent) =>
  onMouseDown(event, handleId.value, nodeId, props.type === 'target', props.isValidConnection, undefined)
const onClickHandler = (event: MouseEvent) => onClick(event, handleId.value ?? null, nodeId, props.type, props.isValidConnection)

const getClasses = computed(() => {
  return [
    'vue-flow__handle',
    `vue-flow__handle-${props.position}`,
    `vue-flow__handle-${handleId.value}`,
    'nodrag',
    {
      source: props.type !== 'target',
      target: props.type === 'target',
      connectable: props.connectable,
      connecting:
        connectionStartHandle.value?.nodeId === nodeId &&
        connectionStartHandle.value?.handleId === handleId.value &&
        connectionStartHandle.value?.type === props.type,
    },
  ]
})
</script>
<script lang="ts">
export default {
  name: 'Handle',
}
</script>
<template>
  <div :data-handleid="handleId"
       :data-nodeid="nodeId"
       :data-handlepos="props.position"
       :class="getClasses"
       @mousedown="onMouseDownHandler"
       @click="onClickHandler">
    <slot :node-id="nodeId"
          v-bind="props"></slot>
  </div>
</template>
