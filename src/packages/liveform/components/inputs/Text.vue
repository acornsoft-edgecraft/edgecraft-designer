<template>
	<K3InputText class="p-inputtext-sm"
				 :type="config.type === 'password' ? 'password' : 'text'"
				 :disabled="readonly"
				 v-model="temp"
				 @change="onChange" />
</template>
<script setup lang="ts">
import { defineProps, defineEmits, PropType } from '@vue/runtime-core';
import type { RowType } from '../../types/Types';

const emit = defineEmits(['change']);
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

const temp = ref("")

const onChange = () => {
	props.modelValue[props.config.field] = temp.value
	emit('change')
}

onMounted(() => {
	temp.value = props.modelValue[props.config.field]
})
</script>
<style lang="scss" scoped>
.p-inputtext {
	width: 100%;
	border-radius: 0;
	border: none;
	font-size: .875rem;
	padding: 0.15rem;
}
</style>
