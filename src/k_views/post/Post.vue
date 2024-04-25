<script setup>
import PostModal from '@/k_views/post/PostModal.vue';
import avatar1 from '@images/avatars/avatar-1.png';
import { useRouter } from 'vue-router';
import { VCardText, VCol, VDivider, VIcon } from 'vuetify/lib/components/index.mjs';

const serverAddress = inject('serverAddress')
const postAddress = inject('postAddress')
const userAddress = inject('userAddress')
const auth = inject('auth')
const profileAddress = inject('userProfileAddress')
const defaultProfileAddress = inject('defaultProfileAddress')



async function getUserId() {
  const response = await fetch(`http://${userAddress}/api/getuserid`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth}`,
    },
    credentials: 'include',
  })

  if (!response.ok) {
    alert('인증에 실패하였습니다.')
  } else {
    return response.json()
  }
}

// 날짜
const formatDate = function (value) {
  const date = new Date(value)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const min = date.getMinutes()
  const sec = date.getSeconds()

  return `${year}-${month}-${day} ${hour}:${min}:${sec}`
}

const like = ref([])
const star = ref([])
const isDetails = ref(false)
const isReplyDetails = ref(false)
const ispostoption = ref(false)

// 댓글 모달
let orizIndex = 0
const isReplyModal = ref(false)
const elementRef = ref(null)

function openReplyModal() {
  if (elementRef.value) {
    orizIndex = window.getComputedStyle(elementRef.value).zIndex // 현재 z-index 값 저장
    elementRef.value.style.zIndex = 1000 // 모달이 열릴 때의 z-index 설정
  }
  isReplyModal.value = true
}
function closepostmodal() {
  if (elementRef.value && orizIndex !== null) {
    elementRef.value.style.zIndex = orizIndex // 이전 z-index 값으로 복원
    orizIndex = null
  }
  isReplyModal.value = false
}

const detailContent = ref('펼치기')
function toggleDetail() {
  isDetails.value = !isDetails.value
  if (isDetails.value == true) {
    detailContent.value = '접기'
  } else {
    detailContent.value = '펼치기'
  }
}

const props = defineProps({
  post: Object,
  index: Object,
})

async function checkLike() {
  const userId = await getUserId()
  const response = await fetch(`http://${postAddress}/api/postlike/check/${props.post.postId}/${userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth}`,
    },
    credentials: 'include',
  })

  if (!response.ok) {
    console.error()
  } else {
    getLikes()
  }
}

async function checkStar() {
  const userId = await getUserId()
  const response = await fetch(`http://${postAddress}/api/poststar/check/${props.post.postId}/${userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth}`,
    },
    credentials: 'include',
  })

  if (!response.ok) {
    console.error()
  } else {
    getStars()
  }
}

async function getLikes() {
  const likePostId = props.post.postId
  const response = await fetch(`http://${postAddress}/api/postlike/read/${likePostId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth}`,
    },
    credentials: 'include',
  })
  if (!response.ok) {
    console.error()
  }
  const responseData = await response.json()
  //console.log('Likes for post', props.post[idx].postId, ':', responseData)
  like.value = responseData
}

async function getStars() {
  const starPostId = props.post.postId
  const response = await fetch(`http://${postAddress}/api/poststar/read/${starPostId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth}`,
    },
    credentials: 'include',
  })

  if (!response.ok) {
    console.error()
  }
  const responseData = await response.json()
  //console.log('Stars for post', props.post[idx].postId, ':', responseData)
  star.value = responseData
}

async function delPost(postId) {
  const userId = await getUserId()
  if (confirm('삭제하시겠습니까?')) {
    const response = await fetch(`http://${postAddress}/api/post/delete/${postId}/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth}`,
      },
      credentials: 'include',
    })
    if (!response.ok) {
      console.error()
      alert('삭제할 수 없습니다.')
    } else {
      alert('삭제되었습니다.')
      window.location.reload()
    }
  }
}

const tags = ref([])
async function getTags() {
  const tagPostId = props.post.postId
  const response = await fetch(`http://${postAddress}/api/tagpost/read/${tagPostId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${auth}`,
    },
    credentials: 'include',
  })

  if (!response.ok) {
    console.error()
  }
  const responseData = await response.text()
  tags.value = responseData
}

const router = useRouter()

function gotoupdatepost(postId) {
  router.push({ path: `/updatepost/${postId}` })
}

async function getUserInfo() {
  const response = await fetch(`http://${userAddress}/api/whoAreYou/${props.post.userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth}`,
    },
    credentials: 'include',
  })

  if (!response.ok) {
    alert('인증에 실패하였습니다.')
  }
  const responseData = await response.json()
  //console.log('Stars for post', props.post[idx].postId, ':', responseData)
  user.value = responseData
}

const user = ref([])
getLikes()
getStars()
getTags()
getUserInfo()
</script>
<template>
  <div>    
    <div
      ref="elementRef"
      :style="{ 'z-index': isReplyModal ? 1000 : 'auto' }"
    >
      <!-- -->
      <VCard
        style="margin-bottom: 10px"
        class="position-relative"
      >
        <VCardText>
          <VCol class="mb-2">
            <VCol class="post-details">
              <div class="post-header">
                <VCol class="post-header">
                  <div style="font-weight: 500; font-size: small; display: flex; align-items: center">
                    <span style="margin-right: 10px">

                      <img class="propile-img" :src="user.profile ? profileAddress + user.profile : avatar1">

                      <!-- <img v-if="profileAddress.split('/').length < 5"
                        class="propile-img"
                        :src="profileAddress" onerror="this.onerror=defaultProfileAddress; this.src=defaultProfileAddress"
                      />
                      
                      <img v-else
                        class="propile-img"
                        :src="defaultProfileAddress" onerror="this.onerror=defaultProfileAddress; this.src=defaultProfileAddress"
                      /> -->
                    </span>
                    <span style="margin-right: 5px"> {{ user.username }} </span>
                    <span> • </span>
                    <span style="margin-left: 5px">
                      {{ formatDate(post.postCreateDt) }}
                    </span>
                    <VIconBtn style="margin-left: auto">
                      <VIcon
                        ref="postoptionactivator"
                        icon="ri-more-line"
                        style="cursor: pointer"
                      />
                      <VMenu
                        v-model="ispostoption"
                        :activator="$refs.postoptionactivator"
                        location="bottom end"
                        width="auto"
                        offset="5px"
                      >
                        <VList>
                          <VListItem link>
                            <VListItemTitle
                              @click="gotoupdatepost(post.postId)"
                              style="font-size: small"
                            >
                              수정
                            </VListItemTitle>
                          </VListItem>
                          <VListItem link>
                            <VListItemTitle
                              @click="delPost(post.postId)"
                              style="font-size: small"
                            >
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
                <VCardTitle style="font-weight: 700">{{ post.postTitle }}</VCardTitle>
              </div>

              <VDivider />

              <VCol
                class="post-content, mt-2"
                style="margin-left: 5px"
              >
                <div v-if="!isDetails">
                  <div>
                    <span
                      class="mb-1"
                      v-html="
                        post.postContent?.length > 100 ? post.postContent.slice(0, 100) + ' ...' : post.postContent
                      "
                    >
                    </span>
                    <VIconBtn
                      v-if="post.postContent?.length > 100"
                      class="detailContent ml-2"
                      @click="toggleDetail"
                    >
                      {{ detailContent }}
                    </VIconBtn>
                  </div>

                  <div class="mt-4">
                    <span style="color: #8c57ff"> #{{ tags }} </span>
                  </div>
                </div>

                <div v-if="isDetails">
                  <div>
                    <span
                      class="mb-1"
                      v-html="post.postContent"
                    >
                    </span>
                    <VIconBtn
                      class="detailContent ml-2"
                      @click="toggleDetail"
                    >
                      <!--v-if="post.postContent.length > 100"-->
                      {{ detailContent }}
                    </VIconBtn>
                  </div>

                  <div class="mt-4">
                    <span style="color: #8c57ff"> #{{ tags }} </span>
                  </div>
                </div>
              </VCol>

              <VCol style="margin-left: 6px; display: flex">
                <IConBtn
                  @click="checkLike"
                  style="cursor: pointer"
                >
                  <font-awesome-icon :icon="['far', 'thumbs-up']" />
                </IConBtn>
                <span
                  class="post-interactions-item"
                  style="margin-left: 10px; margin-right: 10px"
                  >{{ like }}</span
                >

                <IConBtn
                  @click="checkStar"
                  style="cursor: pointer"
                >
                  <font-awesome-icon :icon="['far', 'star']" />
                </IConBtn>
                <span
                  class="post-interactions-item"
                  style="margin-left: 10px; margin-right: 10px"
                  >{{ star }}</span
                >

                <span style="margin-left: auto">
                  <VIconBtn
                    style="color: #8c57ff; cursor: pointer"
                    @click="openReplyModal"
                  >
                    댓글
                  </VIconBtn>
                </span>
              </VCol>

              <!-- <VCardActions>
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
            </VExpandTransition> -->
            </VCol>
          </VCol>
        </VCardText>
      </VCard>
    </div>

    <div
      class="modal-wrap"
      v-if="isReplyModal"
      :style="{ marginBottom: '20px', zIndex: isReplyModal ? '1000' : '1' }"
      @click="closepostmodal"
    >
      <div
        class="modal-container"
        @click.stop=""
      >
        <div
          class="modal-body"
          v-if="props.post"
        >
          <PostModal :post="props.post" />
        </div>
      </div>
    </div>
  </div>
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

/* dimmed */
.modal-wrap {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.2);
  z-index: 100;
}
/* modal or popup */
.modal-container {
  position: relative;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  //    width: 550px;
  //    width: 1000%;
  // background: #fff;
  border-radius: 10px;
  padding: 20px;
  box-sizing: border-box;
}
.modal-body {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  max-height: calc(100vh - 200px);
  overflow-y: auto;
  width: 150%;
}
// html {
//   -ms-overflow-style: none; /* IE and Edge */
//   scrollbar-width: none; /* Firefox */
// }
// html::-webkit-scrollbar {
//   display: none; /* Chrome, Safari, Opera*/
// }
</style>
