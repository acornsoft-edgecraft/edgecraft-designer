<template>
  <div class="component-container">
    <div v-if="isSupported && memory" class="flex flex-row align-items-center justify-content-center m-2">
      <template v-if="memory">
        <K3Tag class="flex mr-2" opacity="50" severity="success" :value="`Used: ${size(memory.usedJSHeapSize)}`" />
        <K3Tag class="flex mr-2" opacity="50" severity="primary" :value="`Allocated: ${size(memory.totalJSHeapSize)}`" />
        <K3Tag class="flex mr-2" opacity="50" severity="info" :value="`Limit: ${size(memory.jsHeapSizeLimit)}`" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 여기서는 해당 화면 생성 이전에 처리할 설정을 구성합니다.
 * this 등의 사용이 불가능합니다.
 */
// imports
import { useMemory } from "@vueuse/core";
// Props
// const props = defineProps({})
// Emits
// const emits = defineEmits(['eventname'])
// Properties
const { isSupported, memory } = useMemory();
// Compputed
// Watcher
// Methods
const size = (v: number) => {
  const kb = v / 1024 / 1024;
  return `${kb.toFixed(2)} MB`;
};
// Events
// Logics (like api call, etc)
</script>

<style scoped lang="scss">
.p-tag {
  width: 150px;
}
</style>
