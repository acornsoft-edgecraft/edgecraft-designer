<template>
  <div>
    <div class="mb-3 layout-menu-buttons">
      <K3Button type="button" icon="pi pi-plus" @click="expandAll" class="mr-2" />
      <K3Button type="button" icon="pi pi-minus" @click="collapseAll" />
    </div>
    <div class="mb-3 layout-menu-items">
      <K3PanelMenu :model="items" :expanedKeys="expandedKeys" />
    </div>
  </div>
</template>

<script setup>
/**
 * 여기서는 해당 화면 생성 이전에 처리할 설정을 구성합니다.
 * this 등의 사용이 불가능합니다.
 */
// Props
const props = defineProps({
  items: Array,
  root: {
    type: Boolean,
    default: false,
  },
});
// Emits
// const emits = defineEmits(['eventname']),
// Properties
const expandedKeys = ref({});
// Compputed
//const menus = computed(() => StateHelper.user.get().value.menus);
// Watcher
// Methods
const expandAll = () => {
  for (let node of nodes.value) {
    expandNode(node);
  }

  expandedKeys.value = { ...expandedKeys.value };
};
const collapseAll = () => {
  expandedKeys.value = {};
};
const expandNode = (node) => {
  if (node.children && node.children.length) {
    expandedKeys.value[node.key] = true;

    for (let child of node.children) {
      expandNode(child);
    }
  }
};
const getHeaderLinkClass = (item, routerProps) => {
  return [
    "p-panelmenu-header-link",
    {
      "router-link-active": routerProps && routerProps.isActive,
      "router-link-active-exact": this.exact && routerProps && routerProps.isExactActive,
    },
  ];
};
// Events
</script>

<script>
/**
 * 여기서는 해당 화면 생성 이후에 처리할 설정을 구성한다.
 * this 등의 사용이 가능합니다.
 */
import { defineComponent } from "vue";

export default defineComponent({
  // Options
  name: "panelmenu",
  components: {},
  // Props
  props: {},
  // Data
  data() {
    return {};
  },
  // Computed
  computed: {},
  // Watcher
  // Methods
  methods: {},
  // Events
  created() {},
  mounted() {},
});
</script>
<style scoped lang="scss"></style>
