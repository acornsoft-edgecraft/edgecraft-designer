import { ClusterComponentTypes, CloudTypes, WorkerRoles } from '../types'
import { handleParentResizing } from '../utils'
import * as Helper from '../utils/designer'

export default (cloudId: string) => {
    const cloudNode = Helper.getNodesById(cloudId)[0]!

    watch(() => cloudNode.data?.masterCount, (newVal, oldVal) => {
        if (newVal < 1 || newVal > 5) {
            alert('check master count')
            return
        }

        processChilds(ClusterComponentTypes.Master, oldVal, true)
        processChilds(ClusterComponentTypes.Master, newVal)

        Helper.emitEvent('arrange', 'cloud')
    })
    watch(() => cloudNode.data?.workerCount, (newVal, oldVal) => {
        if (newVal < 1 || newVal > 5) {
            alert('check worker count')
            return
        }

        processChilds(ClusterComponentTypes.Worker, oldVal, true)
        processChilds(ClusterComponentTypes.Worker, newVal)
        Helper.emitEvent('arrange', 'cloud')
    })
    watch(() => cloudNode.data?.useExternalETCD, (newVal) => {
        Helper.getNodesByType(ClusterComponentTypes.Master, cloudId).forEach(m => m.data.hasETCD = !newVal)
        processChilds(ClusterComponentTypes.ETCDCluster, 1, !newVal)
        Helper.emitEvent('arrange', 'cloud')
    })
    watch(() => cloudNode.data?.useCeph, (newVal) => {
        processChilds(ClusterComponentTypes.StorageCluster, 1, !newVal)
        Helper.emitEvent('arrange', 'cloud')
    })
    watch(() => cloudNode.dimensions, () => {
        Helper.adjustSiblings(cloudId)
    })


    const removeChilds = () => {
        Helper.removeNodes(Helper.getChildNodes(cloudId).map(m => ({ id: m.id, type: 'remove' })))
    }
    const removeChildNodes = (nodeType: ClusterComponentTypes) => {
        const nodes = []

        switch (nodeType) {
            case ClusterComponentTypes.Master:
                // HAProxy, ETCDCluster 삭제
                if (cloudNode.data.masterCount === 1) {
                    const etcdCluster = Helper.getNodesByType(ClusterComponentTypes.ETCDCluster, cloudId)[0]!
                    const haProxy = Helper.getNodesByType(ClusterComponentTypes.LoadBalancer, cloudId)[0]!

                    if (etcdCluster) {
                        cloudNode.data.useExternalETCD = false
                    }
                    if (haProxy)
                        nodes.push({ id: haProxy.id, type: 'remove' })
                }
            default:
                nodes.push(...Helper.getNodesByType(nodeType, cloudId).map(m => ({ id: m.id, type: 'remove' })));
                break;
        }

        // 삭제할 Node에 연결된 Edges 삭제
        const nodeIds = nodes.map(n => n.id)

        Helper.removeEdges(Helper.getEdgesById(nodeIds).map(m => ({ id: m.id, type: 'remove' })))

        // Node 삭제
        Helper.removeNodes(nodes)
    }
    const addChildNodes = (nodeType: ClusterComponentTypes, nodeCount: number) => {
        // Node 추가
        const newNodes = []

        // MasterHA 케이스 처리
        if (nodeType === ClusterComponentTypes.Master) {
            const haProxy = Helper.getNodesByType(ClusterComponentTypes.LoadBalancer, cloudId)[0]!
            if (cloudNode.data?.masterCount > 1 && !haProxy) {
                newNodes.push(Helper.getHAProxyNode(cloudId))
            }
        }

        // Openstack Nodes 추가
        if (cloudNode.data?.cloudType === CloudTypes.Openstack && nodeType === ClusterComponentTypes.Worker) {
            Helper.addOpenstackWorker(newNodes, WorkerRoles.Controller, cloudId, true)
            Helper.addOpenstackWorker(newNodes, WorkerRoles.Network, cloudId, true)
        }

        // 개별 노드 추가
        for (let i = 0; i < nodeCount; i++) {
            const node = Helper.getNewNode(nodeType, true, cloudId)
            if (nodeType === ClusterComponentTypes.Worker && cloudNode.data?.cloudType === CloudTypes.Openstack) {
                node.data.workerRole = WorkerRoles.Compute
                node.data.name = 'Compute'
            }
            if (nodeCount > 1) {
                node.data.name = node.label = `${node.data.name} #${i}`
            }
            newNodes.push(node)
        }

        Helper.addNodes(newNodes)
    }
    const addChildEdges = (nodeType: ClusterComponentTypes, nodeCount: number) => {
        const newEdges = []

        switch (nodeType) {
            case ClusterComponentTypes.Master:
                if (Helper.getNodesByType(ClusterComponentTypes.LoadBalancer, cloudId)[0]!) {
                    Helper.connectMasterToLB(newEdges, cloudId)
                    Helper.connectWorkerToLB(newEdges, cloudId)
                    if (Helper.getNodesByType(ClusterComponentTypes.ETCDCluster, cloudId)[0]!) {
                        Helper.connectMasterToETCD(newEdges, cloudId)
                    }
                }
                else {
                    Helper.connectWorkerToMaster(newEdges, cloudId)
                }
                break;
            case ClusterComponentTypes.Worker:
                if (Helper.getNodesByType(ClusterComponentTypes.LoadBalancer, cloudId)[0]!) {
                    Helper.connectWorkerToLB(newEdges, cloudId)
                } else {
                    Helper.connectWorkerToMaster(newEdges, cloudId)
                }

                if (Helper.getNodesByType(ClusterComponentTypes.StorageCluster, cloudId)[0]!) {
                    Helper.connectStorageClusterToWorker(newEdges, cloudId)
                }
                break;
            case ClusterComponentTypes.ETCDCluster:
                Helper.connectMasterToETCD(newEdges, cloudId)
                break;
            case ClusterComponentTypes.StorageCluster:
                Helper.connectStorageClusterToWorker(newEdges, cloudId)
                break;
        }

        Helper.addEdges(newEdges)
    }
    const processChilds = (nodeType: ClusterComponentTypes, nodeCount: number, isRemove: boolean = false) => {
        if (isRemove) {
            removeChildNodes(nodeType)
        } else {
            addChildNodes(nodeType, nodeCount)
            addChildEdges(nodeType, nodeCount)
        }
    }
    const arrangeChilds = () => {
        const pos = { x: 20, y: 60, x2: 20, xGap: 20, yGap: 40 }

        const etcdCluster = Helper.getNodesByType(ClusterComponentTypes.ETCDCluster, cloudId)[0]!
        const haProxy = Helper.getNodesByType(ClusterComponentTypes.LoadBalancer, cloudId)[0]!

        // 위치 조정
        if (etcdCluster || haProxy) {
            pos.x2 = (etcdCluster ? etcdCluster.dimensions.width : haProxy.dimensions.width) + pos.xGap
        }

        // layer #1 : ETCD Cluster
        if (etcdCluster) {
            etcdCluster.position.x = pos.x
            etcdCluster.position.y = pos.y
            Helper.updateNodePosition(etcdCluster.id)

            pos.y += etcdCluster.dimensions.height + pos.yGap
        }

        // layer #2 : Masters
        let itemPos = { x: pos.x2, y: pos.y, maxHeight: 0 }
        const masters = Helper.getNodesByType(ClusterComponentTypes.Master, cloudId)
        masters.forEach(m => {
            m.position.x = itemPos.x
            m.position.y = itemPos.y
            Helper.updateNodePosition(m.id)

            if (itemPos.maxHeight < m.dimensions.height) itemPos.maxHeight = m.dimensions.height
            itemPos.x += m.dimensions.width + pos.xGap
        })
        pos.y += itemPos.maxHeight + pos.yGap

        // layer #3 : HAProxy
        if (haProxy) {
            // loadbalancer
            haProxy.position.x = pos.x
            haProxy.position.y = pos.y
            Helper.updateNodePosition(haProxy.id)

            pos.y += haProxy.dimensions.height + pos.yGap
        }

        // layer #4 : Workers
        itemPos = { x: pos.x2, y: pos.y, maxHeight: 0 }
        const workers = Helper.getNodesByType(ClusterComponentTypes.Worker, cloudId)
        workers.forEach(w => {
            w.position.x = itemPos.x
            w.position.y = itemPos.y
            Helper.updateNodePosition(w.id)

            if (itemPos.maxHeight < w.dimensions.height) itemPos.maxHeight = w.dimensions.height
            itemPos.x += w.dimensions.width + pos.xGap
        })
        pos.y += itemPos.maxHeight + pos.yGap

        // layer #5 : Storage Cluster (CEPH)
        const storageCluster = Helper.getNodesByType(ClusterComponentTypes.StorageCluster, cloudId)[0]!
        if (storageCluster) {
            storageCluster.position.x = pos.x
            storageCluster.position.y = pos.y
            Helper.updateNodePosition(storageCluster.id)

            pos.y += storageCluster.dimensions.height + pos.yGap
        }

        // 많은 수를 기준으로 Parent Width 재 구성
        if (masters.length > workers.length) {
            handleParentResizing(masters.at(-1), Helper.getNodes())
        } else {
            handleParentResizing(workers.at(-1), Helper.getNodes())
        }

        // 제일 마지막 항목을 기준으로 Parent Height 재 구성
        if (storageCluster) {
            handleParentResizing(storageCluster, Helper.getNodes())
        }
    }
    Helper.listenEvent('cloud', (event) => {
        nextTick(() => {
            switch (event.type) {
                case 'adjust':
                    Helper.adjustSiblings(cloudId)
                    break;
                case 'arrange':
                    arrangeChilds()
                    break;
            }
        })
    })

    return {
        cloudNode,

        processChilds,
        arrangeChilds,
        removeChilds
    }
}