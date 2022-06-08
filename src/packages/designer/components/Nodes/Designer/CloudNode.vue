<template>
    <div class="cloud-container"
         @drop="onDrop">
        <component :is="props.label"
                   v-if="typeof props.label !== 'string' && props.label" />
        <span v-html="props.label" />
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

import { Position, ClusterComponentTypes, useVueFlow } from "../../../index";
import Handle from "../../Handle/Handle.vue";
import type { NodeProps } from "../../../types/node";
import { sleep, useDesignerHelper } from "../../../composables";

const props = defineProps<NodeProps>()
const { onNodeDragStop, instance, store } = useVueFlow();

const { masters, processNodes, arrangeMembers } = useDesignerHelper(store, props.id)

const watchIgnores = ref({ master: false, worker: false })

watch(() => props.data.masterCount, (newVal, oldVal) => {
    // 삭제되는 경우 제외
    if (newVal < 1) {
        // TODO: Message 처리
        alert('Master 갯수 확인')
        watchIgnores.value.master = true
        props.data.masterCount = oldVal;
        return;
    }

    if (!watchIgnores.value.master) {
        processNodes(ClusterComponentTypes.Master, oldVal, true)
        processNodes(ClusterComponentTypes.Master, newVal)
        nextTick(() => { arrangeMembers() })
    } else {
        watchIgnores.value.master = false
    }
})

watch(() => props.data.useExternalETCD, (newVal, oldVal) => {
    masters.value.forEach(m => {
        m.data.hasETCD = !newVal
    })

    processNodes(ClusterComponentTypes.ETCDCluster, 1, !newVal)
    nextTick(() => { arrangeMembers() })
})

watch(() => props.data.workerCount, (newVal, oldVal) => {
    if (newVal < 1) {
        // TODO: Message 처리
        alert('Worker 갯수 확인')
        watchIgnores.value.worker = true
        props.data.workerCount = oldVal;
        return;
    }

    if (!watchIgnores.value.worker) {
        processNodes(ClusterComponentTypes.Worker, oldVal, true)
        sleep(200)
        processNodes(ClusterComponentTypes.Worker, newVal)
        nextTick(() => { arrangeMembers() })
    } else {
        watchIgnores.value.worker = false
    }
})

watch(() => props.data.useCeph, (newVal, oldVal) => {
    processNodes(ClusterComponentTypes.StorageCluster, 1, !newVal)
    nextTick(() => { arrangeMembers() })
})

const onDrop = (event: DragEvent) => {
    // TODO: Drop이 발생한 경우
    event.stopPropagation();
    if (instance.value) {
    }
};

onNodeDragStop(({ node }) => {
    // TODO: 내부 멤버의 Drag 처리
});

onMounted(() => {
    //TODO: 초기 설정 구성
    processNodes(ClusterComponentTypes.Master, props.data.masterCount)
    processNodes(ClusterComponentTypes.Worker, props.data.workerCount)
    if (props.data?.useCeph) {
        processNodes(ClusterComponentTypes.StorageCluster, 1)
    }

    nextTick(() => {
        const currNode = store.nodes.find(n => n.id === props.id)
        currNode.nodeElement = props.nodeElement;
        arrangeMembers()
    })
})

onBeforeUnmount(() => {
    // 자식 구성 요소 모두 제거
    store.applyEdgeChanges(store.edges.filter(e => e.source === props.id || e.target === props.id).map(item => ({ id: item.id, type: 'remove' })))
    store.applyNodeChanges(store.nodes.filter(n => n.parentNode === props.id).map(item => ({ id: item.id, type: 'remove' })))
})
</script>

<style scoped lang="scss">
</style> 