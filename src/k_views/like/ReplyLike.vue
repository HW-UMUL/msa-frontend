<script setup>
import { ref } from 'vue';

const serverAddress = inject('serverAddress')
const auth = inject('auth')
const postAddress = inject('postAddress')
const userAddress = inject('userAddress')

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

const props = defineProps({
    replylikevue: Object,
    postoj: Object,
    replyitem: Object
})

const editReply = ref({
  content: ''
})

const replylike = ref([])
const isUpdateReply = ref(false)
const checkReplyId = ref(null)

async function checkReplyLike(){
  const userId = await getUserId()
    const response = await fetch(
        `http://${postAddress}/api/replylike/check/${props.replyitem.replyId}/${userId}`,
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

async function getReplyLikes(){
  
  const response = await fetch(
      `http://${postAddress}/api/replylike/read/${props.replyitem.replyId}`,
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

</script>

<template>

  <VCol>
      <VIconBtn @click="checkReplyLike()" style="font-size: small; cursor: pointer">
      추천 {{ replylike }}
      </VIconBtn>
  </VCol>
</template>
