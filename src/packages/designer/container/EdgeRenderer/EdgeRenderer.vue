<script lang="ts" setup>
import EdgeWrapper from '../../components/Edges/EdgeWrapper.vue'
import ConnectionLine from '../../components/ConnectionLine/ConnectionLine.vue'
import { useVueFlow } from '../../composables'
import { groupEdgesByZLevel } from '../../utils'
import MarkerDefinitions from './MarkerDefinitions.vue'

const { store } = useVueFlow()

const sourceNode = controlledComputed(
  () => store.connectionNodeId,
  () => {
    if (store.connectionNodeId) return store.getNode(store.connectionNodeId)
    return false
  },
)

const connectionLineVisible = controlledComputed(
  () => store.connectionNodeId,
  () =>
    !!(
      sourceNode.value &&
      (typeof sourceNode.value.connectable === 'undefined' ? store.nodesConnectable : sourceNode.value.connectable) &&
      store.connectionNodeId &&
      store.connectionHandleType
    ),
)

const getNode = (node: string) => store.getNode(node)!

const groups = computed(() => groupEdgesByZLevel(store.getEdges, getNode))
</script>
<script lang="ts">
export default {
  name: 'Edges',
}
</script>
<template>
  <svg v-for="group of groups" :key="group.level" class="vue-flow__edges vue-flow__container" :style="`z-index: ${group.level}`">
    <MarkerDefinitions v-if="group.isMaxLevel" :default-color="store.defaultMarkerColor" />
    <g>
      <EdgeWrapper
        v-for="edge of group.edges"
        :id="edge.id"
        :key="edge.id"
        :edge="edge"
        :source-node="getNode(edge.source)"
        :target-node="getNode(edge.target)"
        :selectable="typeof edge.selectable === 'undefined' ? store.elementsSelectable : edge.selectable"
        :updatable="typeof edge.updatable === 'undefined' ? store.edgesUpdatable : edge.updatable"
      />
      <ConnectionLine v-if="connectionLineVisible && !!sourceNode" :source-node="sourceNode" />
    </g>
  </svg>
</template>
