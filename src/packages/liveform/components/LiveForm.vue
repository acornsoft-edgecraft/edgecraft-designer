<template v-if="isMounted">
  <div class="props-container">
    <K3Toolbar>
      <template #start>{{ modelValue.name }}</template>
      <template #end>
        <K3Button class="p-button-sm"
                  label="Apply"
                  @click="onApply" />
      </template>
    </K3Toolbar>
    <K3Panel header="Properties">
      <div class="props-row"
           v-for="(row, index) in props.schema?.rows"
           :key="`${getKey(index)}`"
           :class="{ 'props-row-flex-column': row.type === 'nested' }">
        <template v-if="evaluateConditionalDisplay(row, modelValue)">
          <div class="props-row-label">{{ row.label ?? row.field }}</div>
          <div class="props-row-input">
            <component v-if="modelValue"
                       :key="`${getKey(index)}`"
                       :is="getComponent(row.type)"
                       v-model="modelValue"
                       :config="row"
                       :readonly="evaluateReadonlyCondition(row.readonly, modelValue)" />
          </div>
        </template>
      </div>
    </K3Panel>
  </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import getComponent from "./componentMap";
import { evaluateConditionalDisplay, evaluateReadonlyCondition } from "../helpers/condition";
import { SchemaType } from "~/packages/liveform/types/types";

let isMounted = ref(false);

const emit = defineEmits(["change"]);
// let emitChange = () => {
//   emit("change", props.modelValue);
// };

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
  keyField: {
    type: String,
    required: true,
    default: ''
  }
});

const getKey = (index: number) => {
  return `${index}-${props.modelValue[props.keyField].toLowerCase().replace(/\s/g, '_')}`
}

const onApply = () => {
  emit('change', props.modelValue)
}

onMounted(() => {
  isMounted.value = true;
});
</script>

<script lang="ts">
export default {
  name: "LiveForm",
};
</script>

<style scoped lang="scss">
.props-container {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background-color: #2a323d;
  height: 100%;
  color: #FFFFFF;
  padding: 0.1rem;

  .p-toolbar {
    border-radius: 0%;
    border: 1px solid gray;
    background-color: transparent;
    padding: 0.5rem 0.5rem;

    .p-button {
      padding: 0.25rem;
    }
  }

  :deep(.p-panel) {
    margin: 0px 2px 0 2px;

    .p-panel-header {
      padding: 0.25rem;
      margin: 0;
      border-radius: 0%;
    }

    .p-panel-content {
      padding: 0;

      .props-row {
        display: flex;
        position: relative;
        align-items: center;
        border-bottom: 1px solid lightgray;

        .props-row-label {
          display: flex;
          align-items: center;
          align-self: stretch;
          position: relative;
          justify-content: right;
          //width: v-bind('props?.schema?.labelWidth ?? "150px"');
          width: 40%;
          overflow: hidden;
          white-space: nowrap;
          color: white;
          padding: 0.25rem;
          background-color: darkgray;
          font-size: .875rem;
        }

        .props-row-input {
          display: flex;
          justify-content: left;
          position: relative;
          width: 60%;
          padding: 0.1rem 0.25rem 0.1rem 0.25rem;
          background-color: #FFFFFF
        }
      }
    }
  }
}
</style>
