<template>
	<K3Textarea v-model="modelValue[config.field!]"
				:disabled="readonly"
				:type="config.type"
				@change="onChange" />
</template>
<script setup lang="ts">
import { defineProps, PropType, defineEmits } from '@vue/runtime-core';
import type { RowType } from '../../types/Types';

const emit = defineEmits(['change']);
const temp = ref("")
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
		required: true
	}
});

const onChange = () => {
	props.modelValue[props.config.field!] = temp.value;
	emit('change')
}

onMounted(() => {
	temp.value = props.modelValue[props.config.field!]
})
</script>

<style lang="scss" scoped>
.p-inputtext {
	border-radius: 0;
	border: none;
	font-size: .875rem;
	padding: 0.15rem;
}
</style>
