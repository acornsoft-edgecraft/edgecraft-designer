
import { useEventBus } from '@vueuse/core'
import { getMousePosition } from '../components/UserSelection/utils'
import { useVueFlow } from '../composables'
import {
    NodeChange, EdgeChange, FlowProps, UseVueFlow, Store, Node, Edge, GraphNode, ClusterComponentTypes, Position, XYPosition, FlowInstance,
    WorkerRoles, MachineSetRoles, ids,
    getDefaultCloudData, getDefaultOSCloudData, getDefaultCAPIData, getDefaultMasterData, getDefaultWorkerData, getDefaultLoadBalancerData, getDefaultRegistryData,
    getDefaultStorageServerData, getDefaultStorageClusterData, getDefaultETCDClusterData, getDefaultBastionData, getDefaultMachineGroupData, getDefaultMachineSetData,
    MasterDataRows, MasterGroupDataRows, MasterSetDataRows, WorkerDataRows, WorkerGroupDataRows, WorkerSetDataRows, RegistryDataRows, LoadbalancerDataRows,
    StorageClusterDataRows, StorageServerDataRows, ETCDClusterDataRows, CAPIDataRows, CloudDataRows, DesignerEvent
} from '../types'

const { on, emit } = useEventBus<DesignerEvent>('designer')
let store: Store = undefined, reload = false
const defaultNodePosition = { x: 20, y: 40 }
const defaultClusterStyle = { width: '200px', height: '200px' }

const getNodeLabel = (nodeType: ClusterComponentTypes) => {
    return nodeType.charAt(0).toUpperCase() + nodeType.slice(1)
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
export const checkEdgeExist = (source: GraphNode<any>, target: GraphNode<any>): boolean => store?.edges.some(e => (e.sourceNode === source && e.targetNode === target))
export const getDropPosition = (event: MouseEvent, instance: FlowInstance): XYPosition => {
    const mousePos = getMousePosition(event) as XYPosition
    return instance.project({ x: mousePos.x, y: mousePos.y - 40 });
}
export const setReload = (process: boolean) => reload = process
export const checkReload = () => reload
export const getStore = () => store
export const capitalize = (name: string) => name.charAt(0).toUpperCase() + name.slice(1)
export const emitEvent = (type: string, target: string, val?) => {
    emit({ type, target, val })
}
export const listenEvent = (target: string, callback: (ev: DesignerEvent) => void) => {
    on((ev) => {
        if (ev.target === target) callback(ev)
    })
}
export const initialize = (options?: Partial<FlowProps>): UseVueFlow => {
    const designerFlow = useVueFlow(options)
    store = designerFlow.store
    return designerFlow
}
export const setNodeElement = (nodeId: string, nodeElement: HTMLDivElement) => {
    const node = store?.nodes.find(n => n.id === nodeId)
    if (node) node.nodeElement = nodeElement
}
export const updateNodePosition = (nodeId: string) => store?.updateNodePosition({ id: nodeId })
export const updateNodeDimenstion = (nodeId: string, force: boolean = true) => {
    const node = store?.nodes.find(n => n.id === nodeId)
    if (node) store?.updateNodeDimensions([{ id: node.id, nodeElement: node.nodeElement, forceUpdate: force }])
}
export const removeNodes = (nodes: NodeChange[]) => {
    store?.applyNodeChanges(nodes)
}
export const removeEdges = (edges: EdgeChange[]) => {
    store?.applyEdgeChanges(edges)
}
export const addNodes = (nodes: Node<any>[]) => store?.addNodes(nodes)
export const addEdges = (edges: Edge<any>[]) => store?.addEdges(edges)
export const addConnection = (edges: Edge<any>[], source: GraphNode<any>, target: GraphNode<any>, sourceHandle, targetHandle) => {
    const id = `${source.id}-${target.id}`
    if (!checkEdgeExist(target, source))
        edges.push({ id, source: source.id, target: target.id, sourceHandle, targetHandle })
}
export const getNodes = () => store?.getNodes
export const getNodesById = (nodeId: string) => store?.nodes.filter(n => n.id === nodeId)
export const getChildNodes = (parentId: string) => store?.nodes.filter(n => n.parentNode === parentId)
export const getEdgeByConnection = (sourceId: string, targetId: string) => store?.edges.find(e => e.source === sourceId && e.target === targetId)
export const getEdgesById = (edgeIds: string[]) => store?.edges.filter(e => edgeIds.includes(e.source) || edgeIds.includes(e.target))
export const getNodesByType = (nodeType: ClusterComponentTypes, parentId?: string) => {
    if (parentId)
        return store?.nodes.filter(n => n.type === nodeType && n.parentNode === parentId)
    else
        return store?.nodes.filter(n => n.type === nodeType)
}
export const getChildNodesByType = (nodeType: ClusterComponentTypes, parentId: string) => {
    const targetNodes = []
    getChildNodes(parentId).forEach(n => {
        if (n.type === nodeType) {
            targetNodes.push(n)
        } else {
            targetNodes.push(...getChildNodesByType(nodeType, n.id))
        }
    })

    return targetNodes
}

export const getSelectedNodeSchema = () => {
    const isSelected = store.getSelectedNodes.length > 0;
    let rows = []
    let data = undefined

    if (isSelected) {
        const node = store.getSelectedNodes[0];
        switch (node.type) {
            case ClusterComponentTypes.Master:
                rows = MasterDataRows
                break;
            case ClusterComponentTypes.MasterGroup:
                rows = MasterGroupDataRows
                break;
            case ClusterComponentTypes.MasterSet:
                rows = MasterSetDataRows
                break;
            case ClusterComponentTypes.Worker:
                rows = WorkerDataRows
                break;
            case ClusterComponentTypes.WorkerGroup:
                rows = WorkerGroupDataRows
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

export const addOpenstackWorker = (nodes: any[], workerRole: WorkerRoles, parentId: string, checkExists: boolean = true) => {
    if (checkExists && store.nodes.some(n => n.type === ClusterComponentTypes.Worker && n.data.workerRoles === workerRole)) return
    const node = getNewNode(ClusterComponentTypes.Worker, true, parentId)
    node.data.name = node.label = capitalize(workerRole)
    node.position = defaultNodePosition
    node.data.workerRole = workerRole
    nodes.push(node)
}

export const addExternalNodesForCluster = (targetId: string, nodeType: ClusterComponentTypes, pos: XYPosition) => {
    const targetNode = getNodesById(targetId)[0]!

    function getPosition(type: ClusterComponentTypes, pos: XYPosition) {
        let xPos = 0, yPos = 0
        if (targetNode) {
            const xGap = 50, yGap = 50
            switch (type) {
                case ClusterComponentTypes.Registry:
                    xPos += pos.x + targetNode.dimensions.width + xGap
                    yPos += pos.y + (targetNode.dimensions.height / 2) - yGap
                    break;
                case ClusterComponentTypes.LoadBalancer:
                    xPos += pos.x + (targetNode.dimensions.width / 2) - xGap
                    yPos += pos.y + targetNode.dimensions.height + yGap
                    break;
                case ClusterComponentTypes.StorageCluster:
                    xPos += pos.x + (targetNode.dimensions.width / 2) - xGap
                    yPos += pos.y + targetNode.dimensions.height + yGap
                    break;
            }
        }
        return { x: xPos, y: yPos }
    }

    // add node
    const newNode = getNewNode(nodeType)
    newNode.position = getPosition(nodeType, pos)

    store.addNodes([newNode])

    // add edges (source is node, target is cluster)
    const node = store.nodes.filter(n => n.id === newNode.id)[0]!
    if (node) {
        const newEdges = []
        const id = `${node.id}-${targetNode.id}`
        switch (nodeType) {
            case ClusterComponentTypes.Registry:
                if (!store.edges.some(e => (e.sourceNode === node && e.targetNode === targetNode) || (e.sourceNode === targetNode && e.targetNode === node))) {
                    newEdges.push({ id, source: node.id, target: targetNode.id, sourceHandle: 'left', targetHandle: 'right' })
                }
                break;
            case ClusterComponentTypes.LoadBalancer:
            case ClusterComponentTypes.StorageCluster:
                if (!store.edges.some(e => (e.sourceNode === node && e.targetNode === targetNode) || (e.sourceNode === targetNode && e.targetNode === node))) {
                    newEdges.push({ id, source: node.id, target: targetNode.id, sourceHandle: 'top', targetHandle: 'bottom' })
                }
                break;
        }
        store.addEdges(newEdges)
    }
}

export const getHAProxyNode = (parentId: string) => {
    const node = getNewNode(ClusterComponentTypes.LoadBalancer, false, parentId)
    node.id = "haproxy_0"
    node.data.name = node.label = "HAProxy"
    return node;
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
        case ClusterComponentTypes.MasterGroup:
            node.data = getDefaultMachineGroupData()
            node.data.role = MachineSetRoles.MasterGroup
            node.data.name = 'Master Group'
            node.data.memberCount = 1
            node.position = defaultNodePosition
            node.style = defaultClusterStyle
            break;
        case ClusterComponentTypes.WorkerGroup:
            node.data = getDefaultMachineGroupData()
            node.data.role = MachineSetRoles.WorkerGroup
            node.data.name = 'Worker Group'
            node.data.memberCount = 1
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

export const adjustSiblings = (nodeId: string) => {
    const mainNode = getNodesById(nodeId)[0]!

    if (mainNode) {
        const nodeGap = 50;
        const arrangeNodes = { top: [], right: [], bottom: [], left: [] }

        const edges = store.edges.filter(e => e.targetNode?.id === mainNode.id);
        edges.forEach(e => {
            const targetInfo = { node: e.sourceNode, clusterPosition: e.targetHandle as Position }

            switch (targetInfo.clusterPosition) {
                case Position.Top:
                    targetInfo.node.position.y = mainNode.position.y - nodeGap;
                    updateNodePosition(targetInfo.node.id)
                    arrangeNodes.top.push(targetInfo.node)
                    break;
                case Position.Right:
                    targetInfo.node.position.x = mainNode.position.x + mainNode.dimensions.width + nodeGap;
                    updateNodePosition(targetInfo.node.id)
                    arrangeNodes.right.push(targetInfo.node)
                    break;
                case Position.Bottom:
                    targetInfo.node.position.y = mainNode.position.y + mainNode.dimensions.height + nodeGap;
                    updateNodePosition(targetInfo.node.id)
                    arrangeNodes.bottom.push(targetInfo.node)
                    break;
                case Position.Left:
                    targetInfo.node.position.x = mainNode.position.x - nodeGap;
                    updateNodePosition(targetInfo.node.id)
                    arrangeNodes.left.push(targetInfo.node)
                    break;
            }
        })

        if (arrangeNodes.top.length > 0) {
            const totalWidth = arrangeNodes.top.reduce((partSum, x) => partSum + x.dimensions.width, 0)
            const xGap = (mainNode.dimensions.width - totalWidth) / (arrangeNodes.top.length + 1)
            let pos = mainNode.position.x
            arrangeNodes.top.forEach((t, i) => {
                pos += xGap
                t.position.x = pos
                updateNodePosition(t.id)
                pos += t.dimensions.width
            })
        }
        if (arrangeNodes.right.length > 0) {
            const totalHeight = arrangeNodes.right.reduce((partSum, y) => partSum + y.dimensions.height, 0)
            const yGap = (mainNode.dimensions.height - totalHeight) / (arrangeNodes.right.length + 1)
            let pos = mainNode.position.y
            arrangeNodes.right.forEach((r, i) => {
                pos += yGap
                r.position.y = pos
                updateNodePosition(r.id)
                pos += r.dimensions.height
            })
        }
        if (arrangeNodes.bottom.length > 0) {
            const totalWidth = arrangeNodes.bottom.reduce((partSum, x) => partSum + x.dimensions.width, 0)
            const xGap = (mainNode.dimensions.width - totalWidth) / (arrangeNodes.bottom.length + 1)
            let pos = mainNode.position.x
            arrangeNodes.bottom.forEach((b, i) => {
                pos += xGap
                b.position.x = pos
                updateNodePosition(b.id)
                pos += b.dimensions.width
            })
        }
        if (arrangeNodes.left.length > 0) {
            const totalHeight = arrangeNodes.left.reduce((partSum, y) => partSum + y.dimensions.height, 0)
            const yGap = (mainNode.dimensions.height - totalHeight) / (arrangeNodes.left.length + 1)
            let pos = mainNode.position.y
            arrangeNodes.left.forEach((l, i) => {
                pos += yGap
                l.position.y = pos
                updateNodePosition(l.id)
                pos += l.dimensions.height
            })
        }
    }
}

export const connectMasterToLB = (newEdges: any[], parentId: string) => {
    const haProxy = getNodesByType(ClusterComponentTypes.LoadBalancer, parentId)[0]!
    if (haProxy) {
        getNodesByType(ClusterComponentTypes.Master, parentId).forEach(m => {
            addConnection(newEdges, haProxy, m, 'top', 'bottom')
        })
    }
}
export const connectWorkerToMaster = (newEdges: any[], parentId: string) => {
    const master = getNodesByType(ClusterComponentTypes.Master, parentId)[0]!
    getNodesByType(ClusterComponentTypes.Worker, parentId).forEach(w => {
        addConnection(newEdges, master, w, 'bottom', 'top')
    })
}
export const connectWorkerToLB = (newEdges: any[], parentId: string) => {
    const haProxy = getNodesByType(ClusterComponentTypes.LoadBalancer, parentId)[0]!
    if (haProxy) {
        getNodesByType(ClusterComponentTypes.Worker, parentId).forEach(w => {
            addConnection(newEdges, haProxy, w, 'bottom', 'top')
        })
    }
}
export const connectMasterToETCD = (newEdges: any[], parentId: string) => {
    const etcdCluster = getNodesByType(ClusterComponentTypes.ETCDCluster, parentId)[0]!
    getNodesByType(ClusterComponentTypes.Master, parentId).forEach(m => {
        addConnection(newEdges, etcdCluster, m, 'right', 'top')
    })
}
export const connectStorageClusterToWorker = (newEdges: any[], parentId: string) => {
    const storageCluster = getNodesByType(ClusterComponentTypes.StorageCluster, parentId)[0]!
    getNodesByType(ClusterComponentTypes.Worker, parentId).forEach(w => {
        addConnection(newEdges, w, storageCluster, 'bottom', 'top')
    })
}
export const connectMasterGroupToBastion = (newEdges: any[], parentId: string) => {
    const bastion = getNodesByType(ClusterComponentTypes.Bastion, parentId)[0]!
    if (bastion) {
        const masterGroup = getNodesByType(ClusterComponentTypes.MasterGroup, parentId)[0]!
        addConnection(newEdges, bastion, masterGroup, 'right', 'left')
    }
}
export const connectWorkerGroupToBastion = (newEdges: any[], parentId: string) => {
    const bastion = getNodesByType(ClusterComponentTypes.Bastion, parentId)[0]!
    if (bastion) {
        const workerGroup = getNodesByType(ClusterComponentTypes.WorkerGroup, parentId)[0]!
        addConnection(newEdges, bastion, workerGroup, 'right', 'left')
    }
}
export const connectMasterGroupToLB = (newEdges: any[], parentId: string) => {
    const haProxy = getNodesByType(ClusterComponentTypes.LoadBalancer, parentId)[0]!
    if (haProxy) {
        const masterGroup = getNodesByType(ClusterComponentTypes.MasterGroup, parentId)[0]!
        addConnection(newEdges, haProxy, masterGroup, 'top', 'bottom')
    }
}
export const connectWorkerGroupToMasterGroup = (newEdges: any[], parentId: string) => {
    const masterGroup = getNodesByType(ClusterComponentTypes.MasterGroup, parentId)[0]!
    const workerGroup = getNodesByType(ClusterComponentTypes.WorkerGroup, parentId)[0]!
    if (masterGroup && workerGroup) {
        addConnection(newEdges, masterGroup, workerGroup, 'bottom', 'top')
    }
}
export const connectWorkerGroupToLB = (newEdges: any[], parentId: string) => {
    const haProxy = getNodesByType(ClusterComponentTypes.LoadBalancer, parentId)[0]!
    if (haProxy) {
        const workerGroup = getNodesByType(ClusterComponentTypes.WorkerGroup, parentId)[0]!
        addConnection(newEdges, haProxy, workerGroup, 'bottom', 'top')
    }
}
export const connectMasterGroupToETCD = (newEdges: any[], parentId: string) => {
    const etcdCluster = getNodesByType(ClusterComponentTypes.ETCDCluster, parentId)[0]!
    const masterGroup = getNodesByType(ClusterComponentTypes.MasterGroup, parentId)[0]!
    addConnection(newEdges, etcdCluster, masterGroup, 'bottom', 'top')
}
export const connectStorageClusterToWorkerGroup = (newEdges: any[], parentId: string) => {
    const storageCluster = getNodesByType(ClusterComponentTypes.StorageCluster, parentId)[0]!
    const workerGroup = getNodesByType(ClusterComponentTypes.WorkerGroup, parentId)[0]!
    addConnection(newEdges, workerGroup, storageCluster, 'bottom', 'right')
}