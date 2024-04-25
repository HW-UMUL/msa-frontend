<script setup>
import { useRouter } from 'vue-router';
import { VCardText, VCol, VDivider, VIcon, VRow, VTextField } from 'vuetify/lib/components/index.mjs';
import ReplyVue from '@/k_views/reply/Reply.vue';
import avatar1 from '@images/avatars/avatar-1.png';

const serverAddress = inject('serverAddress')
const postAddress = inject('postAddress')
const userAddress = inject('userAddress')

const auth = inject('auth')

const profileAddress = inject('userProfileAddress')

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
    // alert("실패!")
    console.error()
  } else{
    const res = await response.json()
    info.value.username = res[0]
    info.value.email = res[1]
    info.value.storeFileName = res[2]
  }
}

getInfo()

const currentUserId = ref('')
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
    const data = response.json();
    currentUserId.value = await data;
    return data;
  }

}
getUserId()

// 날짜
const formatDate = function(value) {
    const date = new Date(value);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1);
    const day = date.getDate();
    const hour = date.getHours();
    const min = date.getMinutes();
    const sec = date.getSeconds();
    
    return `${year}-${month}-${day} ${hour}:${min}:${sec}`;
}

const like = ref([])
const star = ref([])
const isDetails = ref(false)
const isReplyDetails = ref(true)
const ispostoption = ref(false)

const detailContent = ref('펼치기');
function toggleDetail() {
  isDetails.value = !isDetails.value;
  if(isDetails.value == true) {
    detailContent.value = '접기'
  } else {
    detailContent.value = '펼치기'
  }
}

const props = defineProps({
    post: Object,
    // getPosts: Function
})

async function checkLike(){
  const userId = await getUserId()
  const response = await fetch(
      `http://${postAddress}/api/postlike/check/${props.post.postId}/${userId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth}`
        },
        credentials: 'include'
      }
  )

  if(!response.ok) {
    console.error()
  } else{
    getLikes()
  }
}

async function checkStar(){
  const userId = await getUserId()
  const response = await fetch(
      `http://${postAddress}/api/poststar/check/${props.post.postId}/${userId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth}`
        },
        credentials: 'include'
      }
  )

  if(!response.ok) {
    console.error()
  } else{
    getStars()
  }
}

async function getLikes(){
  const response = await fetch(
      `http://${postAddress}/api/postlike/read/${props.post.postId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth}`
        },
        credentials: 'include'
      }
  )

  if(!response.ok) {
    console.error()
  } else{
    like.value = await response.json()
  }
}

async function getStars(){

  const response = await fetch(
      `http://${postAddress}/api/poststar/read/${props.post.postId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth}`
        },
        credentials: 'include'
      }
  )

  if(!response.ok) {
    console.error()
  } else{
    star.value = await response.json()
  }
}

async function delPost(postId) {
  const userId = await getUserId()

  if(confirm("삭제하시겠습니까?")) {
    const response = await fetch(
      `http://${postAddress}/api/post/delete/${postId}/${userId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth}`,
        },
        credentials: 'include'
      }
    )
    if(!response.ok) {
      console.error()
      alert("삭제할 수 없습니다.")
    } else {
      alert("삭제되었습니다.")
      window.location.reload()
    }
  }
}

const tags = ref([])
async function gettags(){
  
  const response = await fetch(
      `http://${postAddress}/api/tagpost/read/${props.post.postId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth}`
        },
        credentials: 'include'
      }
  )

  if(!response.ok) {
    console.error()
  } else{
//    const tagsPost = await response.json()
    const tagsPost = await response.text()

    tags.value = tagsPost.split()
//    tags.value = tagsPost.map(tagsPost => tagsPost.tag.name);
  }
}


// async function getUserInfo(){
//   const response = await fetch(
//     `http://${userAddress}/api/whoAreYou/${props.post.postId}`,
//     {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${auth}`, 
//       },
//       credentials: 'include'
//     }
//   )

//   if(!response.ok){
//     alert("인증에 실패하였습니다.")
//   } else{
//     user.value = await response.json();
//   }

// }

// getUserInfo()
// const user = ref([])

const router = useRouter();

function gotoupdatepost(postId) {
  router.push({ path: `/updatepost/${postId}`})
}

getLikes()
getStars()
gettags()

async function getUserInfo(){
  const response = await fetch(
    `http://${userAddress}/api/whoAreYou/${props.post.userId}`,
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
    user.value = await response.json();
  }

}
getUserInfo()
const user = ref([])

</script>

<template>
  <VCard class="position-relative">
    <VCardText>
      <VCol class="mb-2">
        <VCol class="post-details">
          <div class="post-header">
            <VCol class="post-header" >
              <div style="font-weight: 500; font-size: small; display: flex; align-items: center;">
                <span style="margin-right: 10px">
                  <img class="propile-img" :src="user.profile ? profileAddress + user.profile : avatar1">
                </span>
                <span style="margin-right: 5px;">
                  {{ user.username }}
                </span>
                <span> • </span>
                <span style="margin-left: 5px;">
                  {{ formatDate(post.postCreateDt) }}
                </span>
                <VIconBtn style="margin-left: auto">
                  <VIcon ref="postoptionactivator" icon="ri-more-line" style="cursor: pointer;" />
                  <VMenu
                    v-model="ispostoption"
                    :activator="$refs.postoptionactivator"
                    location="bottom end"
                    width="auto"
                    offset="5px"
                    >
                    <VList>
                      <VListItem link>
                        <VListItemTitle @click="gotoupdatepost(post.postId)" style="font-size: small;">
                          수정
                        </VListItemTitle>
                      </VListItem>
                      <VListItem link>
                        <VListItemTitle @click="delPost(post.postId)" style="font-size: small;">
                          삭제
                        </VListItemTitle>
                      </VListItem>
                    </VList>
                  </VMenu>
                </VIconBtn>
              </div>
            </VCol>
          </div>

          <div class="post-title">
            <VCardTitle style="font-weight: 700;">{{ post.postTitle }}</VCardTitle>
          </div>

          <VDivider />
        
          <VCol class="post-content, mt-2" style="margin-left: 5px;">
            <div v-if="!isDetails">
              <div
                class="mb-1"
                v-html="post.postContent.length  > 100 ? post.postContent.slice(0,100) + '...' :post.postContent">
              </div>
              <VIconBtn v-if="post.postContent.length > 100"
                class="detailContent"
                @click="toggleDetail">
              {{ detailContent }}
              </VIconBtn>

              <div v-for="(tag, index) in tags" :key="index"
                class="mt-4"   
                style="color:#8C57FF"
              >
                #{{ tag }}
              </div>
            </div>

            <div v-if="isDetails">
              <div
                class="mb-1"
                v-html="post.postContent">
              </div>
              <VIconBtn v-if="post.postContent.length > 100" 
                class="detailContent"
                @click="toggleDetail">
                {{ detailContent }}
              </VIconBtn>
              <div v-for="(tag, index) in tags" :key="index"
                class="mt-4"   
                style="color:#8C57FF"
              >
                #{{ tag }}
              </div>
            </div>
          </VCol>
          
          <!-- <VDivider /> -->

          <VCol style="margin-left: 6px;">
            <IConBtn @click="checkLike" style="cursor: pointer;"> 
              <font-awesome-icon :icon="['far', 'thumbs-up']" />
            </IConBtn>
            <span class="post-interactions-item" style="margin-left: 10px; margin-right: 10px;">{{ like }}</span>
            <IConBtn @click="checkStar" style="cursor: pointer"> 
              <font-awesome-icon :icon="['far', 'star']" />
            </IConBtn>
            <span class="post-interactions-item" style="margin-left: 10px; margin-right: 10px;">{{ star }}</span>
          </VCol>

          <VCardActions>
            <VBtn @click="isReplyDetails = !isReplyDetails">
              댓글
            </VBtn>
            <VSpacer />
            <VBtn
              icon
              size="small"
              @click="isReplyDetails = !isReplyDetails"
            >
              <VIcon :icon="isReplyDetails ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'" />
            </VBtn>
          </VCardActions>
                
          <VExpandTransition>
            <div v-show="isReplyDetails">
              <VCardText>
                <ReplyVue :postob="props.post"></ReplyVue>
              </VCardText>
            </div>
          </VExpandTransition>

        </VCol>
      </VCol>
    </VCardText>
  </VCard>
</template>

<style lang="scss">
// .v-card .trophy {
//   position: absolute;
//   inline-size: 5.188rem;
//   inset-block-end: 1.25rem;
//   inset-inline-end: 1.25rem;
// }
.post-image {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    margin-bottom: 10px;
}
// .post-title {
//     font-weight: bold;
//     margin-bottom: 5px;
// }
.post-content {
    margin-bottom: 10px;
}
.post-interactions {
    display: flex;
    width: 100%;
    margin-bottom: 10px;
}
.post-interactions-item {
    color: #666;
}
.post-comments {
    color: #333;
}

.propile-img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.detailContent {
  cursor: pointer;
  font-size: 10pt;
  color: #999;
}
</style>