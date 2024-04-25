<script setup>
import avatar1 from '@images/avatars/avatar-1.png';

const userProfileAddress = inject('userProfileAddress')
const userAddress = inject('userAddress')

const auth = inject('auth')

// 토큰 브라우저에서 받아오기
let authToken = 'Bearer '

authToken = authToken + auth
const router = useRouter()

const info = ref({
  username: '',
  email: '',
  storeFileName: ''
})



async function getInfo(){

  const response = await fetch(
    `http://${userAddress}/api/getinfo`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth}`,          
      },
      credentials: 'include'
    }  
  )

  if(!response.ok) {
    alert("실패!")
  } else{
    const res = await response.json()
    info.value.username = res[0]
    info.value.email = res[1]
    info.value.storeFileName = res[2]
  }
}

getInfo()

//
function gotoUserPro(postId) {
  router.push({ path: `/updatepost/${postId}`})
}
//

</script>

<template>
  <VBadge
    dot
    location="bottom right"
    offset-x="3"
    offset-y="3"
    color="success"
    bordered
  >
    <VAvatar
      class="cursor-pointer"
      color="primary"
      variant="tonal"
    >
      <VImg v-if="!info.storeFileName" :src="avatar1"/>
      <VImg v-if="info.storeFileName" :src="userProfileAddress + info.storeFileName"/>
      <!-- SECTION Menu -->
      <VMenu
        activator="parent"
        width="230"
        location="bottom end"
        offset="14px"
      >
        <VList>
          <!-- 👉 User Avatar & Name -->
          <VListItem>
            <template #prepend>
              <VListItemAction start>
                <VBadge
                  dot
                  location="bottom right"
                  offset-x="3"
                  offset-y="3"
                  color="success"
                  bordered
                >
                  <VAvatar
                    color="primary"
                    variant="tonal"
                  >
                    <VImg v-if="!info.storeFileName" :src="avatar1"/>
                    <VImg v-if="info.storeFileName" :src="userProfileAddress + info.storeFileName"/>
                  </VAvatar>
                </VBadge>
              </VListItemAction>
            </template>

            <VListItemTitle class="font-weight-semibold">
              {{ info.username }}
            </VListItemTitle>
            <VListItemSubtitle>{{ info.email }}</VListItemSubtitle>
          </VListItem>
          <VDivider class="my-2" />

          <!-- Account Settiong -->
          <VListItem to="/mypage">
            <template #prepend>
              <VIcon
                class="me-2"
                icon="ri-user-line"
                size="22"
              />
            </template>

            <VListItemTitle>Account Setting</VListItemTitle>
          </VListItem>

          <!-- My Post -->
          <VListItem to="/myposts">
            <template #prepend>
              <VIcon
                class="me-2"
                icon="ri-question-answer-line"
                size="22"
              />
            </template>

            <VListItemTitle>My Post</VListItemTitle>
          </VListItem>

          <!-- My Wiki -->
          <VListItem to="/mywikis">
            <template #prepend>
              <VIcon
                class="me-2"
                icon="ri-book-line"
                size="22"
              />
            </template>

            <VListItemTitle>My Wiki</VListItemTitle>
          </VListItem>

          <!-- 👉 Settings -->
          <!-- <VListItem link>
            <template #prepend>
              <VIcon
                class="me-2"
                icon="ri-settings-4-line"
                size="22"
              />
            </template>

            <VListItemTitle>Settings</VListItemTitle>
          </VListItem> -->

          <!-- 👉 Pricing -->
          <!-- <VListItem link>
            <template #prepend>
              <VIcon
                class="me-2"
                icon="ri-money-dollar-circle-line"
                size="22"
              />
            </template>

            <VListItemTitle>Pricing</VListItemTitle>
          </VListItem> -->

          <!-- 👉 FAQ -->
          <!-- <VListItem link>
            <template #prepend>
              <VIcon
                class="me-2"
                icon="ri-question-line"
                size="22"
              />
            </template>

            <VListItemTitle>FAQ</VListItemTitle>
          </VListItem> -->

          <!-- Divider -->
          <VDivider class="my-2" />

          <!-- 👉 Logout -->
          <VListItem to="/logout">
            <template #prepend>
              <VIcon
                class="me-2"
                icon="ri-logout-box-r-line"
                size="22"
              />
            </template>

            <VListItemTitle>Logout</VListItemTitle>
          </VListItem>
        </VList>
      </VMenu>
      <!-- !SECTION -->
    </VAvatar>
  </VBadge>
</template>
