<script setup>
import VerticalNavGroup from '@layouts/components/VerticalNavGroup.vue';
import VerticalNavLink from '@layouts/components/VerticalNavLink.vue';

const userAddress = inject('userAddress')
const auth = inject('auth')

const userrole = ref([])
const isAdmin = ref(false)
async function getuserrole(userId){
  
  const response = await fetch(
      `http://${userAddress}/api/user/role/${userId}`,
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
    console.error()
  } else{
    userrole.value = await response.json()
    isAdmin.value = userrole.value.some(user => user.role.role === 'ROLE_ADMIN');
  }
}

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
    currentUserId.value = await response.json();
    getuserrole(currentUserId.value)
  }

}
getUserId()

</script>

<template>
    <VerticalNavGroup
      :item="{
        title: 'My Page',
        icon: 'ri-user-smile-line'
      }"
    >
      <VerticalNavLink
      :item=" {
        title: 'Account Setting',
        to: '/mypage',
        icon: 'ri-user-line'
      }"/>

      <VerticalNavLink
      :item=" {
        title: 'My Post',
        to: '/myposts',
        icon: 'ri-question-answer-line'      
      }"/>

      <VerticalNavLink
      :item=" {
        title: 'My Wiki',
        to: '/mywikis',
        icon: 'ri-book-line'      
      }"/>

      <VerticalNavLink
      :item=" {
        title: 'My Reply',
        to: '/myreplys',
        icon: 'ri-chat-1-line'      
      }"/>

      <VerticalNavLink
      :item=" {
        title: 'Like',
        to: '/mylikes',
        icon: 'ri-heart-line'      
      }"/>      

      <VerticalNavLink
      :item=" {
        title: 'Star',
        to: '/mystars',
        icon: 'ri-star-line'      
      }"/>


  </VerticalNavGroup>

  <VerticalNavLink
    :item=" {
      title: 'Post',
      to: '/dashboard',
      icon: 'ri-question-answer-line'      
    }">    
  </VerticalNavLink>

  <VerticalNavLink
      :item="{
        title: 'Wiki',
        to: '/wiki',
        icon:'ri-book-line'
      }"
  />
  
  <!-- <VerticalNavLink
    :item="{
      title: 'Login',
      icon: 'ri-login-box-line',
      to: '/login',
    }"
  />
  <VerticalNavLink
    :item="{
      title: 'Logout',
      icon: 'ri-logout-box-line',
      to: '/logout',
    }"
  />

  <VerticalNavLink
    :item="{
      title: 'Register',
      icon: 'ri-user-add-line',
      to: '/register',
    }"
  /> -->

  <VerticalNavLink
    :item="{
      title: 'Table',
      icon: 'ri-group-line',
      to: '/table',
    }"
  /> 

  <VerticalNavLink
    :item="{
      title: 'Chat',
      icon: 'ri-chat-1-line',
      to: '/chat',
    }"
  /> 

  <VerticalNavLink
    :item="{
      title: 'Follow',
      icon: 'ri-user-heart-line',
      to: '/follow',
    }"
  />

  <!-- admin -->

  <VerticalNavGroup
  v-if="isAdmin"
  :item="{
      title: 'Admin',
      icon: 'ri-admin-line',
      badgeContent: 'Admin',
      badgeClass: 'bg-light-primary text-primary',
    }"
  >
    <!-- <VerticalNavLink
      :item="{
        title: 'Post/Wiki',
        icon: 'ri-admin-line',
        to: '/admin',
      }"
    /> -->
    <VerticalNavLink
      :item="{
        title: 'Post',
        icon: 'ri-home-line',
        to: '/admin/adminpost',
      }"
    /> 
    <VerticalNavLink
      :item="{
        title: 'Wiki',
        icon: 'ri-book-line',
        to: '/admin/adminwiki',
      }"
    />
    <VerticalNavLink
      :item="{
        title: 'User',
        icon: 'ri-user-line',
        to: '/admin/adminuser',
      }"
    />
    <VerticalNavLink
      :item="{
        title: 'Table',
        icon: 'ri-team-line',
        to: '/admin/admintable',
      }"
    />
  </VerticalNavGroup>

</template>
