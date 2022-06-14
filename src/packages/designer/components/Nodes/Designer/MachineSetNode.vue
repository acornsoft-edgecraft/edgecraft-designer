useMachineSetHelper<template>
    <span v-html="props.label" />
    <div class="props-disp-container">
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
import { adjustSiblings, useVueFlow } from "../../../composables";
import Handle from "../../Handle/Handle.vue";
import { ClusterComponentTypes, MachineSetRoles, Position } from "../../../types";
import type { NodeProps } from "../../../types/node";
import { useMachineSetHelper } from "../../../composables";

const { store } = useVueFlow()

const props = withDefaults(defineProps<NodeProps>(), {
    connectable: false
});

const { capiNode, machineSetNode, memberNodes, processNodes, removeMemberNodes, arrangeMembers } = useMachineSetHelper(store, props.id)

const watchIgnores = ref({ memberCount: false })

const getMemberType = () => props.data?.role === MachineSetRoles.Master ? ClusterComponentTypes.Master : ClusterComponentTypes.Worker

watch(() => props.data?.memberCount, (newVal, oldVal) => {
    if (newVal < 1) {
        // TODO: Message 처리
        alert('Machine 갯수 확인')
        watchIgnores.value.memberCount = true
        props.data.memberCount = oldVal;
        return;
    }

    // parentNode의 Master/Worker 갯수 반영
    const nodeType = getMemberType()
    if (nodeType === ClusterComponentTypes.Master) {
        capiNode.value.data.masterCount = newVal
    } else {
        capiNode.value.data.workerCount = newVal + memberNodes.value.filter(n => n.type === ClusterComponentTypes.WorkerSet && n.id !== props.id).reduce((p, n) => p + n.data?.memberCount, 0)
    }

    if (!watchIgnores.value.memberCount) {
        processNodes(nodeType, oldVal, true)
        nextTick(() => {
            processNodes(nodeType, newVal)
            nextTick(() => { arrangeMembers() })
        })
    } else {
        watchIgnores.value.memberCount = false
    }
})

onMounted(() => {
    if (props.data?.role === MachineSetRoles.Master) {
        processNodes(ClusterComponentTypes.Master, props.data?.memberCount)
    } else {
        processNodes(ClusterComponentTypes.Worker, props.data?.memberCount)
    }
    nextTick(() => {
        arrangeMembers()
        adjustSiblings()
        machineSetNode.value.nodeElement = props.nodeElement
    })
})

onBeforeUnmount(() => {
    // 자식 구성 요소 모두 제거
    removeMemberNodes()
})
</script>

<style scoped lang="scss">
.props-disp-container {
    img {
        width: 50px;
        height: 50px;
    }

    img.small {
        width: 20px;
        height: 20px;
    }

}
</style>