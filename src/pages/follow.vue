<script setup>
import GetEmail from '@/components/GetEmail.vue';
import avatar1 from '@images/avatars/avatar-1.png';
import { useRouter } from "vue-router";

const serverAddress = inject('serverAddress')
const profileAddress = inject('profileAddress')
const followAddress = inject('followAddress')
const userAddress = inject('userAddress')


const auth = inject('auth')
const router = useRouter()

async function getUserId() {
  const response = await fetch(
    `http://${userAddress}/api/getuserid`,
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
    return response.json();
  }
}



async function getUserInfo(userId){
  const response = await fetch(
    `http://${userAddress}/api/whoAreYou/${userId}`,
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
    return await response.json()
  }

}

const emailKeyword = ref('')
const emails = ref([])


async function getUserIdByEmail(email){
  const formData = {
    email : email
  }
  const response = await fetch(
    `http://${userAddress}/api/whoAreYou/email`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth}`, 
      },
      credentials: 'include',
      body: JSON.stringify(formData)
    }
  )

  if(!response.ok){
    alert("인증에 실패하였습니다.")
  } else{
    return response.json()
  }

}

async function searchEmail(){
  const userId = await getUserId()
  const response = await fetch(
      `http://${userAddress}/api/search/email/${emailKeyword.value}`,
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
    emails.value = await response.json()
  }
}

async function checkFollow(followId){
  const userId = await getUserId()
  const response = await fetch(
      `http://${followAddress}/api/follow/check/${followId}/${userId}`,
      {
        method: 'POST',
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
    getFollowers()
    getFollowees()
  }
}

async function checkFollowByEmail(email){
  const userId = await getUserId()
  const follow = await getUserIdByEmail(email)

  const response = await fetch(
      `http://${followAddress}/api/follow/check/${follow.userId}/${userId}`,
      {
        method: 'POST',
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
    getFollowers()
    getFollowees()
  }
}

const followers = ref([])
const followees = ref([])


async function getFollowers(){
  const userId = await getUserId()
  const response = await fetch(
      `http://${followAddress}/api/follow/read/follower/${userId}`,
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
    followers.value = await response.json()
    settingFollowerEmails(followers)
  }
}

async function getFollowees(){
  const userId = await getUserId()
  const response = await fetch(
      `http://${followAddress}/api/follow/read/followee/${userId}`,
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
    followees.value = await response.json()
    settingFolloweeEmails(followees)
  }
}

const switchContent = ref(true)

function isFollowed(email){
 
  if(followerEmails.value.includes(email)){
    return 'unFollow'
  }
  else{
    return 'Follow'
  }
}

function isFollowedById(id){

 if(followerIds.value.includes(id)){
   return 'unFollow'
 }
 else{

   return 'Follow'
 }
}


getFollowees()
getFollowers()

//////////// 이메일 계산하기
function settingFollowerEmails(followers){
  followerEmails.value = []
  followerIds.value = []
  followers.value.forEach(async function(item){
    const user = await getUserInfo(item.followerId);
    followerEmails.value.push(user.email)
    followerIds.value.push(item.followerId)
  })
}
function settingFolloweeEmails(followees){
  followeeEmails.value = []
  followees.value.forEach(async function(item){
    const user = await getUserInfo(item.followeeId);
    followeeIds.value.push(user.userId)
  })  
}

const followerEmails = ref([])
const followeeEmails = ref([])
const followerIds = ref([])
const followeeIds = ref([])

////////////////////////////////////////////////////

//////////// 다른 사람 페이지 

function moveToOther(userId){
  router.push({ path: `/user/${userId}` })
}


////////////////////////////////////////////////////

</script>

<template>
  <VRow>
    <VCol
      cols="12"
      md="8"
      class="mb-4"
    >
    <VRow style="height: 30px; margin-bottom: 20px;">
      <div class="selectFollowerFollowee" @click="switchContent=true">FOLLOWER</div>
      <div class="bar"></div>
      <div class="selectFollowerFollowee" @click="switchContent=false">FOLLOWEE</div>
    </VRow>

    <VCard class="position-relative">
        <div v-if="switchContent" v-for="(item, index) in followers" :key="index">          
          <div class="d-flex">
            <div  @click="moveToOther(item.followerId)">
              <img class="follow-propile-img" :src="avatar1">
              <!-- <img v-if="!item.follower.profile" class="follow-propile-img" :src="avatar1">
              <img v-else class="follow-propile-img" :src="profileAddress + item.follower.profile.storeFileName"> -->
            </div>
            
            <div class="pa-2" style="margin-top:18px; vertical-align: center;"><GetEmail :userId='item.followerId'/></div>
            <VBtn class="ml-auto" style="margin-top: 18px; margin-right: 10px;"
            @click="checkFollow(item.followerId)">
              UnFollow
            </VBtn>
          </div>
          <VDivider />
        </div>
        <div v-if="!switchContent" v-for="(item, index) in followees" :key="index">          
          <div class="d-flex">
            <div  @click="moveToOther(item.followeeId)">
              <img class="follow-propile-img" :src="avatar1">

              <!-- <img v-if="!item.followee.profile" class="follow-propile-img" :src="avatar1">
              <img v-else class="follow-propile-img" :src="profileAddress + item.followee.profile.storeFileName"> -->
            </div>
            <div class="pa-2" style="margin-top:18px; vertical-align: center;"><GetEmail :userId='item.followeeId'/></div>
            <VBtn class="ml-auto" style="margin-top: 18px; margin-right: 10px;"
            @click="checkFollow(item.followeeId)">
              {{ isFollowedById(item.followeeId) }}
            </VBtn>
          </div>
          <VDivider />
        </div>
    </VCard>

 
    </VCol>  
    <VCol
      cols="12"
      md="4"
    >
      <!-- 검색 -->
      <VCard title="Search" class="position-relative">
        <VCardText>
                  <VTextField
                  v-model="emailKeyword"
                  placeholder="email"
                  label="email"
                  >
                    <IconBtn style="position:absolute; right:0;"
                    @click="searchEmail"
                    >
                      <VIcon icon="ri-search-line"/>
                    </IconBtn>
                </VTextField>
          <VDivider />

        </VCardText>
        <div v-for="(item, index) in emails" :key="index">          
          <div class="d-flex">
            <div  @click="moveToOtherByEmail(item)">
              <img class="follow-propile-img" :src="avatar1">

              <!-- <img v-if="!item.followee.profile" class="follow-propile-img" :src="avatar1">
              <img v-else class="follow-propile-img" :src="profileAddress + item.followee.profile.storeFileName"> -->
            </div>
            <div class="pa-2" style="margin-top:18px; vertical-align: center;">{{ item }}</div>
            <VBtn class="ml-auto" style="margin-top: 18px; margin-right: 10px;"
            @click="checkFollowByEmail(item)">
              {{ isFollowed(item) }}
            </VBtn>
          </div>
          <VDivider />
        </div>
      </VCard>
    </VCol>  

  </VRow>
</template>
<style lang="scss">
.selectFollowerFollowee{
  align-items: center;
  width: 49%;
  display: flex;
  justify-content: center;
  font-size: 20px; 
}

.bar {
    width: 1px; /* 바의 너비 */
    background-color: gray; /* 바의 배경색 */
}

.follow-propile-img {
  margin-top: 10px;
  margin-left: 10px;
   width: 50px;
   height: 50px;
  border-radius: 50%;
  object-fit: cover;
}
</style>
