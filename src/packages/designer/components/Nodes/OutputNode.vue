<script lang="ts" setup>
import Handle from '../Handle/Handle.vue'
import { Position } from '../../types'
import type { NodeProps } from '../../types/node'

const props = withDefaults(defineProps<NodeProps>(), {
  connectable: false,
  targetPosition: 'top' as Position,
})
</script>
<script lang="ts">
export default {
  name: 'OutputNode',
}
</script>
<template>
  <component :is="props.label" v-bind="props.label" v-if="typeof props.label !== 'string' && props.label" />
  <span v-else v-html="props.label" />
  <Handle
    type="source"
    :position="props.targetPosition"
    :is-connectable="props.connectable"
    :is-valid-connection="props.isValidTargetPos"
  />
</template>
