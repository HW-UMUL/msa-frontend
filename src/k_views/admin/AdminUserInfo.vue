<script setup>
import avatar1 from '@images/avatars/avatar-1.png'

const props = defineProps({
    user: Object
})

// const accountData = {
//   avatarImg: avatar1
// }

const isAccountDeactivated = ref(false)

const serverAddress = inject('serverAddress')
const userAddress = inject('userAddress')
const auth = inject('auth')

// 수정, 삭제

const userName = ref(props.user.username);
const eMail = ref(props.user.email);

// 현재 정보는 제외
const currentUserId = ref('');
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
    currentUserId.value = await response.json();
  }
}
getUserId()

async function delUser(userId) {
  const confirmdel = confirm("삭제하시겠습니까?");
  if (!confirmdel) return;
  
  try {
    const response = await fetch(
      `http://${userAddress}/api/delete/${userId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth}`,
        },
        credentials: 'include'
      }
    );
    
    if (!response.ok) {
      throw new Error('Delete request failed');
    } else {
      alert("삭제되었습니다");
      window.location.reload();
    }
  } catch (error) {
    console.error(error);
    alert("삭제 실패");
  }
}


// role
const isUpdateRole = ref(false)
const isAdminChecked = ref(false);
const isModeratorChecked = ref(false);
const isUserChecked = ref(false);

if(props.user.roles.includes('ADMIN')) { isAdminChecked.value = true; }
if(props.user.roles.includes('MODERATOR')) { isModeratorChecked.value = true; }
if(props.user.roles.includes('USER')) { isUserChecked.value = true; }

</script>

<template>
  <VRow>
    <VCol cols="12">
        <VCardText>
          <VForm class="mt-6">
            <VRow>
                <VCol
                    cols="12"
                    md="12"
                    class="d-flex align-center"
                >
                  <div>
                    <div class="mb-3 user-info-title">
                      Username
                    </div>
                    <div class="mb-3 user-info">
                      {{ props.user.username }}
                    </div>
                  </div>
                    <!-- <VTextField
                    v-model="userName"
                    placeholder="User Name"
                    label="User Name"
                    /> -->
                    <!-- <VBtn 
                        style="margin-left: 20px;"
                        @click="updateUsername">
                        수정
                    </VBtn> -->
                </VCol>

                <VCol
                    md="12"
                    cols="12"
                    class="d-flex align-center"
                >
                  <div>
                    <div class="mb-3 user-info-title">
                      E-mail
                    </div>
                    <div class="mb-3 user-info">
                      {{ props.user.email }}
                    </div>
                  </div>
                    <!-- <VTextField
                    v-model="eMail"
                    placeholder="E-mail"
                    label="E-mail"
                    type="email"
                    /> -->
                    <!-- <VBtn 
                        style="margin-left: 20px;"
                        @click="updateEmail">
                        수정
                    </VBtn> -->
                </VCol>

                <VCol
                    cols="12"
                    md="12"
                >
                    <!-- <VCardText> -->
                      <div class="user-info-title">
                        Role
                      </div>
                      <div v-if="!isUpdateRole" class="d-flex align-center mt-6 user-info">
                          {{ props.user.roles.join(', ') }}
                          <!-- <VBtn
                              style="margin-left: auto; cursor: pointer;"
                              @click="isUpdateRole = !isUpdateRole"
                          >
                              수정
                          </VBtn> -->
                      </div>
                    <!-- </VCardText> -->

                    <div class="role-checkbox" v-if="isUpdateRole">
                        <VCheckboxBtn
                            v-model="isAdminChecked"
                        >
                        Admin</VCheckboxBtn>
                        <!-- <VCheckboxBtn
                            v-model="isModeratorChecked"
                        >Moderator</VCheckboxBtn> -->
                        <VCheckboxBtn
                            v-model="isUserChecked"
                        >User</VCheckboxBtn>
                        <VBtn
                                style="cursor: pointer; margin-right: 20px;"
                                @click="isUpdateRole = !isUpdateRole"
                            >
                                완료
                        </VBtn>
                    </div>
                </VCol>
            </VRow>
          </VForm>
        </VCardText>
    </VCol>

    <VDivider />

    <VCol cols="12"
    v-if="currentUserId != props.user.id">
        <VCardText>
          <div>
            <VCheckbox
              v-model="isAccountDeactivated"
              label="Confirm account deactivation"
            />
          </div>

          <VBtn
            :disabled="!isAccountDeactivated"
            color="error"
            class="mt-3"
            @click="delUser(props.user.id)"
          >
            Deactivate Account
          </VBtn>
        </VCardText>
    </VCol>

    <VCol cols="12"
    v-if="currentUserId == props.user.id">
        <VCardText>
          <div style="color:red; font-weight: 700;">
            <VIcon icon="ri-prohibited-2-line"></VIcon>
            <span> 자신의 계정은 삭제할 수 없습니다. </span>
          </div>
        </VCardText>
    </VCol>
  </VRow>
</template>

<style lang="scss">
.role-checkbox {
    display: flex;
    align-items: center;
}
.role-checkbox > *:not(:last-child) {
    margin-left: 50px;
}

.user-info-title {
  font-weight: 400;
  // color: #000;
  color: #8C57FF;
}

.user-info {
  font-weight: 400;
  // color: #000;
  // color: #8C57FF;
}

</style>
