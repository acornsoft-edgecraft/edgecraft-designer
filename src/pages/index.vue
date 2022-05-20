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
                        <div class="designer-pane flex-grow-1 flex flex-row"
                             @drop="onDrop">
                            <K3DesignerInfraCompBar class="flex-none" />
                            <VueFlow class="designer"
                                     @dragover="onDragOver"
                                     @pane-ready="onLoad"
                                     @click="onClick"
                                     :snapToGrid="true"
                                     :snapGrid="[5, 5]">
                                <K3DesignerSaveControls />
                                <Background :gap="5" />
                                <MiniMap />
                                <Controls />
                            </VueFlow>
                        </div>
                        <div class="property-pane flex-none">
                            <K3DesignerProperty :schema="schema"
                                                :data="data"
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
import { ConnectionMode, useVueFlow, VueFlow, MiniMap, Background, Controls, SmoothStepEdge, XYPosition, FlowInstance, Node } from "~/packages/designer";
import { getMousePosition } from "~/packages/designer/components/UserSelection/utils";
import { CloudDataRows } from "~/models/designer";
import { SchemaType, RowType } from "~/packages/liveform";
const { onConnect, nodes, edges, addEdges, addNodes, instance, getSelectedNodes, getSelectedEdges, getSelectedElements, store, updateNodePosition } = useVueFlow({
    fitViewOnInit: true,
    connectionMode: ConnectionMode.Loose,
    nodes: [
        { id: '1', type: 'input', label: 'Node 1', position: { x: 250, y: 5 }, class: 'light' },
        {
            id: '2',
            label: 'Node 2',
            position: { x: 100, y: 100 },
            class: 'light',
            style: { backgroundColor: 'rgba(255, 0, 0, 0.8)', width: '200px', height: '200px' },
        },
        {
            id: '2a',
            label: 'Node 2a',
            position: { x: 10, y: 50 },
            parentNode: '2',
        },
        { id: '3', label: 'Node 3', position: { x: 320, y: 100 }, class: 'light' },
        {
            id: '4',
            label: 'Node 4',
            position: { x: 320, y: 200 },
            class: 'light',
            style: { backgroundColor: 'rgba(255, 0, 0, 0.7)', width: '300px', height: '300px' },
        },
        {
            id: '4a',
            label: 'Node 4a',
            position: { x: 15, y: 65 },
            class: 'light',
            extent: 'parent',
            parentNode: '4',
        },
        {
            id: '4b',
            label: 'Node 4b',
            position: { x: 15, y: 120 },
            class: 'light',
            style: { backgroundColor: 'rgba(255, 0, 255, 0.7)', height: '150px', width: '270px' },
            parentNode: '4',
        },
        {
            id: '4b1',
            label: 'Node 4b1',
            position: { x: 20, y: 40 },
            class: 'light',
            parentNode: '4b',
        },
        {
            id: '4b2',
            label: 'Node 4b2',
            position: { x: 100, y: 100 },
            class: 'light',
            parentNode: '4b',
        },
    ],
    edges: [
        { id: 'e1-2', source: '1', target: '2', animated: true },
        { id: 'e1-3', source: '1', target: '3' },
        { id: 'e2a-4a', source: '2a', target: '4a' },
        { id: 'e3-4', source: '3', target: '4' },
        { id: 'e3-4b', source: '3', target: '4b' },
        { id: 'e4a-4b1', source: '4a', target: '4b1' },
        { id: 'e4a-4b2', source: '4a', target: '4b2' },
        { id: 'e4b1-4b2', source: '4b1', target: '4b2' },
    ],
    //edgeTypes: { default: SmoothStepEdge },
});
/**
 * 여기서는 해당 화면 생성 이전에 처리할 설정을 구성합니다.
 * this 등의 사용이 불가능합니다.
 */
// imports
// Page meta
definePageMeta({ layout: "default", title: "CLOUD Designer PoC", public: false });
// Props
// const props = defineProps({}),
// Emits
// const emits = defineEmits(['eventname']),
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
const getNodeInfo = (nodeType) => {
    let type = nodeType
    let label = `${type}`
    const data = {
        name: label,
        enabled: true
    } as any;

    // switch (nodeType) {
    //     case "bmcloud":
    //     case 'oscloud':
    //         type = 'cloud';
    //         label = `${nodeType === 'bmcloud' ? 'Baremetal' : 'Openstack'} Cloud`;
    //         data.name = label;
    //         data.cloudType = CloudType.Baremetal;
    //         data.masterCount = 1;
    //         data.workerCount = 3;
    //         break;
    //     default:
    //         break;
    // }

    return { type, label, data }
}
const onClick = () => {
    if (getSelectedNodes.value.length > 0) {
        const node = getSelectedNodes.value[0];
        switch (node.type) {
            case 'cloud':
                schema.value.rows = CloudDataRows as ReadonlyArray<RowType>;
                break;
        }
        data.value = node.data;
        if (!node.data?.enabled) node.data.enabled = true;
        data.value.enabled = true;
        data.value.id = node.id;
    }
    if (getSelectedEdges.value.length > 0) {
    }
    if (getSelectedElements.value.length > 0) {
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
    // TODO: Cloud 동시 존재 방지
    if (instance.value) {
        const { type, label, data } = getNodeInfo(event.dataTransfer?.getData("application/vueflow"));
        const position = getPosition(event);
        const _id = getId();
        const newNode = {
            id: _id,
            type: type,
            position,
            label: label,
            data: data,
        } as Node;
        addNodes([newNode]);
        updateNodePosition({ id: _id, diff: { x: 0, y: 0 } });
    }
};
const onPropsChanged = (propsData) => {
    const node = store.getNode(propsData.id)
    node.label = propsData.name;
}
// Events
onConnect((params) => addEdges([params]));
onMounted(() => {
    // add nodes to parent
    addNodes([
        {
            id: "999",
            type: "output",
            label: "Added after mount",
            position: { x: 20, y: 100 },
            class: "light",
            resizeParent: true,
            parentNode: "2",
        },
    ]);
});
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
