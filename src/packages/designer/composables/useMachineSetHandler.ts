import { ClusterComponentTypes, CloudTypes, WorkerRoles } from '../types'
import * as Helper from '../utils/designer'

export default (msId: string) => {
    const machineSetNode = Helper.getNodesById(msId)[0]!

    watch(() => machineSetNode.data?.memberCount, (newVal, oldVal) => {
        if (machineSetNode) {
            if (newVal < 1 || newVal > 10) {
                //TODO: Message
                alert('Member count check!!')
                return
            }

            const nodeType = machineSetNode.type === ClusterComponentTypes.MasterSet ? ClusterComponentTypes.Master : ClusterComponentTypes.Worker
            processChilds(nodeType, oldVal, true)
            processChilds(nodeType, newVal)

            nextTick(() => {
                // master/worker 갯수 조정
                Helper.emitEvent(nodeType, 'capi', newVal)

                arrangeChilds()
                Helper.emitEvent('arrange', 'capi')
            })
        }
    })

    const removeChilds = () => {
        Helper.removeNodes(Helper.getChildNodes(msId).map(m => ({ id: m.id, type: 'remove' })))
    }
    const removeChildNodes = (nodeType: ClusterComponentTypes) => {
        const nodes = []

        nodes.push(...Helper.getNodesByType(nodeType, msId).map(item => ({ id: item.id, type: 'remove' })))

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
            const node = Helper.getNewNode(nodeType, true, msId)
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
        const pos = { x: 20, xGap: 20 }

        Helper.getChildNodes(msId).forEach(c => {
            c.position.x = pos.x
            Helper.updateNodePosition(c.id)
            pos.x += c.dimensions.width + pos.xGap
        })

        nextTick(() => Helper.emitEvent('adjust', 'capi'))
    }

    return {
        machineSetNode,

        processChilds,
        arrangeChilds,
        removeChilds
    }
}