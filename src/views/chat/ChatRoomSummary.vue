<script setup>

const chatAddress = inject('chatAddress')
const userAddress = inject('userAddress')
const auth = inject('auth')

const props = defineProps({
  chatRoom: Object
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

const chat = ref([])

async function getRecentMessage(){
  const userId = await getUserId()
  const response = await fetch(
    `http://${chatAddress}/api/chat/read/recent/${props.chatRoom.id}/${userId}`,
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
    chat.value = await response.json()    
      try{
//        chat.value = await response.json()    
      }
      catch(error) {

      }
  }
}

console.log(chat.value)
getRecentMessage()
</script>

<template>
  <VCard rounded="pill">
    <VCardTitle>
      {{ chatRoom.name }}

    </VCardTitle>
    <VCardText v-if="chat.content"> 
      <!-- <span>{{ chat.user.username }} : </span> -->
      <span>{{ chat.content }}</span>      
    </VCardText>
    <VCardText v-if="!chat.content"> 
      <span> Created New Chatting Room</span>
    </VCardText>

  </VCard>
</template>
