<template>
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
import { Position, ClusterComponentTypes, MachineSetRoles, Helper } from "../../../index";
import Handle from "../../Handle/Handle.vue";
import type { NodeProps } from "../../../types/node";
import { useMachineGroupHandler } from "../../../composables";

const props = withDefaults(defineProps<NodeProps>(), {
    connectable: false
});

const { processChilds, arrangeChilds, removeChilds } = useMachineGroupHandler(props.id)

onMounted(() => {
    //TODO: 초기 설정 구성
    switch (props.type) {
        case ClusterComponentTypes.MasterGroup:
            processChilds(ClusterComponentTypes.MasterSet, props.data.memberCount)
            break;
        case ClusterComponentTypes.WorkerGroup:
            processChilds(ClusterComponentTypes.WorkerSet, props.data.memberCount)
            break;
    }

    nextTick(() => {
        Helper.setNodeElement(props.id, props.nodeElement)
        arrangeChilds()
    })
})
onBeforeUnmount(() => {
    // 자식 구성 요소 모두 제거
    removeChilds()
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