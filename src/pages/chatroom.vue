<script setup>
import avatar1 from '@images/avatars/avatar-1.png';
import { onMounted } from 'vue';
import socketModule from '/test/index.js';

const profileAddress = inject('profileAddress')
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
    return response.json()
  }
}

const myname = sessionStorage.getItem("myname")
const check = ref(true)
// websocket

socketModule.setConnectionString(`ws://${chatAddress}/ws`)
socketModule.connect()

socketModule.onOpen(() => {
  const formData = { auth: auth }
  socketModule.socket.value.send(JSON.stringify(formData))
})

socketModule.onMessage(async (message) => {
    const jsonData = JSON.parse(message.data)
    jsonData.date = new Date(jsonData.date)
    const getUser = await getUserInfo(jsonData.userId)
    jsonData.username = getUser.username
    chats.value.push(jsonData)
    check.value = !check.value
})

socketModule.onClose(() => {
  socketModule.connect()
})
//socketModule.socket.value.push
//socketModule.socket.value.close();


///////


const props = defineProps({
    roomId: String
})

// 초기에 빈 배열로 시작
const inviteUsers = ref([{ email: '' }])
const chatRoomUsers = ref([])

const chats = ref([])

// 사용자 정보를 서버로 전송하는 함수
async function addChatRoomUsers(){
  const userId = await getUserId()
  const formData = { userIds: [] }
  
  await Promise.all(inviteUsers.value.map(async function(user) {
    const getUser = await getUserIdByEmail(user.email);
    formData.userIds.push(getUser.userId);
  }));

  const response = await fetch(
    `http://${chatAddress}/api/chatroomuser/create/${props.roomId}/${userId}`,
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
    getChatRoomUsers()
    inviteUserDialog.value = false
  }
}

async function getChatRoomUsers(){
  const userId = await getUserId()
  const response = await fetch(
    `http://${chatAddress}/api/chatroomuser/read/${props.roomId}/${userId}`,
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
    chatRoomUsers.value = await response.json()
  }
}

// 새로운 사용자 추가하는 함수
const addUser = () => {
  inviteUsers.value.push({ email: '' })
}

// socket.value.send(text.value)

const message = ref('')
async function sendMessage(){
  const formData = {
    content: message.value
  }
  const userId = await getUserId()
  const response = await fetch(
    `http://${chatAddress}/api/chat/create/${props.roomId}/${userId}`,
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

  if(!response.ok) {
    alert("실패!")
  } else{
    message.value = ''
    const chatBoard = document.querySelector('.chat-board')
    chatBoard.scrollTop = chatBoard.scrollHeight
//    getMessages()
    scrollTop()
  }}

async function getMessages(){
  const userId = await getUserId()
  const response = await fetch(
    `http://${chatAddress}/api/chat/read/${props.roomId}/${userId}`,
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
    chats.value = await response.json()
    chats.value.forEach(async function(chat) {
      const getUser = await getUserInfo(chat.userId)
      chat.username = getUser.username
    })
  }
}

function scrollTop(){
  const chatBoard = document.querySelector('.chat-board')
  chatBoard.scrollTop = chatBoard.scrollHeight + 200
}

onMounted(() => {
  getMessages().then(() => {
    
    scrollTop()
  })
})


onUpdated(chats => {
  scrollTop()
})

getChatRoomUsers()  


const inviteUserDialog = ref(false)



function formatDateTime(dateTimeString) {
  const dateTime = new Date(dateTimeString); // 문자열을 Date 객체로 변환

  // 시간을 12시간 형식으로 변환
  let hours = dateTime.getHours();
  const ampm = hours >= 12 ? '오후' : '오전';
  hours %= 12;
  hours = hours || 12; // 0시를 12시로 표시

  // 분을 두 자리 수로 포맷
  const minutes = String(dateTime.getMinutes()).padStart(2, '0');

  // 결과 문자열 생성
  const formattedTime = `${ampm} ${hours}:${minutes}`;

  return formattedTime;
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
    return response.json()
  }

}



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

</script>

<template>
  <div style="display: none;">{{ check }}</div>
  <VRow>
    <VCol
      cols="12"
      md="8"
      class="mb-4"
    >
    <div class="chat-board">
      <div v-for="(chat, index) in chats" :key="index">
        <div v-if="chat.username===myname" class="d-flex flex-row-reverse">
          <div id="my-chat" class="ma-2 pa-2 my-chat-box">
              {{ chat.chatContent }}
          </div>     
          <div class="chat-date">{{ formatDateTime(chat.chatCreateDt) }}</div>
        </div>
        <div v-else>        
          <div class="d-flex">
            <img class="other-propile-img" :src="avatar1"/>
            <!-- <img v-if="!chat.user.profile" class="other-propile-img" :src="avatar1"/>
            <img v-if="chat.user.profile" class="other-propile-img" :src="profileAddress + chat.user.profile.storeFileName"/>           -->
            <div class="flex-column" style="width:100%">
              <div style="margin-left: 8px;">{{ chat.username }}</div>
              <div class="d-flex">
                <div id="other-chat" class="other-chat-box ma-2 pa-2">{{ chat.chatContent }}</div>        
                <div class="align-self-end other-chat-date">{{ formatDateTime(chat.chatCreateDt) }}</div>        
              </div>
            </div>
          </div>

        </div>       
      </div>
    </div>
    <div class="input-message">
      <VRow class="align-self-end" style="max-width:100%;">
        <VCol style="min-width:77%">
          <VTextarea
          id="message"
          placeholder="Message"
          label="Message"
          v-model="message"
          rows=1
          no-resize="true"
          style="margin-left: 10px;"
          />
       </VCol>
       <VCol>
          <VBtn @click="sendMessage" style="margin-left: 10px; width:100%">Submit</VBtn>
        </VCol>
      </VRow>
    </div>
   </VCol>  
    <VCol
      cols="12"
      md="4"
    >
      <VCard title="Invite" @click="inviteUserDialog=true" style="margin-bottom: 20px;"/>

    </VCol>  
  </VRow>



            <VDialog v-model="inviteUserDialog" max-width="50%">
              <VCard>
                <VCardTitle>Invite</VCardTitle>
                <VCardText>
                  <form @submit.prevent="addChatRoomUsers">
                    <div v-for="(user, index) in inviteUsers" :key="index">
                      <VTextField
                      id="email"
                      v-model="user.email"
                      placeholder="email"
                      label="email"
                      style="margin-bottom: 5px;"
                      />
                    </div>
                    <VBtn 
                    type="button" 
                    @click="addUser"
                    style="margin-right: 5px;">Add User</VBtn>
                    <VBtn type="submit">Submit</VBtn>
                  </form>               
                </VCardText>
                <VCardActions>
                  <!-- 팝업을 닫는 버튼 -->
                  <VBtn color="primary" @click="inviteUserDialog = false">Close</VBtn>
                </VCardActions>
              </VCard>
            </VDialog>

</template>
<style>

#message::-webkit-scrollbar-thumb {
  display: none;
  background: #888; /* 스크롤바 색상 */
}
#message::-webkit-scrollbar-corner{
  display: none;
}
/* 수직 스크롤바 스타일 */
::-webkit-scrollbar {
  width: 10px; /* 스크롤바의 너비 */
}

::-webkit-scrollbar-thumb {
  background: #888; /* 스크롤바 색상 */
}

/* Chat Box 
      background-color: #f0f0f0;
      max-width: 55%;

*/

.chat-board {
  height: 75dvh; 
  overflow-y:scroll; 
  overflow-x: hidden;
  background-color: rgba(220, 145, 196, 0.393);
  border-radius: 10px 10px 0 0; /* 오른쪽 상단 귀퉁이만 직각으로 만듦 */
  /* 좌상  우상 우하 좌하*/
}

.input-message{
  margin-top: 12px;
  background-color: rgba(220, 145, 196, 0.393);
  border-radius: 0 0 10px 10px; /* 오른쪽 상단 귀퉁이만 직각으로 만듦 */

}
.my-chat-box {
      max-width: 54%;
      background-color: rgb(255, 255, 255);
      border: 2px solid #333;
      border-radius: 10px 0 10px 10px; /* 오른쪽 상단 귀퉁이만 직각으로 만듦 */
      word-wrap: break-word;
      white-space: pre-line;
      color: black;
}

.other-chat-box {
      max-width: 55%;
      box-sizing:initial;
      background-color: rgb(255, 255, 255);
      border: 2px solid #333;
      border-radius: 0 10px 10px 10px; /* 왼쪽 상단 귀퉁이만 직각으로 만듦 */
      word-wrap: break-word;
      white-space: pre-line;
      color: black;
}


.chat-date {
  display: flex;
  align-items: flex-end; 
  margin-bottom: 5px;
}


.other-chat-date {
  display: flex;
  align-items: flex-end; 
  margin-left: 5px;
  margin-bottom: 5px;
}


.other-propile-img {
  margin-left: 2px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}
</style>
