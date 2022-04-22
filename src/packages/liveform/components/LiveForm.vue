<template v-if="isMounted">
  <div class="sf-container">
    <div class="sf-row" v-for="(row, index) in props.schema?.rows" :key="`${row}-${String(index)}`" :class="{ 'sf-row-flex-column': row.type === 'nested' }">
      <template v-if="evaluateConditionalDisplay(row, modelValue)">
        <div class="sf-row-label">{{ row.label ?? row.field }}</div>
        <div class="sf-row-input">
          <component v-if="modelValue" :is="getComponent(row.type)" v-model="modelValue" :config="row" :readonly="row.readonly ?? false" @change="emitChange" />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import getComponent from "./componentMap";
import evaluateConditionalDisplay from "../helpers/evaluateConditionalDisplay";
import { SchemaType } from "~/packages/liveform/types/types";

let isMounted = ref(false);

const emit = defineEmits(["change"]);
let emitChange = () => {
  emit("change");
};

const props = defineProps({
  schema: {
    type: Object as PropType<SchemaType>,
    required: false,
    default: {},
  },
  modelValue: {
    type: Object,
    required: true,
    default: {},
  },
});

// interface LiveFormProp {
//   schema: any;
//   modelValue: any;
// }

// const props = withDefaults(defineProps<LiveFormProp>(), {});

onMounted(() => {
  isMounted.value = true;
  console.log(`liveform: ${JSON.stringify(props)}`);
});
</script>

<script lang="ts">
export default {
  name: "LiveForm",
};
</script>

<style scoped lang="scss">
.sf-container {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 10px;
  color: inherit;

  .sf-row {
    display: flex;
    padding: 10px;
    position: relative;

    input[type="text"],
    input[type="password"],
    input[type="date"],
    input[type="number"],
    textarea,
    select {
      flex: 1;
      border: none;
      background-color: rgba(255, 255, 255, 0.6);
      padding: 8px;
      border-radius: 8px;
      font-family: inherit;
      font-size: 0.9em;
    }

    textarea {
      resize: vertical;
    }

    .sf-row-label {
      width: v-bind('props?.schema?.labelWidth ?? "150px"');
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin: 0 8px 0 0;
      height: 32px;
    }

    &.sf-row-flex-column {
      flex-direction: column;
      display: flex;
      align-items: center;
      justify-content: center;

      .sf-row-label {
        width: 100%;
        justify-content: center;
      }
      .sf-row-input {
        width: 100%;
        flex: 1;
        display: flex;
        position: relative;
      }
    }

    .sf-row-input {
      flex: 1;
      display: flex;
      position: relative;
    }
  }
}
</style>
