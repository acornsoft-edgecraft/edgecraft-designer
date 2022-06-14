useDesignerHelper<template>
    <div class="cluster-container"
         @drop="onDrop">
        <component :is="props.label"
                   v-if="typeof props.label !== 'string' && props.label" />
        <span v-html="props.label" />
        {{ props.data.masterCount }}, {{ props.data.workerCount }}
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
import { useCAPIHelper } from "../../../composables";

const props = defineProps<NodeProps>()
const { onNodeDragStop, instance, store } = useVueFlow();

const { capiNode, removeMemberNodes, processNodes, arrangeMembers } = useCAPIHelper(store, props.id)

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
    processNodes(ClusterComponentTypes.Bastion, 1)
    processNodes(ClusterComponentTypes.MasterSet, props.data.masterSetCount)
    processNodes(ClusterComponentTypes.WorkerSet, props.data.workerSetCount)
    processNodes(ClusterComponentTypes.StorageCluster, 1)

    nextTick(() => {
        arrangeMembers()
        capiNode.value.nodeElement = props.nodeElement
    })
})

onBeforeUnmount(() => {
    // 자식 구성 요소 모두 제거
    removeMemberNodes()
})
</script>

<style scoped lang="scss">
</style> 