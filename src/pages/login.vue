<script setup>
import logo from '@images/logo.svg?raw'
import authV1MaskDark from '@images/pages/auth-v1-mask-dark.png'
import authV1MaskLight from '@images/pages/auth-v1-mask-light.png'
import authV1Tree2 from '@images/pages/auth-v1-tree-2.png'
import authV1Tree from '@images/pages/auth-v1-tree.png'
import { useRouter } from "vue-router"
import { useTheme } from 'vuetify'
//import VueCookies from 'vue-cookies'


const userAddress = inject('userAddress')
const router = useRouter()

const form = ref({
  usernmae: '',
  password: '',
  remember: false,
})

const vuetifyTheme = useTheme()

const authThemeMask = computed(() => {
  return vuetifyTheme.global.name.value === 'light' ? authV1MaskLight : authV1MaskDark
})

const isPasswordVisible = ref(false)

async function login() {

  const formData = {
    username: form.value.username,
    password: form.value.password
  }
   
  const response = await fetch(
      `http://${userAddress}/api/auth`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
//        credentials: 'include'
      }
  )

  if(!response.ok) {
    alert("실패!")
  } else{


    console.log(await response.headers.get('Authorization'))
    const jwtToken = await response.headers.get('Authorization').substr(7)
    sessionStorage.setItem("myname", formData.username);
    $cookies.set("jwtToken", jwtToken)
    router.push({ path: '/' }); 
  }
}


</script>

<template>
  <!-- eslint-disable vue/no-v-html -->

  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <VCard
      class="auth-card pa-4 pt-7"
      max-width="448"
    >
      <VCardItem class="justify-center">
        <template #prepend>
          <div class="d-flex">
            <div v-html="logo" />
          </div>
        </template>

<!--
        <VCardTitle class="font-weight-semibold text-2xl text-uppercase">
          Materio
        </VCardTitle>
-->
        <VCardTitle class="my-logo-font">
          우 물
        </VCardTitle>
      </VCardItem>

      <VCardText class="pt-2">
        <h5 class="text-h5 font-weight-semibold mb-1 text-center">
          우리들의 물음표 우물 👋🏻
        </h5>
      </VCardText>

      <VCardText>
        <VForm @submit.prevent="() => {}">
          <VRow>
            <!-- email -->
            <VCol cols="12">
              <VTextField
                v-model="form.username"
                label="ID"
                type="text"
              />
            </VCol>

            <!-- password -->
            <VCol cols="12">
              <VTextField
                v-model="form.password"
                label="Password"
                placeholder="············"
                :type="isPasswordVisible ? 'text' : 'password'"
                :append-inner-icon="isPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
                @click:append-inner="isPasswordVisible = !isPasswordVisible"
              />

              <!-- remember me checkbox -->
              <div class="d-flex align-center justify-space-between flex-wrap mt-1 mb-4">
                <!-- <VCheckbox
                  v-model="form.remember"
                  label="Remember me"
                />

                <a
                  class="ms-2 mb-1"
                  href="javascript:void(0)"
                >
                  Forgot Password?
                </a> -->
              </div>

              <!-- login button -->
              <VBtn 
                @click="login()"
              >
              <!--
              <VBtn 
                block
                type="submit"
                to="/"
              >
              -->
                Login
              </VBtn>
            </VCol>

            <!-- create account -->
            <VCol
              cols="12"
              class="text-center text-base"
            >
              <!-- <span>New on our platform?</span> -->
              <RouterLink
                class="text-primary ms-2"
                to="/register"
              >
                Create an account
              </RouterLink>
            </VCol>

            <!-- <VCol
              cols="12"
              class="d-flex align-center"
            >
              <VDivider />
              <span class="mx-4">or</span>
              <VDivider />
            </VCol> -->

            <!-- auth providers -->
            <!-- <VCol
              cols="12"
              class="text-center"
            >
              <AuthProvider />
            </VCol> -->
          </VRow>
        </VForm>
      </VCardText>
    </VCard>

    <VImg
      class="auth-footer-start-tree d-none d-md-block"
      :src="authV1Tree"
      :width="250"
    />

    <VImg
      :src="authV1Tree2"
      class="auth-footer-end-tree d-none d-md-block"
      :width="350"
    />

    <!-- bg img -->
    <VImg
      class="auth-footer-mask d-none d-md-block"
      :src="authThemeMask"
    />
  </div>
</template>

<style lang="scss">
@use "@core/scss/pages/page-auth.scss";

.my-logo-font{
  font-family: 'Sunflower', sans-serif;
  font-weight: 500;
  line-height: 4rem;
  font-size: 30px;
}
</style>
