<template>
  <div :class="containerClass" @click="onWrapperClick" @toggle-menu="onToggleMenu">
    <Sidebar @click="onSidebarClick" @menuitem-click="onMenuItemClick" />
    <div class="main-wrapper flex flex-column flex-1">
      <Header />
      <div class="layout-main">
        <slot />
      </div>
      <Footer />
      <Config :layoutMode="layoutMode" @layout-change="onLayoutChange" />
      <transition name="layout-mask">
        <div v-if="mobileMenuActive" class="layout-mask p-component-overlay"></div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 여기서는 해당 화면 생성 이전에 처리할 설정을 구성합니다.
 * this 등의 사용이 불가능합니다.
 */
// imports
import Footer from "./components/footer.vue";
import Header from "./components/header.vue";
import Sidebar from "./components/sidebar.vue";
import Config from "./components/config.vue";
// Page meta
definePageMeta({ name: "new" });
// Props
// const props = defineProps({}),
// Emits
// const emits = defineEmits(['eventname']),
// Properties
let layoutMode = "static";
let staticMenuInactive = false;
let overlayMenuActive = false;
let mobileMenuActive = false;
let menuClick = false;
// Compputed
const containerClass = computed(() => [
  "layout-wrapper",
  "flex",
  "flex-row",
  {
    "layout-overlay": layoutMode === "overlay",
    "layout-static": layoutMode === "static",
    "layout-static-sidebar-inactive": staticMenuInactive && layoutMode === "static",
    "layout-overlay-sidebar-active": overlayMenuActive && layoutMode === "overlay",
    "layout-mobile-sidebar-active": mobileMenuActive,
    // "p-input-filled": $primevue.config.inputStyle === "filled",
    // "p-ripple-disabled": $primevue.config.ripple === false,
    // "layout-theme-light": $appState.theme.startsWith("saga"),
  },
]);
// Watcher
// Methods
const onToggleMenu = () => {
  menuClick = true;
};
const onWrapperClick = () => {
  if (!menuClick) {
    overlayMenuActive = false;
    mobileMenuActive = false;
  }
  menuClick = false;
};
const onLayoutChange = (mode) => {
  layoutMode = mode;
};
const onSidebarClick = () => {
  menuClick = true;
};
const onMenuItemClick = (event) => {
  if (event.item && !event.item.items) {
    overlayMenuActive = false;
    mobileMenuActive = false;
  }
};
// Events
// Logics (like api call, etc)
</script>

<style scoped lang="scss"></style>
