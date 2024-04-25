<script setup>
import avatar1 from '@images/avatars/avatar-1.png';
import axios from 'axios';
import { useRouter } from "vue-router";

const serverAddress = inject('serverAddress')
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
    alert("실패!")
  } else{
    const res = await response.json()
    info.value.username = res[0]
    info.value.email = res[1]
    info.value.storeFileName = res[2]
  }
}

async function updateUsername(){

const response = await fetch(
  `http://${userAddress}/api/update/username`,
  {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${auth}`,          
    },
    body: JSON.stringify(info.value.username),
    credentials: 'include'
  }  
)

if(!response.ok) {
  alert("실패!")
} else{
  alert('성공')
  router.push('/logout')
}
}

async function updateEmail(){

const response = await fetch(
  `http://${userAddress}/api/update/email`,
  {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${auth}`,          
    },
    body: JSON.stringify(info.value.email),
    credentials: 'include'
  }  
)

if(!response.ok) {
  alert("실패!")
} else{
  alert('성공')
  router.push('/logout')
}
}

async function updatePassword(){

const response = await fetch(
  `http://${userAddress}/api/update/password`,
  {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${auth}`,          
    },
    body: JSON.stringify(info.value.password),
    credentials: 'include'
  }  
)

if(!response.ok) {
  alert("실패!")
} else{
  alert('성공')
  router.push('/logout')

}
}
///////////// update image
function sendFile() {
    var formData = new FormData();

    // 모든 파일 입력란에 대해 반복하면서 선택된 파일을 FormData에 추가
    var fileInputs = document.querySelectorAll('#user-image-input');
    fileInputs.forEach(input => {
    if (input.files.length > 0) {
        formData.append('files', input.files[0]);
    }
    });

    // FormData를 서버로 전송
    axios.put(`http://${userAddress}/api/update/image`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: authToken,
        }
    }).then(() => {
         getInfo()
         userImageDialog.value = false
    }).catch(() => {
        console.error('파일 전송 실패');
    });
}

///////////////

async function deleteAccount(){

const response = await fetch(
  `http://${userAddress}/api/delete`,
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
  alert("실패")
} else{
  alert("성공")
  router.push('/logout')
}
}


getInfo()

const userImageDialog = ref(false)
</script>

<template>
  <VRow>
    <VCol
      cols="12"
      md="8"
      class="mb-4"
    >
      <VCard class="position-relative">
        <VCardText>
          <div >
            <p >My Info</p>
            <img @click="userImageDialog=true" v-if="!info.storeFileName" class="follow-propile-img" :src="avatar1">
            <img @click="userImageDialog=true" v-else class="follow-propile-img" :src="userProfileAddress + info.storeFileName">
            <div class="d-flex" style="margin-top: 10px;">
                  <VTextField
                  id="username"
                  v-model="info.username"
                  placeholder="이름"
                  label="이름"
                  />
                  <VBtn
                  type="submit"
                  @click="updateUsername"
                  style="margin-top:0.5%; margin-left:3%;"
                >
                  update
                </VBtn>
              </div>
              <div class="d-flex" style="margin-top: 10px;">
                  <VTextField
                  id="email"
                  v-model="info.email"
                  placeholder="메일"
                  label="메일"
                  />
                  <VBtn
                  type="submit"
                  @click="updateEmail"
                  style="margin-top:0.5%; margin-left:3%;"
                >
                  update
                </VBtn>
              </div>
              <div class="d-flex" style="margin-top: 10px;">
                  <VTextField
                  id="password"
                  v-model="info.password"
                  placeholder="비밀번호"
                  label="비밀번호"
                  />
                  <VBtn
                  type="submit"
                  @click="updatePassword"
                  style="margin-top:0.5%; margin-left:3%;"
                >
                  update
                </VBtn>
              </div>
              <div class="d-flex" style="margin-top: 10px;">
                <div class="ml-auto">
                  <VBtn
                  type="submit"
                  @click="deleteAccount"
                >
                   탈퇴
                </VBtn>
              </div>
              </div>
        
          </div>
        </VCardText>
      </VCard>
    
    </VCol>  

  </VRow>


  <VDialog v-model="userImageDialog" max-width="50%">

              <VCard>
                <VCardTitle>User Image Edit</VCardTitle>
                <VCardText>
                  <VCol>
                    <VFileInput
                      id="user-image-input"
                      placeholder="이름"
                      label="이름"
                    />
                  </VCol>
                  <VRow>
                    <VBtn
                    @click="sendFile"
                    class="me-5"
                    style="margin-top:10px;"
                    >
                    Submit
                    </VBtn>
                  </VRow>
                </VCardText>
                <VCardActions>
                  <!-- 팝업을 닫는 버튼 -->
                  <VBtn color="primary" @click="userImageDialog = false">Close</VBtn>
                </VCardActions>
              </VCard>
            </VDialog>   
</template>

<style lang="scss">

.follow-propile-img {
  margin-top: 10px;
  margin-left: 10px;
   width: 100px;
   height: 100px;
  border-radius: 50%;
  object-fit: cover;
}
</style>
