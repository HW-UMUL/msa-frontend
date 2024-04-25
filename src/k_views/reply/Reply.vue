<script setup>
import { ref } from 'vue';
import ReplyOption from './ReplyOption.vue';

const serverAddress = inject('serverAddress')
const postAddress = inject('postAddress')
const userAddress = inject('userAddress')
const auth = inject('auth')

const props = defineProps({
    postob: Object
})

const replys = ref([])
const reply = ref({
  replyContent: ''
})

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


async function getReply(postId){

  const userId = await getUserId()
  const formData = {
    replyContent: reply.value.replyContent
  }

  const response = await fetch(
    `http://${postAddress}/api/reply/readpost/${postId}/${userId}`,
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
    replys.value = await response.json()
    reply.value.replyContent = ''
  }
}

async function writeReply(postId){
  const userId = await getUserId()
  const formData = {
    content: reply.value.replyContent
  }

  const response = await fetch(
      `http://${postAddress}/api/reply/create/${postId}/${userId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth}`
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      }
  )

  if(!response.ok) {
    alert("실패!")
  } else{
    getReply(postId)
  }
}

getReply(props.postob.postId)
</script>

<template>
  <div v-for="(item, index) in replys" :key="index">
    <VDivider class="mb-2"/>
    <div class="mb-2">
      <ReplyOption :getReply="getReply" :reply="item" :post="props.postob" /> 
    </div>
  </div>

  <VRow>
    <VCol>
      <VTextarea
      input
      id="reply"
      v-model="reply.replyContent"
      placeholder="댓글"
      label="댓글"
      style="white-space: pre-line;"
      rows="1"
      >
      </VTextarea>
    </VCol>

    <div>
      <VCol class="mt-1">
        <VBtn @click="writeReply(props.postob.postId)"
            type="button"
            class="me-2"
          >
            작성
        </VBtn>
      </VCol>
    </div>
  </VRow>

</template>

<style lang="scss">
.reply-propile-img {
  width: 30px;
  height: 30px;
  border-radius: 50%;
}
</style>
