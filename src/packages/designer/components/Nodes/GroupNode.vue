<script lang="ts" setup>
import { Handle, Position, Node, XYPosition, useVueFlow } from "../../index";
import { getMousePosition } from "../UserSelection/utils";
import type { NodeProps } from "../../types/node";
import { getRectOfNodes } from "../../utils";
// import Handle from "../Handle/Handle.vue";
// import { Position } from "../../types";

const container = ref(null);
let id = 0;
const getId = () => `${props.id}_child-${id++}`;
const props = defineProps<NodeProps>();
const { onNodeDragStop, transform, instance, updateNodePosition, updateNodeDimensions, addNodes, store } = useVueFlow();

const getPosition = (event) => {
  const node = store.getNode(props.id);
  const relatedPos = getMousePosition(event) as XYPosition;
  const pos = instance.value.project({ x: relatedPos.x, y: relatedPos.y });
  pos.x = pos.x - node.computedPosition.x;
  pos.y = pos.y - node.computedPosition.y;
  return pos;
};

const style = computed(() => {
  return `width: ${props.dimensions.width}; height: ${props.dimensions.height}`;
});

onNodeDragStop(({ node }) => {
  // console.log(`Dragstop on Gorup: ${JSON.stringify(node)}`);
  // const nodes = getNodesInside(getNodes.value, { ...props.dimensions, x: props.computedPosition.x, y: props.computedPosition.y }, transform.value);
  // if (nodes.some((n) => n.id === node.id && n.id !== props.id)) {
  //   node.label = `In ${props.id}`;
  //   node.data = { group: props.id };
  // } else if (node.data?.group === props.id) {
  //   node.data.group = undefined;
  //   node.label = node.id;
  // }
});

const onDrop = (event: DragEvent) => {
  event.stopPropagation();

  if (instance.value) {
    const type = event.dataTransfer?.getData("application/vueflow");
    const _id = getId();
    const newNode = {
      id: _id,
      type,
      position: getPosition(event),
      label: `${type} node`,
      data: { name: "test-node", enabled: true, id: _id },
      parentNode: props.id,
      extent: "parent",
      expandParent: true,
    } as Node;
    addNodes([newNode]);
    //updateNodeDimensions([{ id: _id, nodeElement: container.value, forceUpdate: true }]);
    nextTick(() => {
      updateNodeDimensions([{ id: props.id, nodeElement: container.value, forceUpdate: true }]);

      container.value.style.width = `${props.dimensions.width + 20}px`;
      container.value.style.height = `${props.dimensions.height + 20}px`;
    });
  }
};
</script>
<script lang="ts">
export default {
  name: "GroupNode",
};
</script>

<template>
  <!-- <div class="vue-flow__group-node"> -->
  <div ref="container" class="group_container" @drop="onDrop">
    <Handle type="target" :position="Position.Top" />
    <span v-html="props.label" />
    <Handle type="source" :position="Position.Bottom" />
  </div>

  <!-- </div> -->
</template>

<style lang="scss">
.group_container {
  // // padding: 15px;
  // width: 100%;
  min-width: 200px;
  min-height: 300px;
  // height: 100%;
  // // height: 300px;
  //border: solid 1px black;
}
</style>
