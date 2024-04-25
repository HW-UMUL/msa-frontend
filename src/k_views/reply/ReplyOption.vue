<script setup>
// import ReplyLike from '../like/ReplyLike.vue';
import avatar1 from '@images/avatars/avatar-1.png';

const props = defineProps({
    reply:Object,
    post:Object,
    getReply:Function,
})

const formatDate = function(value) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1);
  const day = date.getDate();
  const hour = date.getHours();
  const min = date.getMinutes();
  const sec = date.getSeconds();
  
  return `${year}-${month}-${day} ${hour}:${min}`;
}

// const serverAddress = inject('serverAddress')
const auth = inject('auth')
const postAddress = inject('postAddress')
const userAddress = inject('userAddress')
const profileAddress = inject('userProfileAddress')

const info = ref({
  username: '',
  email: '',
  password: '',
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

props.getReply(props.post.postId)

const isreplyoption=ref(false)
const isUpdateReply = ref(false)
const isReplyContent = ref(true)

function toggleReply() {
  isReplyContent.value = !isReplyContent.value
  isUpdateReply.value =! isUpdateReply.value
}

const editReply = ref({
  content: props.reply.replyContent
})

async function updateReply(replyId){
  
  const userId = await getUserId()
  const formData = {
    content: editReply.value.content
  }

  const response = await fetch(
      `http://${postAddress}/api/reply/update/${replyId}/${userId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth}`,
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      }
  )

  if(!response.ok) {
    alert("실패!")
  } else{
    isUpdateReply.value=(false)
    isReplyContent.value=(true)
    props.getReply(props.post.postId)
  }
}

async function delReply(replyId) {
  const userId = await getUserId()
  if(confirm("삭제하시겠습니까?")) {
    const response = await fetch(
      `http://${postAddress}/api/reply/delete/${replyId}/${userId}`,
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
      alert("삭제 실패")
    } else {
      alert("삭제되었습니다")
      props.getReply(props.post.postId);
    }
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
    user.value = await response.json();
  }

}

const user = ref([])
getUserInfo(props.reply.userId)


// like
const replylike = ref([])
async function getReplyLikes(){
  
  const response = await fetch(
      `http://${postAddress}/api/replylike/read/${props.reply.replyId}`,
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
    
  } else{
    replylike.value= await response.json()
  }
}

getReplyLikes()

async function checkReplyLike(){
  const userId = await getUserId()
    const response = await fetch(
        `http://${postAddress}/api/replylike/check/${props.reply.replyId}/${userId}`,
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
  getReplyLikes()
  }
}

</script>
<template>
      <div class="mb-2" style="display: flex; align-items: center;
        font-size: small; color: #999;">
        <span style="margin-right: 10px">
          <img class="reply-propile-img" :src="user.profile ? profileAddress + user.profile : avatar1">
        </span>
        <span style="margin-right: 5px" >
         
          {{user.username }}
        </span>
        <span> • </span>
        <span style="margin-left: 5px">
          {{ formatDate(props.reply.replyCreateDt) }}
        </span>

        <VIconBtn v-if="currentUserId == reply.userId || currentUserId == 1" style="margin-left: auto">        
          <VIcon ref="replyoption" icon="ri-more-2-line" style="cursor: pointer;" />
          <VMenu
            v-model="isreplyoption"
            :activator="$refs.replyoption"
            width="auto"
            >
            <VList>
              <VListItem link>
                <VListItemTitle @click="toggleReply()" style="font-size: small;">
                  수정
                </VListItemTitle>
              </VListItem>
              <VListItem link>
                <VListItemTitle @click="delReply(props.reply.replyId)" style="font-size: small;">
                  삭제
                </VListItemTitle>
              </VListItem>
            </VList>
          </VMenu>  
        </VIconBtn>

      </div>
      <div class="mb-2" v-show="isReplyContent">
        <div v-html="props.reply.replyContent" style="white-space: pre-line;"></div>
      </div>

      <div v-show="isUpdateReply">
        <div >
          <VRow>
            <VCol>
              <VTextarea
              input
              id="updatereply"
              v-model="editReply.content"
              placeholder="수정"
              label="수정"
              rows="1"
              >
              </VTextarea>
            </VCol>

            <div>
              <VCol class="mt-1">
                <VBtn @click="updateReply(props.reply.replyId)"
                    type="button"
                    class="me-2"
                  >
                    수정
                </VBtn>
              </VCol>
            </div>

          </VRow>
        </div>
      </div>

      <VRow class="justify-end">
        <VCol>
          <VIconBtn @click="checkReplyLike" style="font-size: small; cursor: pointer">
          추천 {{ replylike }}
          </VIconBtn>
        </VCol>
        <!-- <ReplyLike :reply="props.reply"></ReplyLike> -->
      </VRow>
</template>
