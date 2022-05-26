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
        const arrangeNodes = { x: [], y: [] }
        const edges = store.edges.filter(e => e.targetNode === clusterNode.value);
        edges.forEach(e => {
            const targetInfo = { node: e.sourceNode, clusterPosition: e.targetHandle as Position }

            switch (targetInfo.clusterPosition) {
                case Position.Top:
                    targetInfo.node.position.y = clusterNode.value.position.y - nodeGap;
                    arrangeNodes.x.push(targetInfo.node)
                    break;
                case Position.Right:
                    targetInfo.node.position.x = clusterNode.value.position.x + clusterNode.value.dimensions.width + nodeGap;
                    arrangeNodes.y.push(targetInfo.node)
                    break;
                case Position.Bottom:
                    targetInfo.node.position.y = clusterNode.value.position.y + clusterNode.value.dimensions.height + nodeGap;
                    arrangeNodes.x.push(targetInfo.node)
                    break;
                case Position.Left:
                    targetInfo.node.position.x = clusterNode.value.position.x - nodeGap;
                    arrangeNodes.y.push(targetInfo.node)
                    break;
            }
        })

        if (arrangeNodes.x.length > 0) {
            const totalWidth = arrangeNodes.x.reduce((partSum, x) => partSum + x.dimensions.width, 0)
            const xGap = (clusterNode.value.dimensions.width - totalWidth) / (arrangeNodes.x.length + 1)
            let pos = clusterNode.value.position.x
            arrangeNodes.x.forEach((x, i) => {
                pos += xGap
                x.position.x = pos
                pos += x.dimensions.width
            })
        }
        if (arrangeNodes.y.length > 0) {
            const totalHeight = arrangeNodes.y.reduce((partSum, y) => partSum + y.dimensions.height, 0)
            const yGap = (clusterNode.value.dimensions.height - totalHeight) / (arrangeNodes.y.length + 1)
            let pos = clusterNode.value.position.y
            arrangeNodes.y.forEach((y, i) => {
                pos += yGap
                y.position.y = pos
                pos += y.dimensions.height
            })
        }
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