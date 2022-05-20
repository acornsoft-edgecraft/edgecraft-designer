<template>
	<K3Checkbox v-model="checked"
				:binary="true"
				:disabled="readonly"
				@change="emitChange" />
</template>

<script setup lang="ts">
import { defineProps, defineEmits, PropType } from '@vue/runtime-core';
import type { RowType } from '../../types/Types';

const emit = defineEmits(['change']);
let emitChange = () => {
	props.modelValue[props.config.field!] = checked.value
	emit('change');
};

const props = defineProps({
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

const checked = ref(props.modelValue[props.config.field!])
</script>

<style lang="scss" scoped>
.p-checkbox-box {
	font-size: .875rem;
	padding: 0.15rem;
}
</style>
