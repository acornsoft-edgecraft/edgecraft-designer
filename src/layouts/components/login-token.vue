<template>
  <K3Panel class="login-panel" header="Sign in">
    <p>Enter your static token</p>
    <div class="input-container">
      <K3InputText v-focus ref="inputToken" v-model="form.token" v-on:keyup.enter="doLogin" type="password" aria-describedby="token-help" :class="{ 'p-invalid': isInvalid }" />
      <small v-if="message !== ''" id="token-help">{{ message }}</small>
    </div>
    <div class="button-container align-items-right justify-content-right">
      <K3Button type="button" label="Sign in" :loading="loading" @click="doLogin" />
    </div>
  </K3Panel>
</template>

<script setup lang="ts">
/**
 * 여기서는 해당 화면 생성 이전에 처리할 설정을 구성합니다.
 * this 등의 사용이 불가능합니다.
 */
// Imports
import { IAuthType } from "~/models/common/auth";
import { MessageTypes } from "~/models/enums";
// Page meta
definePageMeta({});

// Props
const auth = StateHelper.auth.get();
// const props = defineProps({}),
// Emits
// const emits = defineEmits(['eventname']),
// Properties
const inputToken = ref(null);
const loading = ref(false);
const form = ref({
  username: "",
  password: "",
  token: "",
});
const message = ref("");
// Compputed
const isInvalid = computed(() => message.value !== "");
// Watcher
// Methods
const doLogin = async () => {
  loading.value = true;

  await APIHelper.post("api/auth", "login", form.value).then((res) => {
    if (res.isError) {
      message.value = res.message;
      UIHelper.setFocus(inputToken);
      loading.value = false;
    } else {
      auth.value.isAuthenticated = true;
      StateHelper.auth.set(auth.value);
      UIHelper.showToastMessage(MessageTypes.INFO, "로그인", "로그인되었습니다.");
      RouterHelper.moveTo("/");
    }
  });
};
// Events
const onMounted = () => {};
// Logics
</script>

<style scoped lang="scss">
.login-panel {
  :deep(.p-panel-header) {
    border: none;
    background-color: var(--green-600);
    color: White;
  }

  //   ::v-deep .p-panel-content {
  //     //border: 1px solid lightgray;
  //   }
  .input-container {
    display: block;

    .p-inputtext {
      display: block;
      margin-bottom: 0.5rem;
      width: 500px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .button-container {
    display: block;
    margin-top: 1em;
    text-align: right;
  }
}
</style>
