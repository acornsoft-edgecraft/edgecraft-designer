<template>
	<div class="flex flex-row">
		<template v-for="(_, i) in ipv4"
				  :key="i">
			<K3InputNumber class="p-inputtext-sm"
						   :format="false"
						   :disabled="readonly"
						   v-model="ipv4[i]"
						   :min="0"
						   :max="255"
						   @blur="changed" />
			<span v-show="i < 3">.</span>
		</template>
	</div>
</template>
<script setup lang="ts">
import { defineProps, defineEmits, PropType } from '@vue/runtime-core';
import type { RowType } from '../../types/Types';

const IPV4 = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\/?$/;

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

const ipv4 = ref([])

const changed = () => {
	nextTick(() => {
		const changedVal = `${ipv4.value.join('.')}`
		if (IPV4.test(changedVal)) {
			nextTick(() => {
				props.modelValue[props.config.field!] = changedVal
			})
		} else {
			// TODO: Message
			alert('ERROR!!')
		}
	})
}

onMounted(() => {
	const val = props.modelValue[props.config.field!] as string
	if (val && IPV4.test(val)) {
		ipv4.value = val.split('.').map(i => parseInt(i))
	} else {
		ipv4.value = '192.168.100.128'.split('.').map(i => parseInt(i))
	}
})
</script>
<style lang="scss" scoped>
.p-inputnumber {
	padding: 0;
	border: none;

	:deep(.p-inputnumber-input) {
		padding: 0;
		border: none;
		max-width: 2rem;
		text-align: center;
	}
}
</style>
