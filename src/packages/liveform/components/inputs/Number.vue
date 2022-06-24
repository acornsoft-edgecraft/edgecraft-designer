<template>
	<K3InputNumber id="integeronly"
				   :disabled="readonly"
				   v-model="modelValue[config.field!]" />
</template>
<script setup lang="ts">
import { defineProps, defineEmits, PropType } from '@vue/runtime-core';
import type { RowType } from '../../types/Types';

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
		required: true,
	}
});

//TODO: Validation 및 oldValue 재 처리 검토
</script>
<style lang="scss" scoped>
.p-inputnumber {
	width: 100%;

	:deep(.p-inputtext) {
		border-radius: 0;
		border: none;
		font-size: .875rem;
		padding: 0.15rem;
	}
}
</style>
