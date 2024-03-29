<script lang="ts" setup>
import { ClusterComponentTypes, EdgeChange, GraphNode, GraphEdge, NodeChange } from '../../types'
import { useVueFlow, useKeyPress } from '../../composables'
import { getConnectedEdges } from '../../utils'
import NodesSelection from '../../components/NodesSelection/NodesSelection.vue'
import UserSelection from '../../components/UserSelection/UserSelection.vue'

const { id, store, deleteKeyCode, selectionKeyCode, multiSelectionKeyCode } = useVueFlow()

const onClick = (event: MouseEvent) => {
  store.hooks.paneClick.trigger(event)
  store.nodesSelectionActive = false
  store.resetSelectedElements()
}

const onContextMenu = (event: MouseEvent) => store.hooks.paneContextMenu.trigger(event)

const onWheel = (event: WheelEvent) => store.hooks.paneScroll.trigger(event)

/**
 * 클러스터 멤버 노드인지 검증
 * @param node 검증 대상 노드
 */
const isClusterMemberNode = (node: GraphNode): boolean => {
  return node.parentNode && Object.values(ClusterComponentTypes).includes(node.type as ClusterComponentTypes)
}
/**
 * 클러스터 멤버 노드에 대한 연결인지 검증
 * @param edge 검증 대상 연결
 */
const isClusterMemberEdge = (edge: GraphEdge): boolean => {
  return (edge.sourceNode.parentNode && Object.values(ClusterComponentTypes).includes(edge.sourceNode.type as ClusterComponentTypes)) ||
    (edge.targetNode.parentNode && Object.values(ClusterComponentTypes).includes(edge.targetNode.type as ClusterComponentTypes))
}

useKeyPress(deleteKeyCode, (keyPressed) => {
  // MOD: 클러스터의 멤버 노드인 경우는 수동 삭제 불가
  const selectedNodes = store.getSelectedNodes.filter(n => !isClusterMemberNode(n))
  const selectedEdges = store.getSelectedEdges.filter(e => !isClusterMemberEdge(e))

  if (keyPressed && (selectedNodes || selectedEdges)) {
    const connectedEdges = (selectedNodes && getConnectedEdges(selectedNodes, store.edges)) ?? []

    const nodeChanges: NodeChange[] = selectedNodes.map((n) => ({ id: n.id, type: 'remove' }))
    const edgeChanges: EdgeChange[] = [...selectedEdges, ...connectedEdges].map((e) => ({
      id: e.id,
      type: 'remove',
    }))

    store.hooks.edgesChange.trigger(edgeChanges)
    store.hooks.nodesChange.trigger(nodeChanges)

    store.nodesSelectionActive = false
    store.resetSelectedElements()
  }
})

useKeyPress(multiSelectionKeyCode, (keyPressed) => {
  store.multiSelectionActive = keyPressed
})

const selectionKeyPressed = useKeyPress(selectionKeyCode, (keyPressed) => {
  if (store.userSelectionActive && keyPressed) return
  store.userSelectionActive = keyPressed && store.elementsSelectable
})
</script>
<script lang="ts">
export default {
  name: 'SelectionPane',
  inheritAttrs: false,
}
</script>
<template>
  <UserSelection v-if="selectionKeyPressed"
                 :key="`user-selection-${id}`" />
  <NodesSelection v-if="store.nodesSelectionActive"
                  :key="`nodes-selection-${id}`" />
  <div :key="`flow-pane-${id}`"
       class="vue-flow__pane vue-flow__container"
       @click="onClick"
       @contextmenu="onContextMenu"
       @wheel="onWheel" />
</template>
