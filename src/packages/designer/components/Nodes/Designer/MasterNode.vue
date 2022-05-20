<template>
    <component :is="props.label"
               v-if="typeof props.label !== 'string' && props.label" />
    <span v-else
          v-html="props.label" />
    <div class="props-disp-container">
        <img v-if="props.data.hasETCD"
             draggable="false"
             src="/images/designer/etcd.png" />
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
import { useVueFlow } from "../../../composables";
import Handle from "../../Handle/Handle.vue";
import { Position } from "../../../types";
import type { NodeProps } from "../../../types/node";

const { store } = useVueFlow()

const props = withDefaults(defineProps<NodeProps>(), {
    connectable: false
});

onMounted(() => {
    nextTick(() => {
        const currNode = store.nodes.find(n => n.id === props.id)
        currNode.nodeElement = props.nodeElement;
    })
})
</script>

<style scoped lang="scss">
.props-disp-container {
    img {
        width: 20px;
        height: 20px;
    }
}
</style>