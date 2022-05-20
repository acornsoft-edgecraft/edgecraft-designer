<template>
  <div class="radio-item">
    <!-- Display options if config.options is a string referring to a top level array -->
    <template v-if="typeof config.options === 'string'">
      <div class="field-radiobutton"
           v-for="(option, index) in modelValue[config.options]"
           :key="`option-${index}`">
        <K3RadioButton :id="`option-${index}-${config.optionValue}-${config.optionLabel}`"
                       :value="config.optionValue ? option[config.optionValue] : option"
                       v-model="modelValue[config.field!]"
                       @change="emitChange"
                       :disabled="readonly" />
        <label :for="`option-${index}-${config.optionValue}-${config.optionLabel}`">{{ option[config.optionLabel!] ?? option }}</label>
      </div>
    </template>
    <!-- Display options if config.options is an array of options -->
    <template v-if="typeof config.options !== 'string' && config.options!.length > 0">
      <div class="field-radiobutton"
           v-for="(option, index) in config.options"
           :key="`option-${index}`">
        <K3RadioButton :id="`option-${index}-${config.optionValue}-${config.optionLabel}`"
                       :value="config.optionValue ? option[config.optionValue] : option"
                       v-model="modelValue[config.field!]"
                       @change="emitChange"
                       :disabled="readonly" />
        <label :for="`option-${index}-${config.optionValue}-${config.optionLabel}`">{{ option[config.optionLabel!] ?? option }}</label>
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
import { defineProps, defineEmits, PropType } from '@vue/runtime-core';
import type { RowType } from '../../types/Types';

const emit = defineEmits(['change']);
let emitChange = () => {
  emit('change');
};

defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  config: {
    type: Object as PropType<RowType>,
    required: true,
  },
  readonly: {
    type: Boolean,
    requried: true,
  }
});
</script>

<style lang="scss" scoped>
.radio-item {
  display: flex;
  flex-direction: column;

  .field-radiobutton {
    padding: 0;
    margin: 0;
    font-size: .875rem;
  }

  div.p-radiobutton-disabled+label {
    color: lightgray;
  }
}
</style>
