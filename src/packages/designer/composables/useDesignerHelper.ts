import { addEdge, handleParentResizing } from '../utils'
import {
    Store, Node, GraphNode, ClusterComponentTypes, Position, XYPosition,
    WorkerRoles, MachineSetRoles, CloudType, ids,
    getDefaultCloudData, getDefaultOSCloudData, getDefaultCAPIData, getDefaultMasterData, getDefaultWorkerData, getDefaultLoadBalancerData, getDefaultRegistryData,
    getDefaultStorageServerData, getDefaultStorageClusterData, getDefaultETCDClusterData, getDefaultBastionData, getDefaultMachineSetData,
    MasterDataRows, MasterSetDataRows, WorkerDataRows, WorkerSetDataRows, RegistryDataRows, LoadbalancerDataRows, StorageClusterDataRows, StorageServerDataRows, ETCDClusterDataRows, CAPIDataRows, CloudDataRows
} from '../types'
import { BaseTransition } from 'vue'
import { toIdentifier } from '@babel/types'
import { e } from 'ohmyfetch/dist/error-d4c70d05'
import clusterCompBarVue from '~~/src/components/k3/designer/cluster-comp-bar.vue'

//***
// Variables
//***

const clusterId = ref("-1")
const store = ref<Store>()

const clusterNode = computed(() => store.value?.nodes.filter(n => n.id === clusterId.value)[0]!)
const masters = computed(() => store.value?.nodes.filter(n => n.parentNode === clusterId.value && n.type === ClusterComponentTypes.Master))
const workers = computed(() => store.value?.nodes.filter(n => n.parentNode === clusterId.value && n.type === ClusterComponentTypes.Worker))
const masterSets = computed(() => store.value?.nodes.filter(n => n.parentNode === clusterId.value && n.type === ClusterComponentTypes.MasterSet))
const workerSets = computed(() => store.value?.nodes.filter(n => n.parentNode === clusterId.value && n.type === ClusterComponentTypes.WorkerSet))
const haProxy = computed(() => store.value?.nodes.filter(n => n.parentNode === clusterId.value && n.type === ClusterComponentTypes.LoadBalancer)[0]!)
const etcdCluster = computed(() => store.value?.nodes.filter(n => n.parentNode === clusterId.value && n.type === ClusterComponentTypes.ETCDCluster)[0]!)
const storageCluster = computed(() => store.value?.nodes.filter(n => n.parentNode === clusterId.value && n.type === ClusterComponentTypes.StorageCluster)[0]!)
const bastion = computed(() => store.value?.nodes.filter(n => n.parentNode == clusterId.value && n.type === ClusterComponentTypes.Bastion)[0]!)
const isMasterHA = computed(() => clusterNode.value.data.masterCount > 1)

const defaultNodePosition = { x: 20, y: 40 }
const defaultClusterStyle = { width: '200px', height: '200px' }

//***
// Methods
//***

const getNodeLabel = (type: ClusterComponentTypes) => {
    if (type === ClusterComponentTypes.Worker && clusterNode.value?.data.cloudType === CloudType.Openstack) {
        const name = WorkerRoles.Compute as string
        return name.charAt(0).toUpperCase() + name.slice(1)
    }
    return type.charAt(0).toUpperCase() + type.slice(1)
}

const getNodeId = (nodeType: ClusterComponentTypes, seq: number = -1) => {
    const nodeLabel = getNodeLabel(nodeType)
    let id = ""
    if (seq >= 0) {
        id = `${nodeLabel}_${seq}`
    } else {
        if (ids.has(nodeType)) {
            const uid = ids.get(nodeType)
            id = `${nodeLabel}_${uid}`
            ids.set(nodeType, uid + 1)
        } else {
            id = nodeLabel
        }
    }

    return id;
}

export const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

const checkEdgeExist = (source: GraphNode<any>, target: GraphNode<any>): boolean => store.value?.edges.some(e => (e.sourceNode === source && e.targetNode === target))

const connectMasterToLB = (newEdges: any[]) => {
    if (haProxy.value) {
        masters.value.forEach(m => {
            const id = `${haProxy.value.id}-${m.id}`
            if (!checkEdgeExist(m, haProxy.value)) {
                newEdges.push({ id, source: haProxy.value.id, target: m.id, sourceHandle: 'top', targetHandle: 'bottom' })
            }
        })
    }
}
const connectWorkerToMaster = (newEdges: any[]) => {
    workers.value.forEach(w => {
        const id = `${masters.value[0].id}-${w.id}`
        if (!checkEdgeExist(w, masters.value[0])) {
            newEdges.push({ id, source: masters.value[0].id, target: w.id, sourceHandle: 'bottom', targetHandle: 'top' })
        }
    })
}
const connectWorkerToLB = (newEdges: any[]) => {
    if (haProxy.value) {
        workers.value.forEach(w => {
            const id = `${haProxy.value.id}-${w.id}`
            if (!checkEdgeExist(w, haProxy.value)) {
                newEdges.push({ id, source: haProxy.value.id, target: w.id, sourceHandle: 'bottom', targetHandle: 'top' })
            }
        })
    }
}
const connectMasterToETCD = (newEdges: any[]) => {
    masters.value.forEach(m => {
        const id = `${etcdCluster.value.id}-${m.id}`
        if (!checkEdgeExist(m, etcdCluster.value)) {
            newEdges.push({ id, source: etcdCluster.value.id, target: m.id, sourceHandle: 'bottom', targetHandle: 'top' })
        }
    })
}
const connectStorageClusterToWorker = (newEdges: any[]) => {
    workers.value.forEach(w => {
        const id = `${storageCluster.value.id}-${w.id}`
        if (!checkEdgeExist(w, storageCluster.value)) {
            newEdges.push({ id, source: w.id, target: storageCluster.value.id, sourceHandle: 'bottom', targetHandle: 'top' })
        }
    })
}

const connectMasterSetToBastion = (newEdges: any[]) => {
    if (bastion.value) {
        masterSets.value.forEach(m => {
            const id = `${bastion.value.id}-${m.id}`
            if (!checkEdgeExist(m, bastion.value)) {
                newEdges.push({ id, source: bastion.value.id, target: m.id, sourceHandle: 'right', targetHandle: 'left' })
            }
        })
    }
}
const connectWorkerSetToBastion = (newEdges: any[]) => {
    if (bastion.value) {
        workerSets.value.forEach(w => {
            const id = `${bastion.value.id}-${w.id}`
            if (!checkEdgeExist(w, bastion.value)) {
                newEdges.push({ id, source: bastion.value.id, target: w.id, sourceHandle: 'right', targetHandle: 'left' })
            }
        })
    }
}
const connectMasterSetToLB = (newEdges: any[]) => {
    if (haProxy.value) {
        masterSets.value.forEach(m => {
            const id = `${haProxy.value.id}-${m.id}`
            if (!checkEdgeExist(m, haProxy.value)) {
                newEdges.push({ id, source: haProxy.value.id, target: m.id, sourceHandle: 'right', targetHandle: 'left' })
            }
        })
    }
}
const connectWorkerSetToMasterSet = (newEdges: any[]) => {
    workerSets.value.forEach(w => {
        const id = `${masterSets.value[0].id}-${w.id}`
        const masterSet = masterSets.value[0]
        if (!checkEdgeExist(w, masterSet)) {
            newEdges.push({ id, source: masterSet.id, target: w.id, sourceHandle: 'left', targetHandle: 'left' })
        }
    })
}
const connectWorkerSetToLB = (newEdges: any[]) => {
    if (haProxy.value) {
        workerSets.value.forEach(w => {
            const id = `${haProxy.value.id}-${w.id}`
            if (!checkEdgeExist(w, haProxy.value)) {
                newEdges.push({ id, source: haProxy.value.id, target: w.id, sourceHandle: 'right', targetHandle: 'left' })
            }
        })
    }
}
const connectMasterSetToETCD = (newEdges: any[]) => {
    masterSets.value.forEach(m => {
        const id = `${etcdCluster.value.id}-${m.id}`
        if (!checkEdgeExist(m, etcdCluster.value)) {
            newEdges.push({ id, source: etcdCluster.value.id, target: m.id, sourceHandle: 'bottom', targetHandle: 'top' })
        }
    })
}
const connectStorageClusterToWorkerSet = (newEdges: any[]) => {
    workerSets.value.forEach(w => {
        const id = `${storageCluster.value.id}-${w.id}`
        if (!checkEdgeExist(w, storageCluster.value)) {
            newEdges.push({ id, source: w.id, target: storageCluster.value.id, sourceHandle: 'left', targetHandle: 'right' })
        }
    })
}

export const getNewNode = (nodeType: ClusterComponentTypes, setId: boolean = true, parentId: string = ""): Node => {
    const node = {} as Node;

    node.id = setId ? getNodeId(nodeType) : ""
    node.type = nodeType

    switch (nodeType) {
        case ClusterComponentTypes.BaremetalCloud:
        case ClusterComponentTypes.OpenstackCloud:
            node.type = 'cloud'
            node.label = `${nodeType === ClusterComponentTypes.BaremetalCloud ? 'Baremetal' : 'Openstack'} Cloud`;
            node.data = nodeType === ClusterComponentTypes.BaremetalCloud ? getDefaultCloudData() : getDefaultOSCloudData()
            node.data.name = node.label;
            node.position = defaultNodePosition
            node.style = defaultClusterStyle
            break;
        case ClusterComponentTypes.CAPI:
            node.data = getDefaultCAPIData()
            node.data.useExternalETCD = false
            node.position = defaultNodePosition
            node.style = defaultClusterStyle
            break;
        case ClusterComponentTypes.MasterSet:
            node.data = getDefaultMachineSetData()
            node.data.role = MachineSetRoles.Master
            node.data.name = 'MasterSet'
            node.data.memberCount = 1
            node.position = defaultNodePosition
            node.style = defaultClusterStyle
            break;
        case ClusterComponentTypes.WorkerSet:
            node.data = getDefaultMachineSetData()
            node.data.role = MachineSetRoles.Worker
            node.data.name = 'WorkerSet'
            node.data.memberCount = 3
            node.position = defaultNodePosition
            node.style = defaultClusterStyle
            break;
        case ClusterComponentTypes.Master:
            node.data = getDefaultMasterData()
            node.position = defaultNodePosition
            break;
        case ClusterComponentTypes.Worker:
            node.data = getDefaultWorkerData()
            const workerRole = clusterNode.value?.data.cloudType === CloudType.Openstack ? WorkerRoles.Compute : WorkerRoles.Worker
            node.data.workerRole = workerRole
            node.data.name = workerRole.charAt(0).toUpperCase() + workerRole.slice(1)
            node.position = defaultNodePosition
            break;
        case ClusterComponentTypes.Bastion:
            node.data = getDefaultBastionData()
            node.position = defaultNodePosition
            break;
        case ClusterComponentTypes.LoadBalancer:
            node.data = getDefaultLoadBalancerData()
            node.position = defaultNodePosition
            break;
        case ClusterComponentTypes.Registry:
            node.data = getDefaultRegistryData()
            node.position = defaultNodePosition
            break;
        case ClusterComponentTypes.StorageServer:
            node.data = getDefaultStorageServerData()
            node.position = defaultNodePosition
            break;
        case ClusterComponentTypes.StorageCluster:
            node.data = getDefaultStorageClusterData()
            node.position = defaultNodePosition
            break;
        case ClusterComponentTypes.ETCDCluster:
            node.data = getDefaultETCDClusterData()
            node.position = defaultNodePosition
            break;
        default:
            break;
    }

    if (parentId) {
        node.parentNode = parentId
        node.resizeParent = true;
    }

    node.label = node.data.name

    return node;
}

export const addExternalNodesForCluster = (nodeType: ClusterComponentTypes, pos: XYPosition) => {
    function getPosition(type: ClusterComponentTypes, pos: XYPosition) {
        let xPos = 0, yPos = 0
        if (clusterNode.value) {
            const xGap = 50, yGap = 50
            switch (type) {
                case ClusterComponentTypes.Registry:
                    xPos += pos.x + clusterNode.value.dimensions.width + xGap
                    yPos += pos.y + (clusterNode.value.dimensions.height / 2) - yGap
                    break;
                case ClusterComponentTypes.LoadBalancer:
                    xPos += pos.x + (clusterNode.value.dimensions.width / 2) - xGap
                    yPos += pos.y + clusterNode.value.dimensions.height + yGap
                    break;
                case ClusterComponentTypes.StorageCluster:
                    xPos += pos.x + (clusterNode.value.dimensions.width / 2) - xGap
                    yPos += pos.y + clusterNode.value.dimensions.height + yGap
                    break;
            }
        }
        return { x: xPos, y: yPos }
    }

    // add node
    const newNode = getNewNode(nodeType)
    newNode.position = getPosition(nodeType, pos)

    store.value.addNodes([newNode])

    // add edges (source is node, target is cluster)
    nextTick(() => {
        const node = store.value.nodes.filter(n => n.id === newNode.id)[0]!
        if (node) {
            const newEdges = []
            const id = `${node.id}-${clusterNode.value?.id}`
            switch (nodeType) {
                case ClusterComponentTypes.Registry:
                    if (!store.value.edges.some(e => (e.sourceNode === node && e.targetNode === clusterNode.value) || (e.sourceNode === clusterNode.value && e.targetNode === node))) {
                        newEdges.push({ id, source: node.id, target: clusterNode.value.id, sourceHandle: 'left', targetHandle: 'right' })
                    }
                    break;
                case ClusterComponentTypes.LoadBalancer:
                case ClusterComponentTypes.StorageCluster:
                    if (!store.value.edges.some(e => (e.sourceNode === node && e.targetNode === clusterNode.value) || (e.sourceNode === clusterNode.value && e.targetNode === node))) {
                        newEdges.push({ id, source: node.id, target: clusterNode.value.id, sourceHandle: 'top', targetHandle: 'bottom' })
                    }
                    break;
            }

            store.value.addEdges(newEdges)
        }
    })
}

export const getSelectedNodeSchema = () => {
    const isSelected = store.value?.getSelectedNodes.length > 0;
    let rows = []
    let data = undefined

    if (isSelected) {
        const node = store.value.getSelectedNodes[0];
        console.log(`click >> ${node.id}, ${node.type}`)
        switch (node.type) {
            case ClusterComponentTypes.Master:
                rows = MasterDataRows
                console.log(`click - Master >> ${JSON.stringify(rows)}`)
                break;
            case ClusterComponentTypes.MasterSet:
                rows = MasterSetDataRows
                break;
            case ClusterComponentTypes.Worker:
                rows = WorkerDataRows
                break;
            case ClusterComponentTypes.WorkerSet:
                rows = WorkerSetDataRows
                break;
            case ClusterComponentTypes.Registry:
                rows = RegistryDataRows
                break;
            case ClusterComponentTypes.LoadBalancer:
                rows = LoadbalancerDataRows
                break;
            case ClusterComponentTypes.StorageCluster:
                rows = StorageClusterDataRows
                break;
            case ClusterComponentTypes.StorageServer:
                rows = StorageServerDataRows
                break;
            case ClusterComponentTypes.ETCDCluster:
                rows = ETCDClusterDataRows
                break;
            case ClusterComponentTypes.CAPI:
                rows = CAPIDataRows
                break;
            case "cloud":
                rows = CloudDataRows
                break;
        }
        data = node.data;
    }
    return { rows, data }
}

export const adjustSiblings = () => {
    const nodeGap = 50;
    const arrangeNodes = { top: [], right: [], bottom: [], left: [] }

    const edges = store.value?.edges.filter(e => e.targetNode === clusterNode.value);
    edges.forEach(e => {
        const targetInfo = { node: e.sourceNode, clusterPosition: e.targetHandle as Position }

        switch (targetInfo.clusterPosition) {
            case Position.Top:
                targetInfo.node.position.y = clusterNode.value.position.y - nodeGap;
                arrangeNodes.top.push(targetInfo.node)
                break;
            case Position.Right:
                targetInfo.node.position.x = clusterNode.value.position.x + clusterNode.value.dimensions.width + nodeGap;
                arrangeNodes.right.push(targetInfo.node)
                break;
            case Position.Bottom:
                targetInfo.node.position.y = clusterNode.value.position.y + clusterNode.value.dimensions.height + nodeGap;
                arrangeNodes.bottom.push(targetInfo.node)
                break;
            case Position.Left:
                targetInfo.node.position.x = clusterNode.value.position.x - nodeGap;
                arrangeNodes.left.push(targetInfo.node)
                break;
        }
    })

    if (arrangeNodes.top.length > 0) {
        const totalWidth = arrangeNodes.top.reduce((partSum, x) => partSum + x.dimensions.width, 0)
        const xGap = (clusterNode.value.dimensions.width - totalWidth) / (arrangeNodes.top.length + 1)
        let pos = clusterNode.value.position.x
        arrangeNodes.top.forEach((t, i) => {
            pos += xGap
            t.position.x = pos
            pos += t.dimensions.width
        })
    }
    if (arrangeNodes.right.length > 0) {
        const totalHeight = arrangeNodes.right.reduce((partSum, y) => partSum + y.dimensions.height, 0)
        const yGap = (clusterNode.value.dimensions.height - totalHeight) / (arrangeNodes.right.length + 1)
        let pos = clusterNode.value.position.y
        arrangeNodes.right.forEach((r, i) => {
            pos += yGap
            r.position.y = pos
            pos += r.dimensions.height
        })
    }
    if (arrangeNodes.bottom.length > 0) {
        const totalWidth = arrangeNodes.bottom.reduce((partSum, x) => partSum + x.dimensions.width, 0)
        const xGap = (clusterNode.value.dimensions.width - totalWidth) / (arrangeNodes.bottom.length + 1)
        let pos = clusterNode.value.position.x
        arrangeNodes.bottom.forEach((b, i) => {
            pos += xGap
            b.position.x = pos
            pos += b.dimensions.width
        })
    }
    if (arrangeNodes.left.length > 0) {
        const totalHeight = arrangeNodes.left.reduce((partSum, y) => partSum + y.dimensions.height, 0)
        const yGap = (clusterNode.value.dimensions.height - totalHeight) / (arrangeNodes.left.length + 1)
        let pos = clusterNode.value.position.y
        arrangeNodes.left.forEach((l, i) => {
            pos += yGap
            l.position.y = pos
            pos += l.dimensions.height
        })
    }
}

export const useDesignerHelper = (designerStore: Store, cId: string) => {
    store.value = designerStore
    clusterId.value = cId

    //***
    //* Functions
    //***

    const removeNodes = (type: ClusterComponentTypes) => {
        const nodes = []

        switch (type) {
            case ClusterComponentTypes.Master:
                if (clusterNode.value.data.masterCount === 1) {
                    if (etcdCluster.value)
                        nodes.push({ id: etcdCluster.value.id, type: 'remove' })
                    if (haProxy.value)
                        nodes.push({ id: haProxy.value.id, type: 'remove' })
                }
            default:
                nodes.push(...store.value?.nodes.filter(item => item.parentNode === clusterNode.value.id && item.type === type).map(item => ({ id: item.id, type: 'remove' })));
                break;
        }

        // 삭제할 Node에 연결된 Edges 삭제
        const edges = []
        const nodeIds = nodes.map(n => n.id)

        edges.push(...store.value?.edges.filter(e => nodeIds.includes(e.source) || nodeIds.includes(e.target)).map(item => ({ id: item.id, type: 'remove' })))
        store.value.applyEdgeChanges(edges)

        // Node 삭제
        store.value.applyNodeChanges(nodes)
    }

    const addOpenstackNodes = (nodes: any[]) => {
        // Controller
        if (!store.value?.nodes.some(n => n.type === ClusterComponentTypes.Worker && n.data.workerRoles === WorkerRoles.Controller)) {
            const node = getNewNode(ClusterComponentTypes.Worker, true, clusterId.value)
            node.label = 'Controller'
            node.data.name = node.label
            node.position = defaultNodePosition
            node.data.workerRole = WorkerRoles.Controller
            nodes.push(node)
        }

        // Network
        if (!store.value?.nodes.some(n => n.type === ClusterComponentTypes.Worker && n.data.workerRoles === WorkerRoles.Network)) {
            const node = getNewNode(ClusterComponentTypes.Worker, true, clusterId.value)
            node.label = 'Network'
            node.data.name = node.label
            node.position = defaultNodePosition
            node.data.workerRole = WorkerRoles.Network
            nodes.push(node)
        }
    }

    /**
    * 지정한 유형의 노드를 지정한 갯수만큼 추가 처리
    * @param nodeType 추가할 노드 유형
    * @param nodeCount 추가할 노드 갯수
    */
    const addNodes = (nodeType: ClusterComponentTypes, nodeCount: number) => {
        // Node 추가
        const newNodes = []

        // MasterHA 케이스 처리
        if (nodeType === ClusterComponentTypes.Master) {
            if (isMasterHA.value && !haProxy.value) {
                const node = getNewNode(ClusterComponentTypes.LoadBalancer, false, clusterId.value)
                node.id = "haproxy_0"
                node.data.name = node.label = "HAProxy"
                newNodes.push(node)
            }
        }

        // Openstack Nodes 추가
        if (clusterNode.value.data.cloudType === CloudType.Openstack && nodeType === ClusterComponentTypes.Worker) {
            addOpenstackNodes(newNodes)
        }

        // 개별 노드 추가
        for (let i = 0; i < nodeCount; i++) {
            const node = getNewNode(nodeType, true, clusterId.value)
            //TODO: Master/Worker, ... 구분 처리
            //TODO: Position 배분 및 정리
            //TODO: Cluster Sizing (Dimension) 처리
            if (nodeCount > 1) {
                node.data.name = node.label = `${node.data.name} #${i}`
            }
            node.position = defaultNodePosition
            newNodes.push(node)
        }

        store.value?.addNodes(newNodes);
    }

    const addEdges = (type: ClusterComponentTypes, nodeCount: number) => {
        const newEdges = []
        switch (type) {
            case ClusterComponentTypes.Master:
                if (isMasterHA.value) {
                    connectMasterToLB(newEdges)
                    connectWorkerToLB(newEdges)
                    if (etcdCluster.value) {
                        connectMasterToETCD(newEdges)
                    }
                }
                else {
                    connectWorkerToMaster(newEdges)
                }
                break;
            case ClusterComponentTypes.Worker:
                if (isMasterHA.value) {
                    connectWorkerToLB(newEdges)
                } else {
                    connectWorkerToMaster(newEdges)
                }
                if (storageCluster.value) {
                    connectStorageClusterToWorker(newEdges)
                }
                break;
            case ClusterComponentTypes.ETCDCluster:
                connectMasterToETCD(newEdges)
                break;
            case ClusterComponentTypes.StorageCluster:
                connectStorageClusterToWorker(newEdges)
                break;
        }

        console.log(`addEdges >> ${type}'s edges: ${JSON.stringify(newEdges)}`)
        store.value?.addEdges(newEdges);
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

    const arrangeMembers = () => {
        const pos = { x: 20, y: 60, x2: 20, xGap: 20, yGap: 40 }

        // 위치 조정
        if (etcdCluster.value || haProxy.value) {
            pos.x2 = (etcdCluster.value ? etcdCluster.value.dimensions.width : haProxy.value.dimensions.width) + pos.xGap
        }

        // layer #1 : ETCD Cluster
        if (etcdCluster.value) {
            etcdCluster.value.position.x = pos.x
            etcdCluster.value.position.y = pos.y

            pos.y += etcdCluster.value.dimensions.height + pos.yGap
        }

        // layer #2 : Masters
        let itemPos = { x: pos.x2, y: pos.y, maxHeight: 0 }
        masters.value.forEach(m => {
            m.position.x = itemPos.x
            m.position.y = itemPos.y

            if (itemPos.maxHeight < m.dimensions.height) itemPos.maxHeight = m.dimensions.height
            itemPos.x += m.dimensions.width + pos.xGap
        })
        pos.y += itemPos.maxHeight + pos.yGap

        // layer #3 : HAProxy
        if (haProxy.value) {
            // loadbalancer
            haProxy.value.position.x = pos.x
            haProxy.value.position.y = pos.y

            pos.y += haProxy.value.dimensions.height + pos.yGap
        }

        // layer #4 : Workers
        itemPos = { x: pos.x2, y: pos.y, maxHeight: 0 }
        workers.value.forEach(w => {
            w.position.x = itemPos.x
            w.position.y = itemPos.y

            if (itemPos.maxHeight < w.dimensions.height) itemPos.maxHeight = w.dimensions.height
            itemPos.x += w.dimensions.width + pos.xGap
        })
        pos.y += itemPos.maxHeight + pos.yGap

        // layer #5 : Storage Cluster (CEPH)
        if (storageCluster.value) {
            storageCluster.value.position.x = pos.x
            storageCluster.value.position.y = pos.y

            pos.y += storageCluster.value.dimensions.height + pos.yGap
        }

        nextTick(() => {
            // 많은 수를 기준으로 Parent Width 재 구성
            if (masters.value.length > workers.value.length) {
                handleParentResizing(masters.value[masters.value.length - 1], store.value?.nodes)
            } else {
                handleParentResizing(workers.value[workers.value.length - 1], store.value?.nodes)
            }

            // 제일 마지막 항목을 기준으로 Parent Height 재 구성
            if (storageCluster.value) {
                handleParentResizing(storageCluster.value, store.value?.nodes)
            }

            nextTick(() => adjustSiblings())
        })
    }

    return {
        masters,
        workers,
        haProxy,
        etcdCluster,

        processNodes,
        arrangeMembers
    }
}

export const useCAPIHelper = (designerStore: Store, cId: string) => {
    store.value = designerStore
    clusterId.value = cId

    const capiNode = computed(() => store.value.nodes.filter(n => n.id === clusterId.value)[0]!)
    const masterSets = computed(() => store.value.nodes.filter(n => n.parentNode === capiNode.value.id && n.type === ClusterComponentTypes.MasterSet))
    const workerSets = computed(() => store.value.nodes.filter(n => n.parentNode === capiNode.value.id && n.type === ClusterComponentTypes.WorkerSet))
    const haProxy = computed(() => store.value.nodes.filter(n => n.parentNode === capiNode.value.id && n.type === ClusterComponentTypes.LoadBalancer)[0]!)
    const etcdCluster = computed(() => store.value.nodes.filter(n => n.parentNode === capiNode.value.id && n.type === ClusterComponentTypes.ETCDCluster)[0]!)
    const storageCluster = computed(() => store.value.nodes.filter(n => n.parentNode === capiNode.value.id && n.type === ClusterComponentTypes.StorageCluster)[0]!)
    const bastion = computed(() => store.value.nodes.filter(n => n.parentNode == capiNode.value.id && n.type === ClusterComponentTypes.Bastion)[0]!)

    const removeMemberNodes = () => {
        designerStore.applyEdgeChanges(designerStore.edges.filter(e => e.sourceNode === capiNode.value || e.targetNode === capiNode.value).map(item => ({ id: item.id, type: 'remove' })))
        designerStore.applyNodeChanges(designerStore.nodes.filter(n => n.parentNode === capiNode.value.id).map(item => ({ id: item.id, type: 'remove' })))
    }

    watch(() => capiNode.value.data.masterCount, (newVal) => {
        if (newVal > 1) {
            // HAProxy
            if (!haProxy.value) {
                processNodes(ClusterComponentTypes.LoadBalancer, 1, false, "HAProxy")
                nextTick(() => arrangeMembers())
            }
        } else {
            // Remove HAProxy
            if (haProxy.value) {
                processNodes(ClusterComponentTypes.LoadBalancer, 1, true)
            }
            // Remove ETCDCluster
            capiNode.value.data.useExternalETCD = false

            nextTick(() => arrangeMembers())
        }
    })

    watch(() => capiNode.value.data.workerSetCount, (newVal, oldValue) => {
        processNodes(ClusterComponentTypes.WorkerSet, oldValue, true)
        nextTick(() => {
            processNodes(ClusterComponentTypes.WorkerSet, newVal)
            nextTick(() => arrangeMembers())
        })
    })

    watch(() => capiNode.value.data.useExternalETCD, (newVal) => {
        masterSets.value.forEach(ms => {
            store.value.nodes.filter(n => n.parentNode === ms.id).forEach(m => m.data.hasETCD = !newVal)
        })

        processNodes(ClusterComponentTypes.ETCDCluster, 1, !newVal)
        nextTick(() => { arrangeMembers() })
    })

    const removeNodes = (nodeType: ClusterComponentTypes) => {
        const nodes = []

        nodes.push(...store.value.nodes.filter(n => n.parentNode === capiNode.value.id && n.type === nodeType).map(item => ({ id: item.id, type: 'remove' })));

        // 삭제할 Node에 연결된 Edges 삭제
        const edges = []
        const nodeIds = nodes.map(n => n.id)

        edges.push(...store.value.edges.filter(e => nodeIds.includes(e.source) || nodeIds.includes(e.target)).map(item => ({ id: item.id, type: 'remove' })))
        store.value.applyEdgeChanges(edges)

        // Node 삭제
        store.value.applyNodeChanges(nodes)
    }

    const removeMachineSetEdges = () => {
        const workerIds = workerSets.value.map(w => w.id)
        store.value.applyEdgeChanges(store.value.edges.filter(e => workerIds.includes(e.target) && e.source === masterSets.value[0].id).map(e => ({ id: e.id, type: 'remove' })))
    }

    /**
    * 지정한 유형의 노드를 지정한 갯수만큼 추가 처리
    * @param nodeType 추가할 노드 유형
    * @param nodeCount 추가할 노드 갯수
    */
    const addNodes = (nodeType: ClusterComponentTypes, nodeCount: number, name: string = "") => {
        // Node 추가
        const newNodes = []

        // 개별 노드 추가
        for (let i = 0; i < nodeCount; i++) {
            const node = getNewNode(nodeType, true, clusterId.value)
            //TODO: Master/Worker, ... 구분 처리
            //TODO: Position 배분 및 정리
            //TODO: Cluster Sizing (Dimension) 처리
            if (nodeCount > 1) {
                node.label = `${name || node.data.name} #${i}`
                node.data.name = node.label
            } else if (name) {
                node.data.name = node.label = name
            }
            newNodes.push(node)
        }

        store.value.addNodes(newNodes);
    }

    const addEdges = (type: ClusterComponentTypes) => {
        const newEdges = []
        switch (type) {
            case ClusterComponentTypes.Bastion:
                connectMasterSetToBastion(newEdges)
                connectWorkerSetToBastion(newEdges)
                break;
            case ClusterComponentTypes.MasterSet:
                if (haProxy.value) {
                    connectMasterSetToLB(newEdges)
                    connectWorkerSetToLB(newEdges)
                    if (etcdCluster.value) {
                        connectMasterSetToETCD(newEdges)
                    }
                }
                else {
                    connectWorkerSetToMasterSet(newEdges)
                }
                connectMasterSetToBastion(newEdges)
                break;
            case ClusterComponentTypes.WorkerSet:
                if (haProxy.value) {
                    connectWorkerSetToLB(newEdges)
                } else {
                    connectWorkerSetToMasterSet(newEdges)
                }
                if (storageCluster.value) {
                    connectStorageClusterToWorkerSet(newEdges)
                }
                connectWorkerSetToBastion(newEdges)
                break;
            case ClusterComponentTypes.ETCDCluster:
                connectMasterSetToETCD(newEdges)
                break;
            case ClusterComponentTypes.StorageCluster:
                connectStorageClusterToWorkerSet(newEdges)
                break;
            case ClusterComponentTypes.LoadBalancer:
                removeMachineSetEdges()
                connectMasterSetToLB(newEdges)
                connectWorkerSetToLB(newEdges)
                break;
        }

        store.value.addEdges(newEdges);
    }

    const processNodes = (nodeType: ClusterComponentTypes, nodeCount: number = 1, isRemove: boolean = false, name = "") => {
        if (isRemove) {
            removeNodes(nodeType)
        } else {
            // 노드 추가
            addNodes(nodeType, nodeCount, name)
            // 연결 추가
            addEdges(nodeType)
        }
    }

    const arrangeMembers = () => {
        const pos = { x: 20, x2: 20, y: 60, xGap: 40, yGap: 40 }

        // 구성요소에 따른 X좌표 조정
        if (bastion.value || storageCluster.value) {
            pos.x2 = Math.max(bastion.value?.dimensions.width, storageCluster.value?.dimensions.width) + pos.xGap
        }

        if (bastion.value) {
            bastion.value.position.x = pos.x
            bastion.value.position.y = pos.y
            pos.y += bastion.value.dimensions.height + pos.yGap
        }

        if (etcdCluster.value) {
            etcdCluster.value.position.x = pos.x2
            etcdCluster.value.position.y = pos.y
            pos.y += etcdCluster.value.dimensions.height + pos.yGap
        }

        masterSets.value.forEach(m => {
            m.position.x = pos.x2
            m.position.y = pos.y

            pos.y += m.dimensions.height + pos.yGap
        })

        if (haProxy.value) {
            console.log(`HAProxy arranged...`)
            haProxy.value.position.x = pos.x2
            haProxy.value.position.y = pos.y
            pos.y += haProxy.value.dimensions.height + pos.yGap
        }

        workerSets.value.forEach(w => {
            w.position.x = pos.x2
            w.position.y = pos.y

            pos.y += w.dimensions.height + pos.yGap
        })

        if (storageCluster.value) {
            storageCluster.value.position.x = pos.x
            storageCluster.value.position.y = pos.y

            pos.y += storageCluster.value.dimensions.height + pos.yGap
        }

        nextTick(() => {
            // Parent Width 재 구성
            handleParentResizing(workerSets.value.at(-1), store.value?.nodes)

            // 제일 마지막 항목을 기준으로 Parent Height 재 구성
            if (storageCluster.value) {
                handleParentResizing(storageCluster.value, store.value?.nodes)
            }

            nextTick(() => adjustSiblings())
        })
    }

    return {
        capiNode,
        masterSets,
        workerSets,

        removeMemberNodes,
        processNodes,
        arrangeMembers
    }
}

export const useMachineSetHelper = (store: Store, mid: string) => {
    const machineSetNode = computed(() => store.nodes.filter(n => n.id === mid)[0]!)
    const capiNode = computed(() => store.nodes.filter(n => n.id === machineSetNode.value.parentNode)[0]!)
    const memberNodes = computed(() => store.nodes.filter(n => n.parentNode === mid))

    const removeMemberNodes = () => {
        store.applyNodeChanges(memberNodes.value.map(n => ({ id: n.id, type: 'remove' })))
    }

    const removeNodes = (nodeType: ClusterComponentTypes) => {
        const nodes = []

        // 삭제 대상 노드
        nodes.push(...memberNodes.value.filter(n => n.type === nodeType).map(item => ({ id: item.id, type: 'remove' })));

        // Node 삭제
        store.applyNodeChanges(nodes)
    }

    /**
    * 지정한 유형의 노드를 지정한 갯수만큼 추가 처리
    * @param nodeType 추가할 노드 유형
    * @param nodeCount 추가할 노드 갯수
    */
    const addNodes = (nodeType: ClusterComponentTypes, nodeCount: number) => {
        // Node 추가
        const newNodes = []

        // 개별 노드 추가
        for (let i = 0; i < nodeCount; i++) {
            const node = getNewNode(nodeType, true, machineSetNode.value.id)
            if (nodeCount > 1) {
                node.label = `${node.data.name} #${i}`
                node.data.name = node.label
            }
            node.position = defaultNodePosition
            // TODO: 연결선 해제는?
            node.connectable = false
            newNodes.push(node)
        }

        store.addNodes(newNodes);
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
        }
    }

    const arrangeMembers = () => {
        nextTick(() => {
            const pos = { x: 20, xGap: 20 }

            memberNodes.value.forEach(n => {
                n.position.x = pos.x
                pos.x += n.dimensions.width + pos.xGap
            })

            handleParentResizing(memberNodes.value.at(-1), store.nodes)
        })
    }

    return {
        capiNode,
        machineSetNode,
        memberNodes,

        processNodes,
        removeMemberNodes,
        arrangeMembers
    }
}