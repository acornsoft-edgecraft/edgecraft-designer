CloudTypesgetNewNodeInfo<template>
  <div class="page-container">
    <suspense timeout="0">
      <template #default>
        <div class="page-wrapper">
          <section class="page-header">
            <K3PageTitle />
          </section>
          <section class="page-content flex flex-row">
            <!-- Content here -->
            <div class="designer-pane flex-grow-1 flex flex-row"
                 @drop="onDrop">
              <K3DesignerClusterCompBar class="flex-none" />
              <VueFlow class="designer"
                       @dragover="onDragOver"
                       @pane-ready="onLoad"
                       @click="onClick"
                       @edge-update-start="onEdgeUpdateStart"
                       @edge-update-end="onEdgeUpdateEnd"
                       @edge-update="onEdgeUpdate"
                       :edge-updatable="true"
                       :snap-to-grid="true"
                       :snap-grid="[5, 5]">
                <K3DesignerManageControls />
                <Background :gap="5" />
                <MiniMap />
                <Controls />
              </VueFlow>
            </div>
            <div class="property-pane flex-none">
              <K3DesignerProperty :schema="schema"
                                  v-model="data"
                                  keyField="name"
                                  @change="onPropsChanged" />
            </div>
          </section>
        </div>
      </template>
      <template #fallback>
        <div class="flex justify-content-center">
          <K3ProgressSpinner style="width: 50px; height: 50px"
                             strokeWidth="8"
                             fill="var(--surface-ground)"
                             animationDuration=".5s" />
        </div>
      </template>
    </suspense>
  </div>
</template>

<script setup lang="ts">
import {
  VueFlow, MiniMap, Controls, Background, Node, Edge, FlowEvents, FlowInstance, SmoothStepEdge, XYPosition, updateEdge, useVueFlow,
  CloudTypes, ClusterComponentTypes, Helper, getMousePosition
} from "~/packages/designer";

import { SchemaType } from "~/packages/liveform";

const { instance, onConnect, store, } = useVueFlow({
  fitViewOnInit: true,
  edgeTypes: { default: SmoothStepEdge },
  edgesUpdatable: true
});

/**
 * 여기서는 해당 화면 생성 이전에 처리할 설정을 구성합니다.
 * this 등의 사용이 불가능합니다.
 */
// imports
// Page meta
definePageMeta({ layout: "default", title: "Platform APP Designer PoC", public: false });
// Props
// Emits
// Properties
let id = 0;
const getId = () => `dndnode_${id++}`;
const schema = ref<SchemaType>({
  labelWidth: "150px",
  rows: []
});
const data = ref();
// Compputed
// Watcher
// Methods
const getPosition = (event) => {
  const relatedPos = getMousePosition(event) as XYPosition;
  const pos = instance.value.project({ x: relatedPos.x, y: relatedPos.y - 40 });
  return pos;
};
const checkAllowedNodes = (nodeType: string): boolean => {
  // 이미 Cluster 노드가 존재하는지 여부
  if (nodeType.endsWith('capi') && store.nodes.some(n => n.type === 'capi')) {
    return false;
  }

  return true
}

const onClick = () => {
  const { rows, data: nodeData } = Helper.getSelectedNodeSchema()
  schema.value.rows = rows
  data.value = nodeData
};
const onLoad = (flowInstance: FlowInstance) => {
  flowInstance.fitView();
};
const onDragOver = (event: DragEvent) => {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "move";
  }
};
// Add new node on drag-stop event.
const onDrop = (event: DragEvent) => {
  if (instance.value) {
  }
};
const onPropsChanged = (propsData) => {
  const node = store.getNode(propsData.id)
  node.label = propsData.name;
}

const onEdgeUpdateStart = (edge: Edge) => { }
const onEdgeUpdateEnd = (edge: Edge) => { }
const onEdgeUpdate = ({ edge, connection }: FlowEvents['edgeUpdate']) => { updateEdge(edge, connection, [...store.nodes, ...store.edges]) }

// Events
onConnect((params) => store.addEdges([params]));

onMounted(() => { });
// Logics (like api call, etc)
</script>

<style scoped lang="scss">
.page-container {
  .page-wrapper {
    .page-content {
      height: calc(100vh - 160px);
      margin: 0;
      padding: 0;

      .designer-pane {
        .designer {
          width: 100%;
          height: 100%;
          background-color: white;
        }
      }

      .property-pane {
        background-color: lightgray;
        height: 100%;
        width: 20%;
      }
    }
  }
}
</style>
