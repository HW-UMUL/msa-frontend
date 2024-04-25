<script setup>
import ChatRoomSummary from '@/views/chat/ChatRoomSummary.vue';
import { useRouter } from 'vue-router';

const serverAddress = inject('serverAddress')
const chatAddress = inject('chatAddress')
const userAddress = inject('userAddress')

const auth = inject('auth')

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

const router = useRouter()

const chatRooms = ref([])

async function getChatRooms(){
  const userId = await getUserId()
  const response = await fetch(
    `http://${chatAddress}/api/chatroomuser/read/${userId}`,
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
    chatRooms.value = await response.json()
  }
}


const chatRoom = ref({
  name: ''
})

async function createChatRoom(){
  const userId = await getUserId()
  const formData = {
    name: chatRoom.value.name
  }

  const response = await fetch(
      `http://${chatAddress}/api/chatroom/create/${userId}`,
      {
        method: 'POST',
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
    getChatRooms()
    //router.push('/')  
  }
}


async function moveChatRoom(chatRoomId){
  
  router.push({
      path: `/chatroom/${chatRoomId}`
  }).then(() => { window.location.reload()})
  
}

getChatRooms()



const createChatRoomDialog = ref(false)

</script>

<template>
  <VRow>
    <VCol
      cols="12"
      md="8"
      class="mb-4"      
    >
    <div v-for="(item, index) in chatRooms" :key="index" >
      <div>    
        <ChatRoomSummary :chatRoom="item.chatRoom" style="margin-bottom: 20px;" @click="moveChatRoom(item.chatRoom.id)" />
      </div>
    </div>
    </VCol>  
    <VCol
      cols="12"
      md="4"
    >
      <VCard title="Create Chat Room" @click="createChatRoomDialog=true" style="margin-bottom: 20px;"/>

    </VCol>  

  </VRow>


<!--
  <VDialog v-model="createChatRoomDialog" max-width="50%">
-->
            <VDialog v-model="createChatRoomDialog" max-width="50%">
              <VCard>
                <VCardTitle>Create Chat Room</VCardTitle>
                <form @submit.prevent="createChatRoom()">
                  <VCol>
                  <VTextField
                  id="name"
                  v-model="chatRoom.name"
                  placeholder="채팅방 이름"
                  label="채팅방 이름"
                  />
                  <VBtn
                  type="submit"
                  class="me-5"
                  style="margin-top:10px;"
                  >
                  Submit
                  </VBtn>
                </VCol>
                </form>
                <VCardActions>
                  <!-- 팝업을 닫는 버튼 -->
                  <VBtn color="primary" @click="createChatRoomDialog = false">Close</VBtn>
                </VCardActions>
              </VCard>
            </VDialog>

</template>

