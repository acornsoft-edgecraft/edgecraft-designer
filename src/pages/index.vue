<template>
  <div class="page-container">
    <suspense timeout="0">
      <template #default>
        <div class="page-wrapper">
          <section class="page-header">
            <K3PageTitle />
          </section>
          <section class="page-content">
            <!-- Content here -->
          </section>
        </div>
      </template>
      <template #fallback>
        <div class="flex justify-content-center">
          <K3ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" />
        </div>
      </template>
    </suspense>
  </div>
</template>

<script setup lang="ts">
/**
 * 여기서는 해당 화면 생성 이전에 처리할 설정을 구성합니다.
 * this 등의 사용이 불가능합니다.
 */
// imports
// Page meta
definePageMeta({ layout: "default", title: "Cluster Designer", public: false });
// Props
// const props = defineProps({}),
// Emits
// const emits = defineEmits(['eventname']),
// Properties
// Compputed
// Watcher
// Methods
// Events
// Logics (like api call, etc)
</script>

<style scoped lang="scss"></style>
