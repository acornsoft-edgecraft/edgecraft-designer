<template>
    <div class="cluster-container"
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
import { Position, ClusterComponentTypes, Helper } from "../../../index";
import Handle from "../../Handle/Handle.vue";
import type { NodeProps } from "../../../types/node";
import { useCAPIHandler } from "../../../composables";

const props = defineProps<NodeProps>()
const { processChilds, arrangeChilds, removeChilds } = useCAPIHandler(props.id)

const onDrop = (event: DragEvent) => {
    // TODO: Drop이 발생한 경우
    event.stopPropagation();
    // if (instance.value) {
    // }
};
// onNodeDragStop(({ node }) => {
//     // TODO: 내부 멤버의 Drag 처리
// });
onMounted(() => {
    //TODO: 초기 설정 구성
    processChilds(ClusterComponentTypes.Bastion, 1)
    processChilds(ClusterComponentTypes.MasterGroup, 1)
    processChilds(ClusterComponentTypes.WorkerGroup, 1)
    processChilds(ClusterComponentTypes.StorageCluster, 1)

    nextTick(() => {
        Helper.setNodeElement(props.id, props.nodeElement)
        arrangeChilds()
        Helper.adjustSiblings(props.id)
    })
})
onBeforeUnmount(() => {
    // 자식 구성 요소 모두 제거
    removeChilds()
})
</script>

<style scoped lang="scss">
</style> 