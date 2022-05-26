<template>
    <div class="cloud-container"
         @drop="onDrop">
        <component :is="props.label"
                   v-if="typeof props.label !== 'string' && props.label" />
        <span v-html="props.label" />
    </div>
    <Handle id="left"
            type="source"
            :position="Position.Left" />
    <Handle id="top"
            type="source"
            :position="Position.Top" />
    <Handle id="right"
            type="source"
            :position="Position.Right" />
    <Handle id="bottom"
            type="source"
            :position="Position.Bottom" />
</template>

<script setup lang="ts">

import { Position, Node, GraphNode, ClusterComponentTypes, useVueFlow } from "../../../index";
import Handle from "../../Handle/Handle.vue";
import type { NodeProps } from "../../../types/node";
import { useCloudHelper } from "../../../composables";
import { getDefaultETCDClusterData, getDefaultLoadBalancerData, getDefaultMasterData, getDefaultRegistryData, getDefaultStorageClusterData, getDefaultStorageServerData, getDefaultWorkerData } from "../../../types";

const { onNodeDragStop, instance, store } = useVueFlow();
const props = defineProps<NodeProps>()
const node = store.getNode(props.id)
const allowTypes = []
const ids = new Map<ClusterComponentTypes, number>([[ClusterComponentTypes.LoadBalancer, 0], [ClusterComponentTypes.ETCDCluster, 0]])
let isMasterHA = false;

const { masters, workers, haProxy, etcdCluster, arrangeMembers } = useCloudHelper(store, props.id)

// const masters = computed(() => store.nodes.filter(n => n.type === ClusterComponentTypes.Master && n.parentNode === node.id))
// const workers = computed(() => store.nodes.filter(n => n.type === ClusterComponentTypes.Worker && n.parentNode === node.id))
// const haProxy = computed(() => store.getNodes.filter(n => n.type === ClusterComponentTypes.LoadBalancer && n.parentNode === node.id)[0]!)
// const etcdCluster = computed(() => store.getNodes.filter(n => n.type === ClusterComponentTypes.ETCDCluster && n.parentNode === node.id)[0]!)

//const rootMaster = computed(() => store.nodes.filter(n => n.type === ClusterComponentTypes.Master && n.id.endsWith('0'))[0])
//const hasInternalLB = computed(() => store.nodes.some(n => n.type === ClusterComponentTypes.LoadBalancer))

watch(() => props.data.masterCount, (newVal, oldVal) => {
    if (newVal < 1) {
        // TODO: Message 처리
        alert('Master 갯수 확인')
        props.data.masterCount = oldVal;
        return;
    }

    processNodes(ClusterComponentTypes.Master, oldVal, true)
    processNodes(ClusterComponentTypes.Master, newVal)

    nextTick(() => { arrangeMembers() })
})

watch(() => props.data.useExternalETCD, (newVal, oldVal) => {
    if (oldVal === newVal) return;

    masters.value.forEach(m => {
        m.data.hasETCD = !newVal
    })

    processNodes(ClusterComponentTypes.ETCDCluster, 1, !newVal)

    nextTick(() => { arrangeMembers() })
})

watch(() => props.data.workerCount, (newVal, oldVal) => {
    if (oldVal === newVal) return;

    processNodes(ClusterComponentTypes.Worker, oldVal, true)
    processNodes(ClusterComponentTypes.Worker, newVal)

    nextTick(() => { arrangeMembers() })
})

// const removeNodes = (nodeCount, isMaster = false) => {
//   const nodeChanges: NodeChange[] = store.getNodes.filter(item => item.parentNode === node.id && (isMaster ? item.type === ClusterComponentTypes.Master : item.type !== ClusterComponentTypes.Master)).map(item => ({ id: item.id, type: 'remove' }));
//   store.hooks.nodesChange.trigger(nodeChanges)
// }
// const addNodes = (nodeCount, isMaster = false) => {
//   const newNodes = []s
//   const nodeName = isMaster ? ClusterComponentTypes.Master : ClusterComponentTypes.Worker
//   for (let i = 0; i < nodeCount; i++) {
//     //TODO: Master/Worker, ... 구분 처리
//     //TODO: Position 배분 및 정리
//     //TODO: Cluster Sizing (Dimension) 처리
//     newNodes.push({
//       id: `${nodeName}_${i}`,
//       type: isMaster ? ClusterComponentTypes.Master : ClusterComponentTypes.Worker,
//       //position: instance.value.project({ x: node.computedPosition.x - 200, y: node.computedPosition.y + (i * 35) - 80 }),
//       position: getNodePosition(isMaster, i), // { x: 20, y: (i * 40) + 50 },
//       label: `${nodeName} Node #${i}`,
//       parentNode: node.id,
//       resizeParent: true,
//       data: getNodeData(isMaster),
//     } as Node);
//   }
//   store.addNodes(newNodes);
// }

const getNodeData = (type: ClusterComponentTypes, label: string) => {
    let data = {} as any;

    switch (type) {
        case ClusterComponentTypes.Master:
            data = getDefaultMasterData()
            break;
        case ClusterComponentTypes.Worker:
            data = getDefaultWorkerData()
            break;
        case ClusterComponentTypes.LoadBalancer:
            data = getDefaultLoadBalancerData()
            break;
        case ClusterComponentTypes.Registry:
            data = getDefaultRegistryData()
            break;
        case ClusterComponentTypes.StorageServer:
            data = getDefaultStorageServerData()
            break;
        case ClusterComponentTypes.StorageCluster:
            data = getDefaultStorageClusterData()
            break;
        case ClusterComponentTypes.ETCDCluster:
            data = getDefaultETCDClusterData()
            break;
    }

    data.name = label;
    return data
}

const getNodePosition = (type: ClusterComponentTypes, seq: number) => {
    const basePos = { x: 20, y: 40 }

    if (allowTypes.includes(type)) {
        // Drop 생성 기본 포지션
        return basePos
    } else {
        // MasterHA 여부에 따른 LB 위치 조정

        const width = 150;
        const yGap = isMasterHA ? 270 : 170;
        const xGap = isMasterHA ? 150 : 0
        if (type === ClusterComponentTypes.Master) {
            return {
                x: xGap + basePos.x + (width * seq),
                y: basePos.y
            }
        } else {
            return {
                x: basePos.x + (width * seq),
                y: basePos.y + yGap
            }
        }
    }
}

const getIdLabel = (type: ClusterComponentTypes, seq: number) => {
    const nodeName = type.charAt(0).toUpperCase() + type.slice(1)
    let id = ""
    let label = ""

    if (ids.has(type)) {
        const uid = ids.get(type)
        id = `${nodeName}_${uid}`
        ids.set(type, uid + 1)
        label = nodeName
    } else {
        id = `${nodeName}_${seq}`
        label = `${nodeName} Node #${seq}`
    }

    // if (allowTypes.includes(type)) {
    //     const seq = ids.get(type)
    //     id = `${nodeName}_${seq}`
    //     ids.set(type, seq + 1)
    //     label = nodeName
    // } else {
    //     id = `${nodeName}_${seq}`
    //     label = `${nodeName} Node #${seq}`
    // }

    return { id, label }
}

const removeNodes = (type: ClusterComponentTypes) => {
    const nodes = []

    switch (type) {
        // MasterHA인 경우 LB, Master
        case ClusterComponentTypes.Master:
            if (isMasterHA) {
                nodes.push(...store.nodes.filter(item => item.parentNode === node.id && item.type === ClusterComponentTypes.LoadBalancer).map(item => ({ id: item.id, type: 'remove' })))
            }
            nodes.push(...store.nodes.filter(item => item.parentNode === node.id && item.type === type).map(item => ({ id: item.id, type: 'remove' })));
            break;
        // Worker 삭제
        case ClusterComponentTypes.Worker:
            nodes.push(...store.nodes.filter(item => item.parentNode === node.id && item.type === type).map(item => ({ id: item.id, type: 'remove' })));
            break;
        // ETCD Cluster 삭제
        case ClusterComponentTypes.ETCDCluster:
            nodes.push(...store.nodes.filter(item => item.parentNode === node.id && item.type === type).map(item => ({ id: item.id, type: 'remove' })))
            break;

    }
    // 삭제할 Node에 연결된 Edges 삭제
    const edges = []
    const nodeIds = nodes.map(n => n.id)

    edges.push(...store.edges.filter(e => nodeIds.includes(e.source) || nodeIds.includes(e.target)).map(item => ({ id: item.id, type: 'remove' })))
    store.hooks.edgesChange.trigger(edges)

    // Node 삭제
    nextTick(() => {
        store.hooks.nodesChange.trigger(nodes)
    })
}

/**
 * 지정한 유형의 노드를 지정한 갯수만큼 추가 처리
 * @param type 추가할 노드 유형
 * @param nodeCount 추가할 노드 갯수
 */
const addNodes = (type: ClusterComponentTypes, nodeCount: number) => {
    // Node 추가
    const newNodes = []

    // MasterHA 케이스 처리
    if (type === ClusterComponentTypes.Master) {
        isMasterHA = nodeCount > 1
        if (isMasterHA) {
            const label = 'HAProxy'
            newNodes.push({
                id: 'haproxy_0',
                type: ClusterComponentTypes.LoadBalancer,
                position: { x: 20, y: 60 },
                label,
                parentNode: node.id,
                resizeParent: true,
                data: getNodeData(type, label),
            } as Node)
        }
    }

    // 개별 노드 추가
    for (let i = 0; i < nodeCount; i++) {
        const { id, label } = getIdLabel(type, i)
        //TODO: Master/Worker, ... 구분 처리
        //TODO: Position 배분 및 정리
        //TODO: Cluster Sizing (Dimension) 처리
        newNodes.push({
            id,
            type,
            position: getNodePosition(type, i),
            label,
            parentNode: node.id,
            resizeParent: true,
            data: getNodeData(type, label),
        } as Node);
    }

    store.addNodes(newNodes);
}

const checkEdgeExist = (source: GraphNode<any>, target: GraphNode<any>): boolean => store.edges.some(e => (e.sourceNode === source && e.targetNode === target) || (e.sourceNode === target && e.targetNode === source))

const connectMasterToLB = (newEdges: any[]) => {
    masters.value.forEach(m => {
        const id = `${haProxy.value.id}-${m.id}`
        if (!checkEdgeExist(m, haProxy.value)) {
            newEdges.push({ id, source: haProxy.value.id, target: m.id, sourceHandle: 'top', targetHandle: 'bottom' })
        }
    })
}
const connectWorkerToMaster = (newEdges: any[]) => {
    workers.value.forEach(w => {
        const id = `${masters.value[0].id}-${w.id}`
        if (!checkEdgeExist(w, masters[0])) {
            newEdges.push({ id, source: masters.value[0].id, target: w.id, sourceHandle: 'bottom', targetHandle: 'top' })
        }
    })
}
const connectWorkerToLB = (newEdges: any[]) => {
    workers.value.forEach(w => {
        const id = `${haProxy.value.id}-${w.id}`
        if (!checkEdgeExist(w, haProxy.value)) {
            newEdges.push({ id, source: haProxy.value.id, target: w.id, sourceHandle: 'bottom', targetHandle: 'top' })
        }
    })
}
const connectMasterToETCD = (newEdges: any[]) => {
    masters.value.forEach(m => {
        const id = `${etcdCluster.value.id}-${m.id}`
        if (!checkEdgeExist(m, etcdCluster.value)) {
            newEdges.push({ id, source: etcdCluster.value.id, target: m.id, sourceHandle: 'right', targetHandle: 'top' })
        }
    })
}

const addEdges = (type: ClusterComponentTypes, nodeCount: number) => {
    const newEdges = []
    switch (type) {
        case ClusterComponentTypes.Master:
            if (isMasterHA) {
                connectMasterToLB(newEdges)
                connectWorkerToLB(newEdges)
            }
            else {
                connectWorkerToMaster(newEdges)
            }
            break;
        case ClusterComponentTypes.Worker:
            if (isMasterHA) {
                connectWorkerToLB(newEdges)
            } else {
                connectWorkerToMaster(newEdges)
            }
            break;
        case ClusterComponentTypes.ETCDCluster:
            connectMasterToETCD(newEdges)
            break;
    }

    store.addEdges(newEdges);
}

/**
 * 추가된 Node의 상황에 따라 기존에 존재하는 노드들 이동 처리
 */
const moveNodes = () => {

}

/**
 * 지정한 노드 유형에 따라 추가/삭제의 관련 노드들 처리
 * @param type 처리할 노드 유형
 * @param nodeCount 추가할 노드 갯수
 * @param isRemove 대상 유형 노드들의 삭제 여부
 */
const processNodes = (type: ClusterComponentTypes, nodeCount: number = 1, isRemove: boolean = false) => {
    if (isRemove) {
        removeNodes(type)
    } else {
        // 노드 추가
        addNodes(type, nodeCount)
        // 연결 추가
        addEdges(type, nodeCount)
    }
}

// const checkNodeCondition = (type: ClusterComponentTypes): boolean => {
//     if (!allowTypes.includes(type)) {
//         // TODO: 메시지 처리 필요
//         alert('Not Supported');
//         return false;
//     }

//     // switch (type) {
//     //     case ClusterComponentTypes.LoadBalancer:
//     //         if (hasInternalLB.value) {
//     //             alert('내부에 한개 이상의 LB를 가질 수 없습니다.')
//     //             return false;
//     //         }
//     //         if (!isMasterHA.value) {
//     //             alert('Master HA 구성이 필요합니다.')
//     //             return false;
//     //         }
//     // }

//     return true
// }

const onDrop = (event: DragEvent) => {
    event.stopPropagation();
    if (instance.value) {
        // const type = event.dataTransfer?.getData("application/vueflow") as ClusterComponentTypes;
        // if (checkNodeCondition(type)) {
        //     processNodes(type)
        // }

    }
};

onNodeDragStop(({ node }) => {
    // const nodes = getNodesInside(getNodes.value, { ...props.dimensions, x: props.computedPosition.x, y: props.computedPosition.y }, transform.value);
    // if (nodes.some((n) => n.id === node.id && n.id !== props.id)) {
    //   node.label = `In ${props.id}`;
    //   node.data = { group: props.id };
    // } else if (node.data?.group === props.id) {
    //   node.data.group = undefined;
    //   node.label = node.id;
    // }
});

onMounted(() => {
    //TODO: 초기 설정 구성
    processNodes(ClusterComponentTypes.Master, props.data.masterCount)
    processNodes(ClusterComponentTypes.Worker, props.data.workerCount)

    nextTick(() => {
        arrangeMembers()
        const currNode = store.nodes.find(n => n.id === props.id)
        currNode.nodeElement = props.nodeElement;
    })
})

onBeforeUnmount(() => {
    // 자식 구성 요소 모두 제거
    store.applyNodeChanges(store.nodes.filter(n => n.parentNode === props.id).map(item => ({ id: item.id, type: 'remove' })))
})
</script>

<style scoped lang="scss">
// .cloud-container {
//     min-width: 100px;
//     min-height: 100px;
// }
</style> 