<template>
  <div class="layout-sidebar flex flex-column">
    <div class="logo-container flex flex-row align-items-center justify-content-center">
      <button class="flex flex-column toggle-button align-items-center mr-5" @click="$emit('toggleMenu')">
        <i class="fas fa-bars"></i>
      </button>
      <div class="flex flex-column logo"><Logo /></div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 여기서는 해당 화면 생성 이전에 처리할 설정을 구성합니다.
 * this 등의 사용이 불가능합니다.
 */
// imports
//import Menus from "./menus";
import Menus from "./panel-menu.vue";
import Logo from "./logo.vue";
//
// Properties
// Props
// Emits
const emits = defineEmits(["menuitem-click", "toggleMenu"]);
// Compputed
// Watcher
// Methods
const onMenuItemClick = (event) => {
  emits("menuitem-click", event);
};
// Events
</script>
