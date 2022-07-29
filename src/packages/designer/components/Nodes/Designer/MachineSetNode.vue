<template>
    <span v-html="props.label" />
    <div class="props-disp-container">
    </div>
</template>

<script setup lang="ts">
import { ClusterComponentTypes, Helper, Position } from "../../../index";
import Handle from "../../Handle/Handle.vue";
import type { NodeProps } from "../../../types/node";
import { useMachineSetHandler } from "../../../composables";

const props = withDefaults(defineProps<NodeProps>(), {
    connectable: false
});

const { processChilds, arrangeChilds, removeChilds } = useMachineSetHandler(props.id)

onMounted(() => {
    //TODO: 초기 설정 구성
    switch (props.type) {
        case ClusterComponentTypes.MasterSet:
            processChilds(ClusterComponentTypes.Master, props.data.memberCount)
            break;
        case ClusterComponentTypes.WorkerSet:
            processChilds(ClusterComponentTypes.Worker, props.data.memberCount)
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