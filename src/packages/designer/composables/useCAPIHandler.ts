import { Edge, ClusterComponentTypes } from '../types'
import { handleParentResizing } from '../utils'
import * as Helper from '../utils/designer'

export default (capiId: string) => {
    const capiNode = Helper.getNodesById(capiId)[0]!

    watch(() => capiNode.data?.masterCount, (newVal, oldVal) => {
        if (newVal < 1) {
            alert('check master count')
            return
        }

        processChilds(ClusterComponentTypes.Master, 1, newVal === 1)
        const etcdCluster = Helper.getNodesByType(ClusterComponentTypes.ETCDCluster, capiId)[0]!
        if (etcdCluster) capiNode.data.useExternalETCD = newVal !== 1

        Helper.emitEvent('arrange', 'capi')
    })
    watch(() => capiNode.data?.useExternalETCD, (newVal) => {
        Helper.getChildNodesByType(ClusterComponentTypes.Master, capiId).forEach(n => n.data.hasETCD = !newVal)
        processChilds(ClusterComponentTypes.ETCDCluster, 1, !newVal)

        Helper.emitEvent('arrange', 'capi')
    })
    watch(() => capiNode.data?.useCeph, (newVal) => {
        processChilds(ClusterComponentTypes.StorageCluster, 1, !newVal)

        Helper.emitEvent('arrange', 'capi')
    })
    watch(() => capiNode.data?.useBastion, (newVal) => {
        processChilds(ClusterComponentTypes.Bastion, 1, !newVal)

        Helper.emitEvent('arrange', 'capi')
    })
    watch(() => capiNode.dimensions, () => {
        Helper.adjustSiblings(capiId)
    })

    const removeGroupConnection = (edges: Edge[], parentId: string) => {
        const masterGroup = Helper.getNodesByType(ClusterComponentTypes.MasterGroup, parentId)[0]!
        const workerGroup = Helper.getNodesByType(ClusterComponentTypes.WorkerGroup, parentId)[0]!
        Helper.removeEdges([{ id: Helper.getEdgeByConnection(masterGroup.id, workerGroup.id)?.id, type: 'remove' }])
    }
    const removeChilds = () => {
        Helper.removeNodes(Helper.getChildNodes(capiId).map(m => ({ id: m.id, type: 'remove' })))
    }
    const removeChildNodes = (nodeType: ClusterComponentTypes) => {
        const nodes = []

        if (nodeType === ClusterComponentTypes.Master) {
            nodes.push(...Helper.getNodesByType(ClusterComponentTypes.LoadBalancer, capiId).map(m => ({ id: m.id, type: 'remove' })));
            const masterEdges = []
            Helper.connectWorkerGroupToMasterGroup(masterEdges, capiId)
            Helper.addEdges(masterEdges)
        }
        else {
            nodes.push(...Helper.getNodesByType(nodeType, capiId).map(m => ({ id: m.id, type: 'remove' })));
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

        if (nodeType === ClusterComponentTypes.Master) {
            newNodes.push(Helper.getHAProxyNode(capiId))
        } else {
            // 개별 노드 추가
            for (let i = 0; i < nodeCount; i++) {
                const node = Helper.getNewNode(nodeType, true, capiId)
                if (nodeCount > 1) {
                    node.data.name = node.label = `${node.data.name} #${i}`
                }
                newNodes.push(node)
            }
        }

        Helper.addNodes(newNodes)
    }
    const addChildEdges = (nodeType: ClusterComponentTypes, nodeCount: number) => {
        const newEdges = []

        const bastion = Helper.getNodesByType(ClusterComponentTypes.Bastion, capiId)[0]!
        const haProxy = Helper.getNodesByType(ClusterComponentTypes.LoadBalancer, capiId)[0]!
        const etcdCluster = Helper.getNodesByType(ClusterComponentTypes.ETCDCluster, capiId)[0]!
        const storageCluster = Helper.getNodesByType(ClusterComponentTypes.StorageCluster, capiId)[0]!
        const masterGroup = Helper.getNodesByType(ClusterComponentTypes.MasterGroup, capiId)[0]!
        const workerGroup = Helper.getNodesByType(ClusterComponentTypes.WorkerGroup, capiId)[0]!

        switch (nodeType) {
            case ClusterComponentTypes.Bastion:
                if (bastion) {
                    if (masterGroup) Helper.connectMasterGroupToBastion(newEdges, capiId)
                    if (workerGroup) Helper.connectWorkerGroupToBastion(newEdges, capiId)
                }
                break;
            case ClusterComponentTypes.MasterGroup:
                if (haProxy) {
                    Helper.connectMasterGroupToLB(newEdges, capiId)
                    if (workerGroup) Helper.connectWorkerGroupToLB(newEdges, capiId)

                    if (etcdCluster) {
                        Helper.connectMasterGroupToETCD(newEdges, capiId)
                    }
                }
                else {
                    if (workerGroup) Helper.connectWorkerGroupToMasterGroup(newEdges, capiId)
                }
                Helper.connectMasterGroupToBastion(newEdges, capiId)
                break;
            case ClusterComponentTypes.WorkerGroup:
                if (haProxy) {
                    Helper.connectWorkerGroupToLB(newEdges, capiId)
                } else {
                    if (masterGroup) Helper.connectWorkerGroupToMasterGroup(newEdges, capiId)
                }
                if (storageCluster) Helper.connectStorageClusterToWorkerGroup(newEdges, capiId)
                if (bastion) Helper.connectWorkerGroupToBastion(newEdges, capiId)
                break;
            case ClusterComponentTypes.ETCDCluster:
                if (masterGroup) Helper.connectMasterGroupToETCD(newEdges, capiId)
                break;
            case ClusterComponentTypes.StorageCluster:
                if (workerGroup) Helper.connectStorageClusterToWorkerGroup(newEdges, capiId)
                break;
            case ClusterComponentTypes.Master:
            case ClusterComponentTypes.LoadBalancer:
                removeGroupConnection(newEdges, capiId)
                if (masterGroup) Helper.connectMasterGroupToLB(newEdges, capiId)
                if (workerGroup) Helper.connectWorkerGroupToLB(newEdges, capiId)
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
        const pos = { x: 20, x2: 20, y: 40, xGap: 20, yGap: 20 }

        const bastion = Helper.getNodesByType(ClusterComponentTypes.Bastion, capiId)[0]!
        const haProxy = Helper.getNodesByType(ClusterComponentTypes.LoadBalancer, capiId)[0]!
        const etcdCluster = Helper.getNodesByType(ClusterComponentTypes.ETCDCluster, capiId)[0]!
        const storageCluster = Helper.getNodesByType(ClusterComponentTypes.StorageCluster, capiId)[0]!
        const masterGroup = Helper.getNodesByType(ClusterComponentTypes.MasterGroup, capiId)[0]!
        const workerGroup = Helper.getNodesByType(ClusterComponentTypes.WorkerGroup, capiId)[0]!

        // 구성요소에 따른 X좌표 조정
        if (bastion || storageCluster) {
            pos.x2 = Math.max(bastion?.dimensions.width || 0, storageCluster?.dimensions.width || 0) + pos.xGap
        }

        if (bastion) {
            bastion.position.x = pos.x
            bastion.position.y = pos.y
            Helper.updateNodePosition(bastion.id)
        }

        if (etcdCluster) {
            etcdCluster.position.x = pos.x2
            etcdCluster.position.y = pos.y
            Helper.updateNodePosition(etcdCluster.id)
            pos.y += etcdCluster.dimensions.height + pos.yGap
        }

        masterGroup.position.x = pos.x2
        masterGroup.position.y = pos.y
        Helper.updateNodePosition(masterGroup.id)
        pos.y += masterGroup.dimensions.height + (pos.yGap * 2)

        if (haProxy) {
            haProxy.position.x = pos.x2
            haProxy.position.y = pos.y
            Helper.updateNodePosition(haProxy.id)
            pos.y += haProxy.dimensions.height + pos.yGap
        }

        workerGroup.position.x = pos.x2
        workerGroup.position.y = pos.y
        Helper.updateNodePosition(workerGroup.id)
        pos.y += workerGroup.dimensions.height + pos.yGap

        if (storageCluster) {
            storageCluster.position.x = pos.x
            storageCluster.position.y = pos.y
            Helper.updateNodePosition(storageCluster.id)
            pos.y += storageCluster.dimensions.height + pos.yGap
        }

        // 제일 마지막 항목을 기준으로 Parent Height 재 구성
        handleParentResizing(workerGroup, Helper.getNodes())

        if (storageCluster) {
            handleParentResizing(storageCluster, Helper.getNodes())
        }
    }
    Helper.listenEvent('capi', (event) => {
        nextTick(() => {
            switch (event.type) {
                case 'master':
                    capiNode.data.masterCount = Helper.getChildNodesByType(ClusterComponentTypes.Master, capiId).length
                    break;
                case 'worker':
                    capiNode.data.workerCount = Helper.getChildNodesByType(ClusterComponentTypes.Worker, capiId).length
                    break;
                case 'adjust':
                    Helper.adjustSiblings(capiNode.id)
                    break;
                case 'arrange':
                    arrangeChilds()
                    break;
            }
        })
    })

    return {
        capiNode,

        processChilds,
        arrangeChilds,
        removeChilds
    }
}