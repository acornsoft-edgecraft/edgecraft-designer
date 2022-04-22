<template>
  <div class="page-container">
    <suspense timeout="0">
      <template #default>
        <div class="page-wrapper">
          <section class="page-header">
            <K3PageTitle />
          </section>
          <section class="page-content flex flex-row">
            <!-- Content here -->
            <div class="designer-pane mt-2 flex-grow-1 flex flex-row" @drop="onDrop">
              <K3DesignerCompBar class="comp-bar flex-none" />
              <VueFlow class="designer" @dragover="onDragOver" @pane-ready="onLoad" @click="onClick" :snapToGrid="true">
                <K3DesignerSaveControls />
                <Background />
                <MiniMap />
                <Controls />
              </VueFlow>
            </div>
            <div class="property-pane mt-2 flex-none">
              <K3DesignerProperty :schema="schema" :data="data" />
            </div>
          </section>
        </div>
      </template>
      <template #fallback>
        <div class="flex justify-content-center">
          <K3ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" />
        </div>
      </template>
    </suspense>
  </div>
</template>

<script setup lang="ts">
import { VueFlow, MiniMap, Controls, Background, Node, FlowInstance, useVueFlow } from "~/packages/designer";
import { InputNodeTypes, DefaultNodeTypes, OutputNodeTypes } from "~/models/designer";
/**
 * 여기서는 해당 화면 생성 이전에 처리할 설정을 구성합니다.
 * this 등의 사용이 불가능합니다.
 */
// imports
// Page meta
definePageMeta({ layout: "default", title: "Designer PoC", public: false });
// Props
// const props = defineProps({}),
// Emits
// const emits = defineEmits(['eventname']),
// Properties
let id = 0;
const getId = () => `dndnode_${id++}`;
const { instance, onConnect, addEdges, addNodes, getSelectedNodes, getSelectedElements, getSelectedEdges } = useVueFlow({
  nodes: [
    {
      id: "1",
      type: "input",
      label: "input node",
      position: { x: 250, y: 5 },
      metadata: { name: "input_schema" },
    },
  ],
});

const schema = ref({
  labelWidth: "120px",
  rows: [
    {
      type: "text",
      readonly: false,
      field: "name",
      options: "",
      optionLabel: "",
      optionValue: "",
      label: "name",
      columns: [],
      criteria: ["enabled", "==", true],
    },
    {
      type: "date",
      field: "date",
      label: "date",
    },
    {
      type: "number",
      field: "number",
      label: "number",
    },
    {
      type: "text",
      field: "description",
      label: "description",
    },
    {
      field: "password",
      type: "password",
      label: "password",
    },
    {
      type: "text",
      readonly: true,
      field: "description",
      label: "readonly",
    },
    {
      type: "checkbox",
      field: "enabled",
      label: "show name field",
    },
    {
      type: "textarea",
      field: "name",
      label: "textarea",
    },
    {
      type: "radio",
      field: "select",
      label: "Radio example 1",
      optionLabel: "name",
      optionValue: "value",
      options: [
        {
          name: "Inline Option A",
          value: "A",
        },
        {
          name: "Inline Option B",
          value: "B",
        },
        {
          name: "Inline Option C",
          value: "C",
        },
      ],
    },
    {
      type: "radio",
      field: "select",
      label: "Radio example 2",
      options: "sampleArray",
      optionLabel: "label",
      optionValue: "value",
    },
    {
      type: "radio",
      field: "select",
      label: "Radio example 3",
      options: ["A", "B", "C", "D"],
    },
    {
      type: "select",
      field: "select",
      label: "Select example 1",
      optionLabel: "name",
      optionValue: "value",
      options: [
        {
          name: "Inline Option A",
          value: "A",
        },
        {
          name: "Inline Option B",
          value: "B",
        },
        {
          name: "Inline Option C",
          value: "C",
        },
      ],
    },
    {
      type: "select",
      field: "select",
      label: "Select example 2",
      options: "sampleArray",
      optionLabel: "label",
      optionValue: "value",
    },
    {
      type: "select",
      field: "select",
      label: "Select example 3",
      options: ["A", "B", "C", "D"],
    },
    {
      type: "nested",
      field: "nested",
      label: "Nested Editor",
      columns: [
        {
          type: "text",
          field: "name",
          label: "username",
        },
        {
          type: "select",
          field: "role",
          label: "role",
          options: ["user", "admin", "super-admin"],
        },
        {
          type: "nested",
          field: "relationships",
          label: "friends",
          columns: [
            {
              type: "text",
              field: "name",
              label: "name",
            },
            {
              type: "select",
              field: "relationship",
              label: "relationship",
              options: ["friend", "family", "enemy"],
            },
          ],
        },
      ],
    },
  ],
});
const data = ref();
data.value = {
  name: "Test component",
  description: "lorem ipsum",
  password: "Secret!",
  enabled: true,
  date: "2020-12-03",
  number: 42,
  select: "A",
  sampleArray: [
    {
      label: "External Option A",
      value: "A",
    },
    {
      label: "External Option B",
      value: "B",
    },
  ],
  nested: [
    {
      name: "Bob",
      role: "admin",
      value: "50",
      relationships: [
        {
          name: "Jim",
          relationship: "friend",
        },
      ],
    },
    {
      name: "Ann",
      role: "user",
      value: "Bob",
      relationships: [
        {
          name: "Jim",
          relationship: "friend",
        },
      ],
    },
  ],
};
// Compputed
// Watcher
// Methods

const onClick = () => {
  if (getSelectedNodes.value.length > 0) {
    console.log(`selected nodes: ${JSON.stringify(getSelectedNodes.value[0])}`);
    const node = getSelectedNodes.value[0];
    switch (node.type) {
      case "input":
        schema.value.rows = InputNodeTypes;
        break;
      case "default":
        schema.value.rows = DefaultNodeTypes;
        break;
      case "output":
        schema.value.rows = OutputNodeTypes;
        break;
    }
    data.value = node.metadata;
    data.value["enabled"] = true;
    data.value["id"] = node.id;
  }
  if (getSelectedEdges.value.length > 0) {
    console.log(`selected edges: ${JSON.stringify(getSelectedEdges.value[0])}`);
  }
  if (getSelectedElements.value.length > 0) {
    console.log(`selected elements: ${JSON.stringify(getSelectedElements.value[0])}`);
  }
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
    const type = event.dataTransfer?.getData("application/vueflow");
    const position = instance.value.project({ x: event.clientX - 500, y: event.clientY - 200 });
    const newNode = {
      id: getId(),
      type,
      position,
      label: `${type} node`,
      metadata: { name: "test-node" },
    } as Node;
    addNodes([newNode]);
  }
};
// Events
onConnect((params) => addEdges([params]));
onMounted(() => {});
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
        .comp-bar {
          height: 100%;
          background-color: lightgray;
        }
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
