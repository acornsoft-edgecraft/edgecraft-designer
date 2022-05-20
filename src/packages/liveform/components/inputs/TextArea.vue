<template>
	<K3Textarea v-model="modelValue[config.field!]"
				:disabled="readonly"
				:type="config.type === 'password' ? 'password' : 'text'"
				@change="emitChange" />
	<!-- <textarea
		v-model="modelValue[config.field!]"
		:readonly="config.readonly"
		:type="config.type === 'password' ? 'password' : 'text'"
		@change="emitChange"
	/> -->
</template>
<script setup lang="ts">
import { defineProps, PropType, defineEmits } from '@vue/runtime-core';
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
		required: true
	}
});
</script>

<style lang="scss" scoped>
.p-inputtext {
	border-radius: 0;
	border: none;
	font-size: .875rem;
	padding: 0.15rem;
}
</style>
