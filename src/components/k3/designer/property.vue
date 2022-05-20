<template>
  <LiveForm :schema="schema"
            v-model="data"
            @change="onChanged" />
</template>

<script setup lang="ts">
import { PropType } from "vue";
import LiveForm from "~/packages/liveform";
import { SchemaType } from "~/packages/liveform/types/Types";
/**
 * 여기서는 해당 화면 생성 이전에 처리할 설정을 구성합니다.
 * this 등의 사용이 불가능합니다.
 */
// imports
// Props
const props = defineProps({
  schema: { type: Object as PropType<SchemaType>, default: { labelWidth: '120px', rows: [] } },
  data: { type: Object, default: {} },
});
// Emits
const emits = defineEmits(["update:data"]);
// Properties
// Compputed
// Watcher
// Methods
const onChanged = () => {
  emits("update:data", props.data);
};
// Events
// Logics (like api call, etc)
</script>

<style scoped lang="scss">
</style>
