<script setup>
import { onMounted, ref } from 'vue';

const props = defineProps({
    poststar: Object
})

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
const star = ref([])

async function getStars(){
  
  const response = await fetch(
    `http://${postAddress}/api/poststar/read/${props.poststar.postId}`,
    {
        method: 'GET',
        headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth}`
        },
        credentials: 'include'
    }
  )

  if(!response.ok) {
    alert("실패!")
  } else{
    star.value = await response.json()
  }
}

onMounted(getStars)

</script>

<template>
    <span>
        {{ star }}
    </span>
</template>
  