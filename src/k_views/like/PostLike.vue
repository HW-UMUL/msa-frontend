<script setup>
import { onMounted, ref } from 'vue';

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
    postlike: Object
})

const like = ref([])

async function getLikes(){
  
  const response = await fetch(
    `http://${postAddress}/api/postlike/read/${props.postlike.postId}`,
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
    like.value = await response.json()
  }
}

onMounted(getLikes)

</script>

<template>
    <span>
        {{ like }}
    </span>
</template>
  