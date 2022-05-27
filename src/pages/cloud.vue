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
                       @edge-update-start="onEdgeUpdateStart"
                       @edge-update-end="onEdgeUpdateEnd"
                       @edge-update="onEdgeUpdate"
                       :edge-updatable="true"
                       :snap-to-grid="true"
                       :snap-grid="[5, 5]">
                <K3DesignerSaveControls />
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
import { VueFlow, MiniMap, Controls, Background, Node, Edge, FlowEvents, FlowInstance, useVueFlow, XYPosition, SmoothStepEdge, CloudType, ClusterComponentTypes, getDefaultCloudData, updateEdge, Position, getDefaultLoadBalancerData, getDefaultMasterData, getDefaultWorkerData, getDefaultRegistryData, getDefaultStorageServerData, getDefaultStorageClusterData, getDefaultETCDClusterData } from "~/packages/designer";
import { getMousePosition } from "~/packages/designer/components/UserSelection/utils";
import { CloudDataRows, MasterDataRows, WorkerDataRows, RegistryDataRows, LoadbalancerDataRows, StorageClusterDataRows, StorageServerDataRows, ETCDClusterDataRows } from "~/models/designer";
import { SchemaType, RowType } from "~/packages/liveform";
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

const checkAllowedNodes = (nodeType: string): boolean => {
  // 이미 Cloud 노드가 존재하는지 여부
  if (nodeType.endsWith('cloud') && store.nodes.some(n => n.type === 'cloud')) {
    return false;
  }

  return true
}

const getNodeInfo = (nodeType: string) => {
  let type = nodeType
  let label = `${type}`
  const style = {} as any;
  let data = {} as any;

  switch (nodeType) {
    case ClusterComponentTypes.BaremetalCloud:
    case ClusterComponentTypes.OpenstackCloud:
      type = 'cloud';
      label = `${nodeType === ClusterComponentTypes.BaremetalCloud ? 'Baremetal' : 'Openstack'} Cloud`;
      data = getDefaultCloudData()
      data.name = label;
      data.cloudType = nodeType === ClusterComponentTypes.BaremetalCloud ? CloudType.Baremetal : CloudType.Openstack;
      data.masterCount = 1;
      data.workerCount = 3;
      data.useExternalETCD = false
      style.width = '200px';
      style.height = '200px';
      break;
    case ClusterComponentTypes.Master:
      label = 'Master';
      data = getDefaultMasterData()
      data.name = label;
      break;
    case ClusterComponentTypes.Worker:
      label = `Worker`;
      data = getDefaultWorkerData()
      data.name = label;
      break;
    case ClusterComponentTypes.LoadBalancer:
      label = `Loadbalancer`;
      data = getDefaultLoadBalancerData()
      data.name = label;
      break;
    case ClusterComponentTypes.Registry:
      label = `Registry`;
      data = getDefaultRegistryData()
      data.name = label;
      break;
    case ClusterComponentTypes.StorageServer:
      label = `Storage Server`;
      data = getDefaultStorageServerData()
      data.name = label;
      break;
    case ClusterComponentTypes.StorageCluster:
      label = `Storage Cluster`;
      data = getDefaultStorageClusterData()
      data.name = label;
      break;
    case ClusterComponentTypes.ETCDCluster:
      label = `ETCD Cluster`;
      data = getDefaultETCDClusterData()
      data.name = label;
      break;
    default:
      break;
  }

  return { type, label, data, style }
}

const addExternalNodesForCluster = (type: ClusterComponentTypes, clusterId: string, pos: XYPosition) => {
  // find cluster node
  const clusterNode = store.nodes.filter(n => n.id === clusterId)[0]!

  function getPosition(type: ClusterComponentTypes, pos: XYPosition) {
    let xPos = 0, yPos = 0
    if (clusterNode) {
      const xGap = 50, yGap = 50
      switch (type) {
        case ClusterComponentTypes.Registry:
          xPos += pos.x + clusterNode.dimensions.width + xGap
          yPos += pos.y + (clusterNode.dimensions.height / 2) - yGap
          break;
        case ClusterComponentTypes.LoadBalancer:
          xPos += pos.x + (clusterNode.dimensions.width / 2) - xGap
          yPos += pos.y + clusterNode.dimensions.height + yGap
          break;
        case ClusterComponentTypes.StorageCluster:
          xPos += pos.x + (clusterNode.dimensions.width / 2) - xGap
          yPos += pos.y + clusterNode.dimensions.height + yGap
          break;
      }

    }
    return { x: xPos, y: yPos }
  }

  // add node
  const newNode = {} as Node;
  newNode.id = getId()
  newNode.type = type
  newNode.position = getPosition(type, pos)
  newNode.label = type.charAt(0).toUpperCase() + type.slice(1)

  switch (type) {
    case ClusterComponentTypes.Registry:
      newNode.data = getDefaultRegistryData()
      break;
    case ClusterComponentTypes.LoadBalancer:
      newNode.data = getDefaultLoadBalancerData()
      break;
    case ClusterComponentTypes.StorageCluster:
      newNode.data = getDefaultStorageClusterData()
      break;
  }

  store.addNodes([newNode])

  // add edges (source is node, target is cloud)
  nextTick(() => {
    const node = store.nodes.filter(n => n.id === newNode.id)[0]!
    if (node) {
      const newEdges = []
      const id = `${node.id}-${clusterNode.id}`
      switch (type) {
        case ClusterComponentTypes.Registry:
          if (!store.edges.some(e => (e.sourceNode === node && e.targetNode === clusterNode) || (e.sourceNode === clusterNode && e.targetNode === node))) {
            newEdges.push({ id, source: node.id, target: clusterNode.id, sourceHandle: 'left', targetHandle: 'right' })
          }
          break;
        case ClusterComponentTypes.LoadBalancer:
        case ClusterComponentTypes.StorageCluster:
          if (!store.edges.some(e => (e.sourceNode === node && e.targetNode === clusterNode) || (e.sourceNode === clusterNode && e.targetNode === node))) {
            newEdges.push({ id, source: node.id, target: clusterNode.id, sourceHandle: 'top', targetHandle: 'bottom' })
          }
          break;
      }

      store.addEdges(newEdges)
    }
  })
}

const onClick = () => {
  if (store.getSelectedNodes.length > 0) {
    const node = store.getSelectedNodes[0];
    data.value = undefined;
    switch (node.type) {
      case ClusterComponentTypes.Master:
        schema.value.rows = MasterDataRows as ReadonlyArray<RowType>;
        break;
      case ClusterComponentTypes.Worker:
        schema.value.rows = WorkerDataRows as ReadonlyArray<RowType>;
        break;
      case ClusterComponentTypes.Registry:
        schema.value.rows = RegistryDataRows as ReadonlyArray<RowType>;
        break;
      case ClusterComponentTypes.LoadBalancer:
        schema.value.rows = LoadbalancerDataRows as ReadonlyArray<RowType>;
        break;
      case ClusterComponentTypes.StorageCluster:
        schema.value.rows = StorageClusterDataRows as ReadonlyArray<RowType>;
        break;
      case ClusterComponentTypes.StorageServer:
        schema.value.rows = StorageServerDataRows as ReadonlyArray<RowType>;
        break;
      case ClusterComponentTypes.ETCDCluster:
        schema.value.rows = ETCDClusterDataRows as ReadonlyArray<RowType>;
        break;
      case 'cloud':
        schema.value.rows = CloudDataRows as ReadonlyArray<RowType>;
        break;
    }
    data.value = node.data;
  } else {
    schema.value.rows = [];
    data.value = undefined;
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
    const { type, label, data, style } = getNodeInfo(event.dataTransfer?.getData("application/vueflow"));
    if (checkAllowedNodes(type)) {
      const position = getPosition(event);
      const _id = getId();
      const newNode = {
        id: _id,
        type: type,
        position,
        label: label,
        data: data,
        style: style
      } as Node;
      store.addNodes([newNode]);

      // 추가된 Node에 해당하는 후 작업 처리
      nextTick(() => {
        switch (type) {
          case 'cloud':
            // Cluster에 연계할 Registry 추가
            addExternalNodesForCluster(ClusterComponentTypes.Registry, _id, position)
            // Cluster에 연계할 External L/B 추가
            addExternalNodesForCluster(ClusterComponentTypes.LoadBalancer, _id, position)
            // Openstack Case
            if (data.cloudType === CloudType.Openstack) {
              // Cluster에 연계할 Ceph Storage Cluster 추가
              addExternalNodesForCluster(ClusterComponentTypes.StorageCluster, _id, position)
            }
            break;
        }
      })
    } else {
      // TODO: Message
      alert('Not Allowed')
    }
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
