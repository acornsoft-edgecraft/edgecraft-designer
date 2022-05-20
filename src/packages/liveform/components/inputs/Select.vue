<template>
	<K3Dropdown class="p-inputext-sm"
				v-model="modelValue[config.field!]"
				:options="typeof config.options === 'string' ? modelValue[config.options] : config.options"
				:optionLabel="config.optionLabel!"
				:optionValue="config.optionValue!"
				:disabled="readonly"
				@change="emitChange" />
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
		required: true,
	}
});
</script>

<style lang="scss" scoped>
.p-dropdown {
	border: none;
	width: 100%;

	:deep(span.p-inputtext) {
		font-size: .875rem;
		padding: 0.15rem;
	}
}
</style>
