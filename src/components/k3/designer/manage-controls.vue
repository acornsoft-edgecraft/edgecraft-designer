<template>
  <div class="manage__controls">
    <button @click="onArrange">Rearrange</button>
    <button @click="onSelectAll">Select all</button>
    <button @click="onSave">Save</button>
    <button @click="onRestore">Restore</button>
  </div>
</template>

<script setup lang="ts">
/**
 * 여기서는 해당 화면 생성 이전에 처리할 설정을 구성합니다.
 * this 등의 사용이 불가능합니다.
 */
// imports
import { useZoomPanHelper, FlowExportObject, useVueFlow, adjustSiblings } from "~/packages/designer";
// Props
// const props = defineProps({})
// Emits
// const emits = defineEmits(['eventname'])
// Properties
const { setTransform } = useZoomPanHelper();
const { getNodes, setNodes, setEdges, nodesSelectionActive, instance, addSelectedNodes } = useVueFlow();
const flowKey = "example-flow";
const state = useStorage<FlowExportObject>(flowKey, {
  nodes: [],
  edges: [],
  position: [NaN, NaN],
  zoom: 1,
});
// Compputed
// Watcher
// Methods
const onArrange = () => {
  adjustSiblings()
}

const onSelectAll = () => {
  addSelectedNodes(getNodes.value)
  nodesSelectionActive.value = true;
}

const onSave = () => {
  state.value = instance.value?.toObject();
};

const onRestore = () => {
  const flow: FlowExportObject | null = state.value;

  if (flow) {
    const [x = 0, y = 0] = flow.position;
    setNodes(state.value.nodes);
    setEdges(state.value.edges);
    setTransform({ x, y, zoom: flow.zoom || 0 });
  }
};
// Events
// Logics (like api call, etc)
</script>

<style scoped lang="scss">
.manage__controls {
  position: absolute;
  right: 10px;
  top: 10px;
  z-index: 4;
  font-size: 12px;

  button {
    margin-left: 5px;
  }
}
</style>
