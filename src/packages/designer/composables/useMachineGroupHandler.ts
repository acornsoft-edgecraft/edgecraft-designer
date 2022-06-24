import { ClusterComponentTypes, CloudTypes, WorkerRoles } from '../types'
import { handleParentResizing } from '../utils'
import * as Helper from '../utils/designer'

export default (mgId: string) => {
    const machineGroupNode = Helper.getNodesById(mgId)[0]!

    watch(() => machineGroupNode.data?.memberCount, (newVal, oldVal) => {
        if (machineGroupNode) {
            if (newVal < 1) {
                //TODO: Message
                alert('Member count check!!')
                return
            }

            const nodeType = machineGroupNode.type === ClusterComponentTypes.MasterGroup ? ClusterComponentTypes.MasterSet : ClusterComponentTypes.WorkerSet
            processChilds(nodeType, oldVal, true)
            processChilds(nodeType, newVal)

            nextTick(() => {
                arrangeChilds()
                Helper.emitEvent('arrange', 'capi')
            })
        }
    })

    const removeChilds = () => {
        Helper.removeNodes(Helper.getChildNodes(mgId).map(m => ({ id: m.id, type: 'remove' })))
    }
    const removeChildNodes = (nodeType: ClusterComponentTypes) => {
        const nodes = []

        nodes.push(...Helper.getNodesByType(nodeType, mgId).map(item => ({ id: item.id, type: 'remove' })))

        // 삭제할 Node에 연결된 Edges 삭제
        const nodeIds = nodes.map(n => n.id)

        Helper.removeEdges(Helper.getEdgesById(nodeIds).map(item => ({ id: item.id, type: 'remove' })))

        // Node 삭제
        Helper.removeNodes(nodes)
    }
    /**
    * 지정한 유형의 노드를 지정한 갯수만큼 추가 처리
    * @param nodeType 추가할 노드 유형
    * @param nodeCount 추가할 노드 갯수
    */
    const addChildNodes = (nodeType: ClusterComponentTypes, nodeCount: number) => {
        // Node 추가
        const newNodes = []

        // 개별 노드 추가
        for (let i = 0; i < nodeCount; i++) {
            const node = Helper.getNewNode(nodeType, true, mgId)
            if (nodeCount > 1) {
                node.data.name = node.label = `${node.data.name} #${i}`
            }
            newNodes.push(node)
        }

        Helper.addNodes(newNodes);
    }
    const processChilds = (nodeType: ClusterComponentTypes, nodeCount: number, isRemove: boolean = false) => {
        if (isRemove) {
            removeChildNodes(nodeType)
        } else {
            // 노드 추가
            addChildNodes(nodeType, nodeCount)
        }
    }
    const arrangeChilds = () => {
        const pos = { x: 20, y: 40, yGap: 20 }

        Helper.getChildNodes(mgId).forEach(c => {
            c.position.x = pos.x
            c.position.y = pos.y
            Helper.updateNodePosition(c.id)
            pos.y += c.dimensions.height + pos.yGap
        })
    }
    Helper.listenEvent('group', (event) => {
        nextTick(() => {
            switch (event.type) {
                case 'arrange':
                    arrangeChilds()
                    break;
            }
        })
    })

    return {
        machineGroupNode,

        processChilds,
        arrangeChilds,
        removeChilds
    }
}