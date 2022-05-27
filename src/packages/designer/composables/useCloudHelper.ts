import { GraphNode, ClusterComponentTypes, Position, XYPosition, WorkerRoles, CloudType, Store } from '../types'
import { getIncomers, handleParentResizing } from '../utils'
import { getDefaultMasterData, getDefaultWorkerData, getDefaultLoadBalancerData, getDefaultRegistryData, getDefaultStorageServerData, getDefaultStorageClusterData, getDefaultETCDClusterData } from '../types'

// const masters = computed(() => store.nodes.filter(n => n.type === ClusterComponentTypes.Master && n.parentNode === node.id))
// const workers = computed(() => store.nodes.filter(n => n.type === ClusterComponentTypes.Worker && n.parentNode === node.id))
// const haProxy = computed(() => store.getNodes.filter(n => n.type === ClusterComponentTypes.LoadBalancer && n.parentNode === node.id)[0]!)
// const etcdCluster = computed(() => store.getNodes.filter(n => n.type === ClusterComponentTypes.ETCDCluster && n.parentNode === node.id)[0]!)

export const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export default (store: Store, clusterId: string) => {
    const ids = new Map<ClusterComponentTypes, number>([[ClusterComponentTypes.LoadBalancer, 0], [ClusterComponentTypes.ETCDCluster, 0]])

    const clusterNode = computed(() => store.nodes.filter(n => n.id === clusterId)[0]!)
    const masters = computed(() => store.nodes.filter(n => n.parentNode === clusterId && n.type === ClusterComponentTypes.Master))
    const workers = computed(() => store.nodes.filter(n => n.parentNode === clusterId && n.type === ClusterComponentTypes.Worker))
    const haProxy = computed(() => store.nodes.filter(n => n.parentNode === clusterId && n.type === ClusterComponentTypes.LoadBalancer)[0]!)
    const etcdCluster = computed(() => store.nodes.filter(n => n.parentNode === clusterId && n.type === ClusterComponentTypes.ETCDCluster)[0]!)
    const isMasterHA = computed(() => clusterNode.value.data.masterCount > 1)
   
    watch(() => clusterNode.value?.data?.masterCount, (newVal, oldVal) => {
        // 삭제되는 경우 제외
        if (clusterNode.value) {
            if (newVal < 1) {
                // TODO: Message 처리
                alert('Master 갯수 확인')
                clusterNode.value.data.masterCount = oldVal;
                return;
            }
        
            processNodes(ClusterComponentTypes.Master, oldVal, true)
            processNodes(ClusterComponentTypes.Master, newVal)
        
            nextTick(() => { arrangeMembers() })
        }
    })

    watch(() => clusterNode.value?.data?.useExternalETCD, (newVal, oldVal) => {
        if (clusterNode.value) {
            if (oldVal === newVal) return;
    
            masters.value.forEach(m => {
                m.data.hasETCD = !newVal
            })
        
            processNodes(ClusterComponentTypes.ETCDCluster, 1, !newVal)
        
            nextTick(() => { arrangeMembers() })
        }
    })
    
    watch(() => clusterNode.value?.data?.workerCount, (newVal, oldVal) => {
        if (clusterNode.value) {
            if (oldVal === newVal) return;
    
            processNodes(ClusterComponentTypes.Worker, oldVal, true)
            processNodes(ClusterComponentTypes.Worker, newVal)
        
            nextTick(() => { arrangeMembers() })
        }
    })

    const getNodeData = (type: ClusterComponentTypes, label: string, workerRole?: WorkerRoles) => {
        let data = {} as any;
    
        switch (type) {
            case ClusterComponentTypes.Master:
                data = getDefaultMasterData()
                break;
            case ClusterComponentTypes.Worker:
                if (workerRole) {
                    data = getDefaultWorkerData({ workerRole: workerRole })
                } else {
                    data = getDefaultWorkerData({ workerRole: clusterNode.value.data.cloudType === CloudType.Openstack ? WorkerRoles.Compute : WorkerRoles.Worker })
                }
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

    const getNode = (id: string, label: string, type: ClusterComponentTypes, position: XYPosition, workerRole?: WorkerRoles) => ({
        id,
        type,
        position,
        label,
        parentNode: clusterNode.value.id,
        resizeParent: true,
        data: getNodeData(type, label, workerRole),
    })

    const getNodePosition = (type: ClusterComponentTypes, seq: number) => {
        // 실제 Cluster내의 Member Nodes 정렬은 arrangeMembers를 통해서 처리된다.
   
        return { x: 20, y: 40 }
    }
    
    const getLabel = (type: ClusterComponentTypes) => {
        if (type === ClusterComponentTypes.Worker && clusterNode.value.data.cloudType === CloudType.Openstack) {
            const name = WorkerRoles.Compute as string
            return name.charAt(0).toUpperCase() + name.slice(1)
        }
        return type.charAt(0).toUpperCase() + type.slice(1)
    }
    
    const getIdLabel = (type: ClusterComponentTypes, seq: number) => {
        const nodeName = getLabel(type)
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
    
        return { id, label }
    }

    const checkEdgeExist = (source: GraphNode<any>, target: GraphNode<any>): boolean => store.edges.some(e => (e.sourceNode === source && e.targetNode === target))

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

    const removeNodes = (type: ClusterComponentTypes) => {
        const nodes = []
    
        switch (type) {
            case ClusterComponentTypes.Master:
                if (clusterNode.value.data.masterCount === 1) {
                    if (etcdCluster.value) 
                        nodes.push({id: etcdCluster.value.id, type: 'remove'})
                    if (haProxy.value)
                        nodes.push({id: haProxy.value.id, type: 'remove'})
                }
            default:
                nodes.push(...store.nodes.filter(item => item.parentNode === clusterNode.value.id && item.type === type).map(item => ({ id: item.id, type: 'remove' })));
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

    const addOpenstackNodes = (nodes: any[]) => {
        // Controller
        if (!store.nodes.some(n => n.type === ClusterComponentTypes.Worker && n.data.workerRoles === WorkerRoles.Controller)) {
            nodes.push(getNode('controller_0', 'Controller', ClusterComponentTypes.Worker, getNodePosition(ClusterComponentTypes.Worker, 0), WorkerRoles.Controller))
        }
    
        // Network
        if (!store.nodes.some(n => n.type === ClusterComponentTypes.Worker && n.data.workerRoles === WorkerRoles.Network)) {
            nodes.push(getNode('network_0', 'Network', ClusterComponentTypes.Worker, getNodePosition(ClusterComponentTypes.Worker, 1), WorkerRoles.Network))
        }
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
            if (isMasterHA.value && !haProxy.value) {
                newNodes.push(getNode('haproxy_0', 'HAProxy', ClusterComponentTypes.LoadBalancer, { x: 20, y: 60 }))
            }
        }

        // Openstack Nodes 추가
        if (clusterNode.value.data.cloudType === CloudType.Openstack && type === ClusterComponentTypes.Worker) addOpenstackNodes(newNodes)

        // 개별 노드 추가
        for (let i = 0; i < nodeCount; i++) {
            const { id, label } = getIdLabel(type, i)
            //TODO: Master/Worker, ... 구분 처리
            //TODO: Position 배분 및 정리
            //TODO: Cluster Sizing (Dimension) 처리
            newNodes.push(getNode(id, label, type, getNodePosition(type, i)))
        }

        store.addNodes(newNodes);
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
                break;
            case ClusterComponentTypes.ETCDCluster:
                connectMasterToETCD(newEdges)
                break;
        }
    
        store.addEdges(newEdges);
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
        const pos = { layer: 0, x: 20, y: 60, x2: 20, xGap: 20, yGap: 40 }

        // 위치 조정
        if (etcdCluster.value || haProxy.value) {
            pos.x2 = (etcdCluster.value ? etcdCluster.value.dimensions.width : haProxy.value.dimensions.width) + pos.xGap
        }

        // layer #1 : ETCD Cluster
        if (etcdCluster.value) {
            etcdCluster.value.position.x = pos.x
            etcdCluster.value.position.y = pos.y

            pos.layer++
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
        pos.layer++

        // layer #3 : HAProxy
        if (haProxy.value) {
            // loadbalancer
            haProxy.value.position.x = pos.x
            haProxy.value.position.y = pos.y

            pos.layer++
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

        nextTick(() => {
            // 많은 수를 기준으로 Parent Size 재 구성
            if (masters.value.length > workers.value.length) {
                handleParentResizing(masters.value[masters.value.length - 1], store.nodes)
            } else {
                handleParentResizing(workers.value[workers.value.length - 1], store.nodes)
            }            
            
            nextTick(() => adjustSiblings())
        })
    }

    const adjustSiblings = () => {
        const nodeGap = 50;
        const arrangeNodes = { top: [], right: [], bottom: [], left: [] }

        nextTick(() => {
            const edges = store.edges.filter(e => e.targetNode === clusterNode.value);
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