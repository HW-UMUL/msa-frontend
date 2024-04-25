<script setup>
import { onMounted } from 'vue';


const userAddress = inject('userAddress')
const auth = inject('auth')

const props = defineProps({
    userId: String
})

async function getUserInfo(){
  const response = await fetch(
    `http://${userAddress}/api/whoAreYou/${props.userId}`,
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
  
  getUserInfo()
</script>

<template>
  {{ user.username }}
</template>
