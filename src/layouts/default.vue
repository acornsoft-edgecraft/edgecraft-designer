<template>
  <div class="layout-container flex flex-column">
    <HeaderBar />
    <div class="layout-main flex flex-row flex-1">
      <K3SidebarMenu v-model:collapsed="collapsed"
                     :menu="menus"
                     :show-one-child="true"
                     @update:collapsed="onToggleCollapsed"
                     @item-click="onItemClicked" />
      <div class="layout-main">
        <slot />
      </div>
    </div>
    <FooterBar />
  </div>
</template>

<script setup lang="ts">
import FooterBar from "./components/footerbar.vue";
import HeaderBar from "./components/headerbar.vue";

const collapsed = false

const separator = {
  template: '<hr style="border: 0.175rem inset rgba(255, 255, 255, 0.7); margin: 10px 20px 10px 20px;">'
}

const menus = computed(() => useAppHelper().State.user.get().value.menus.map(m => {
  if (m.separator) {
    delete m.separator
    m.component = markRaw(separator)
  }

  return m
}))

const onToggleCollapsed = (collapsed) => {
  // TODO: Sidebar Menu Collapsed 상태에 따른 처리 (필요한 경우)
}

const onItemClicked = (event, item) => {
  // TODO: Menu Item 클릭에 따른 처리 (필요한 경우)
}

// Events
// Logics (like api call, etc)
</script>

<style scoped lang="scss">
</style>
