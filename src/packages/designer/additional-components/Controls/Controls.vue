<script lang="ts" setup>
import { useZoomPanHelper, useVueFlow } from "../../composables";
import type { ControlProps, ControlEvents } from "../../types/components";
import ControlButton from "./ControlButton.vue";

const props = withDefaults(defineProps<ControlProps>(), {
  showZoom: true,
  showFitView: true,
  showInteractive: true,
});
const emit = defineEmits<ControlEvents>();

const { store } = useVueFlow();
const { zoomIn, zoomOut, fitView } = useZoomPanHelper();

const isInteractive = computed(() => store.nodesDraggable && store.nodesConnectable && store.elementsSelectable);

const onZoomInHandler = () => {
  zoomIn();
  emit("zoom-in");
};

const onZoomOutHandler = () => {
  zoomOut();
  emit("zoom-out");
};

const onFitViewHandler = () => {
  fitView(props.fitViewParams);
  emit("fit-view");
};

const onInteractiveChangeHandler = () => {
  store.setInteractive(!isInteractive.value);
  emit("interaction-change", !isInteractive.value);
};
</script>
<script lang="ts">
export default {
  name: "Controls",
};
</script>
<template>
  <div class="vue-flow__controls">
    <template v-if="props.showZoom">
      <slot name="control-zoom-in">
        <ControlButton class="vue-flow__controls-zoomin" @click="onZoomInHandler">
          <slot name="icon-zoom-in">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
              <path d="M32 18.133H18.133V32h-4.266V18.133H0v-4.266h13.867V0h4.266v13.867H32z" />
            </svg>
          </slot>
        </ControlButton>
      </slot>
      <slot name="control-zoom-out">
        <ControlButton class="vue-flow__controls-zoomout" @click="onZoomOutHandler">
          <slot name="icon-zoom-out">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 5">
              <path d="M0 0h32v4.2H0z" />
            </svg>
          </slot>
        </ControlButton>
      </slot>
    </template>
    <slot name="control-fitview">
      <ControlButton v-if="props.showFitView" class="vue-flow__controls-fitview" @click="onFitViewHandler">
        <slot name="icon-fitview">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 30">
            <path
              d="M3.692 4.63c0-.53.4-.938.939-.938h5.215V0H4.708C2.13 0 0 2.054 0 4.63v5.216h3.692V4.631zM27.354 0h-5.2v3.692h5.17c.53 0 .984.4.984.939v5.215H32V4.631A4.624 4.624 0 0027.354 0zm.954 24.83c0 .532-.4.94-.939.94h-5.215v3.768h5.215c2.577 0 4.631-2.13 4.631-4.707v-5.139h-3.692v5.139zm-23.677.94c-.531 0-.939-.4-.939-.94v-5.138H0v5.139c0 2.577 2.13 4.707 4.708 4.707h5.138V25.77H4.631z" />
          </svg>
        </slot>
      </ControlButton>
    </slot>
    <slot name="control-interactive">
      <ControlButton v-if="props.showInteractive" class="vue-flow__controls-interactive" @click="onInteractiveChangeHandler">
        <slot name="icon-unlock">
          <svg v-if="isInteractive" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 32">
            <path
              d="M21.333 10.667H19.81V7.619C19.81 3.429 16.38 0 12.19 0c-4.114 1.828-1.37 2.133.305 2.438 1.676.305 4.42 2.59 4.42 5.181v3.048H3.047A3.056 3.056 0 000 13.714v15.238A3.056 3.056 0 003.048 32h18.285a3.056 3.056 0 003.048-3.048V13.714a3.056 3.056 0 00-3.048-3.047zM12.19 24.533a3.056 3.056 0 01-3.047-3.047 3.056 3.056 0 013.047-3.048 3.056 3.056 0 013.048 3.048 3.056 3.056 0 01-3.048 3.047z" />
          </svg>
        </slot>
        <slot name="icon-lock">
          <svg v-if="!isInteractive" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 32">
            <path
              d="M21.333 10.667H19.81V7.619C19.81 3.429 16.38 0 12.19 0 8 0 4.571 3.429 4.571 7.619v3.048H3.048A3.056 3.056 0 000 13.714v15.238A3.056 3.056 0 003.048 32h18.285a3.056 3.056 0 003.048-3.048V13.714a3.056 3.056 0 00-3.048-3.047zM12.19 24.533a3.056 3.056 0 01-3.047-3.047 3.056 3.056 0 013.047-3.048 3.056 3.056 0 013.048 3.048 3.056 3.056 0 01-3.048 3.047zm4.724-13.866H7.467V7.619c0-2.59 2.133-4.724 4.723-4.724 2.591 0 4.724 2.133 4.724 4.724v3.048z" />
          </svg>
        </slot>
      </ControlButton>
    </slot>
    <slot></slot>
  </div>
</template>
