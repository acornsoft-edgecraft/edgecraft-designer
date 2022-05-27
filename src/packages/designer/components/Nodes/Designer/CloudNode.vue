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

import { Position, GraphNode, ClusterComponentTypes, useVueFlow } from "../../../index";
import Handle from "../../Handle/Handle.vue";
import type { NodeProps } from "../../../types/node";
import { useCloudHelper } from "../../../composables";

const props = defineProps<NodeProps>()
const { onNodeDragStop, instance, store } = useVueFlow();

const { processNodes, arrangeMembers } = useCloudHelper(store, props.id)

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

    nextTick(() => {
        arrangeMembers()
        const currNode = store.nodes.find(n => n.id === props.id)
        currNode.nodeElement = props.nodeElement;
    })
})

onBeforeUnmount(() => {
    // 자식 구성 요소 모두 제거
    store.applyNodeChanges(store.nodes.filter(n => n.parentNode === props.id).map(item => ({ id: item.id, type: 'remove' })))
})
</script>

<style scoped lang="scss">
</style> 