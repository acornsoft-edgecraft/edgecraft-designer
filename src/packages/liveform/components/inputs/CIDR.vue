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
						   @input="changed"
						   @blur="changed" />
			<span v-show="i < 3">.</span>
		</template>
		<span>/</span>
		<K3InputNumber class="p-inputtext-sm"
					   :format="false"
					   :disabled="readonly"
					   v-model="cidr"
					   :min="0"
					   :max="32"
					   @input="changed"
					   @blur="changed" />
	</div>
</template>
<script setup lang="ts">
import { defineProps, defineEmits, PropType } from '@vue/runtime-core';
import type { RowType } from '../../types/Types';

const IPV4_CIDR = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\/([0-9]|1[0-9]|2[0-9]|3[0-2])$/;

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

const ipv4 = ref([192, 168, 100, 128])
const cidr = ref(23)

const changed = () => {
	const changedVal = `${ipv4.value.join('.')}/${cidr.value}`
	if (IPV4_CIDR.test(changedVal)) {
		nextTick(() => {
			props.modelValue[props.config.field!] = changedVal
		})
	} else {
		// TODO: Message
		alert('ERROR!!')
	}
}

onMounted(() => {
	const val = props.modelValue[props.config.field!] as string
	if (val && IPV4_CIDR.test(val)) {
		const [IP, CIDR] = val.split('/')
		ipv4.value = IP.split('.').map(i => parseInt(i))
		cidr.value = parseInt(CIDR)
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
