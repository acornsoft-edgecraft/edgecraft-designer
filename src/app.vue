<template>
  <div class="app-container">
    <K3Toast position="top-right"
             group="tr" />
    <K3Toast position="top-left"
             group="tl" />
    <K3Toast position="bottom-left"
             group="bl" />
    <K3Toast position="bottom-right"
             group="br" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <K3ScrollTop :threshold="100" />
  </div>
</template>

<script setup lang="ts">
/**
 * 초기화
 */
useAppHelper().initialize()
</script>
