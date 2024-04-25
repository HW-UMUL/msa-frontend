<script setup>
import avatar1 from '@images/avatars/avatar-1.png'
import { useRoute } from 'vue-router';
import AdminUserInfo from './AdminUserInfo.vue';
import AdminUserPost from './AdminUserPost.vue';
import AdminUserWIki from './AdminUserWiki.vue';

const props = defineProps({
    user: Object
})

const profileAddress = inject('userProfileAddress')
const userProfileAddress = inject('userProfileAddress')
const userAddress = inject('userAddress')
const auth = inject('auth')

const userInfo = ref([])
async function getUserInfo(){
  const response = await fetch(
    `http://${userAddress}/api/whoAreYou/${props.user.id}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth}`,
      },
      credentials: 'include'
    }
  )

  if(!response.ok){
    alert("인증에 실패하였습니다.")
  } else{
    userInfo.value = await response.json();
  }

}
getUserInfo()

const accountData = {
  avatarImg: avatar1
}

const accountDataLocal = ref(structuredClone(accountData))

// tab
const route = useRoute()
const activeTab = ref(route.params)

// tabs
const tabs = [
  'User', 'Post', 'Wiki'
]
</script>

<template>
  <VRow>
    <VCol>
      <VCard title="Account Details">
        <VCardText class="d-flex">
          <VAvatar
            rounded="lg"
            size="150"
            class="me-6"
            :image="userInfo.profile ? profileAddress + userInfo.profile : avatar1"
          />
          <div>
            <div class="account-info">
              <span>{{ userInfo.username }}</span>
            </div>
            <div class="account-info">
              <span>{{ userInfo.email }}</span>
            </div>
          </div>
        </VCardText>

        <VDivider />

        <div>
          <VTabs
            v-model="activeTab"
            show-arrows
          >
            <VTab
              v-for="(item, index) in tabs"
              :key="index"
              :value="item"
            >
              <VIcon
                size="20"
                start
              />
              {{ item }}
            </VTab>
          </VTabs>

          <VWindow
            v-model="activeTab"
            class="mt-5 disable-tab-transition"
            :touch="false"
          >
            <VWindowItem value="User">
              <AdminUserInfo :user="props.user" />
            </VWindowItem>

            <VWindowItem value="Post">
              <AdminUserPost :user="props.user" />
            </VWindowItem>

            <VWindowItem value="Wiki">
              <AdminUserWIki :user="props.user" />
            </VWindowItem>
          </VWindow>
        </div>

      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
.account-info {
  margin: 15px;
  font-weight: 500;
  // color: #000;
}
</style>
