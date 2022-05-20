import { RegistryNode } from '../components'
import SelectionPaneVue from '../container/SelectionPane/SelectionPane.vue'
import { ClusterComponentTypes, Position, Store } from '../types'
import { handleParentResizing } from '../utils'

// const masters = computed(() => store.nodes.filter(n => n.type === ClusterComponentTypes.Master && n.parentNode === node.id))
// const workers = computed(() => store.nodes.filter(n => n.type === ClusterComponentTypes.Worker && n.parentNode === node.id))
// const haProxy = computed(() => store.getNodes.filter(n => n.type === ClusterComponentTypes.LoadBalancer && n.parentNode === node.id)[0]!)
// const etcdCluster = computed(() => store.getNodes.filter(n => n.type === ClusterComponentTypes.ETCDCluster && n.parentNode === node.id)[0]!)

export const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export default (store: Store, clusterId: string) => {
    const clusterNode = computed(() => store.nodes.filter(n => n.id === clusterId)[0]!)
    const masters = computed(() => store.nodes.filter(n => n.parentNode === clusterId && n.type === ClusterComponentTypes.Master))
    const workers = computed(() => store.nodes.filter(n => n.parentNode === clusterId && n.type === ClusterComponentTypes.Worker))
    const haProxy = computed(() => store.nodes.filter(n => n.parentNode === clusterId && n.type === ClusterComponentTypes.LoadBalancer)[0]!)
    const etcdCluster = computed(() => store.nodes.filter(n => n.parentNode === clusterId && n.type === ClusterComponentTypes.ETCDCluster)[0]!)

    const arrangeMembers = () => {
        const pos = { layer: 0, x: 20, y: 60, x2: 20, xGap: 20, yGap: 40 }

        // 위치 조정
        if (etcdCluster.value || haProxy.value) {
            pos.x2 = (etcdCluster.value ? etcdCluster.value.dimensions.width : haProxy.value.dimensions.width) + pos.xGap
        }

        // ETCD Cluster
        if (etcdCluster.value) {
            etcdCluster.value.position.x = pos.x
            etcdCluster.value.position.y = pos.y

            pos.layer++
            pos.y += etcdCluster.value.dimensions.height + pos.yGap
            //store.updateNodePosition({ id: etcdCluster.value.id })
        }

        // layer #2 : Masters
        let itemPos = { x: pos.x2, y: pos.y, maxHeight: 0 }
        masters.value.forEach(m => {
            m.position.x = itemPos.x
            m.position.y = itemPos.y

            console.log(`arrange master >> Height: ${m.dimensions.height}`)

            if (itemPos.maxHeight < m.dimensions.height) itemPos.maxHeight = m.dimensions.height
            itemPos.x += m.dimensions.width + pos.xGap
            //store.updateNodePosition({ id: m.id })
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
            //store.updateNodePosition({ id: haProxy.value.id })
        }

        // layer #4 : Workers
        itemPos = { x: pos.x2, y: pos.y, maxHeight: 0 }
        workers.value.forEach(w => {
            w.position.x = itemPos.x
            w.position.y = itemPos.y

            if (itemPos.maxHeight < w.dimensions.height) itemPos.maxHeight = w.dimensions.height
            itemPos.x += w.dimensions.width + pos.xGap
            //store.updateNodePosition({ id: w.id })
        })

        nextTick(() => {
            handleParentResizing(workers.value[workers.value.length - 1], store.nodes)
            nextTick(() => adjustSiblings())
        })
    }

    const adjustSiblings = () => {
        const nodeGap = 50;
        const edges = store.edges.filter(e => e.sourceNode === clusterNode.value || e.targetNode === clusterNode.value);
        edges.forEach(e => {
            const targetInfo = { node: null, position: Position.Right }
            if (e.sourceNode === clusterNode.value) {
                targetInfo.node = e.targetNode
                targetInfo.position = e.sourceHandle as Position
            } else {
                targetInfo.node = e.sourceNode
                targetInfo.position = e.targetHandle as Position
            }

            switch (targetInfo.position) {
                case Position.Top:
                    targetInfo.node.position.y = clusterNode.value.position.y - nodeGap;
                    break;
                case Position.Right:
                    targetInfo.node.position.x = clusterNode.value.position.x + clusterNode.value.dimensions.width + nodeGap;
                    break;
                case Position.Bottom:
                    targetInfo.node.position.y = clusterNode.value.position.y + clusterNode.value.dimensions.height + nodeGap;
                    break;
                case Position.Left:
                    targetInfo.node.position.x = clusterNode.value.position.x - nodeGap;
                    break;
            }
        })
    }

    return {
        //clusterNode,
        masters,
        workers,
        haProxy,
        etcdCluster,

        arrangeMembers
    }
}