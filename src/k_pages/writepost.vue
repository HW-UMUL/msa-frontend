<script setup>
import PostSort from '@/k_views/list/PostSort.vue';
import { useRouter } from "vue-router";
import { VCol, VRow, VTextField, VTextarea } from 'vuetify/lib/components/index.mjs';

const router = useRouter()
const serverAddress = inject('serverAddress')
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

const auth = inject('auth')

const post = ref({
  title: '',
  content: '',
  category: '',
  tag: ''
})

async function writePost(){
  const userId = await getUserId()
  const formData = {
    username: sessionStorage.getItem("myname"),
    postTitle: post.value.title,
    postContent: post.value.content,
    tag: post.value.tag
  }

  const response = await fetch(
      `http://${postAddress}/api/post/create/${userId}`,
//       `http://${postAddress}/api/post/create`,
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
//    router.push(`/`) 
    router.go(-1) 
  }
}

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
          <p >Post 작성</p>
          <VCol
          > 
            <VTextField
            id="title"
            v-model="post.title"
            placeholder="제목"
            label="제목"
            >
            </VTextField>
          </VCol>

          <VCol
          >

            <VTextarea
            id="content"
            v-model="post.content"
            placeholder="본문"
            label="본문"
            />

          </VCol>

          <VCol
          >
            <VTextField
            id="tag"
            v-model="post.tag"
            placeholder="태그"
            label="태그"
            />
          </VCol>

          <VCol cols="12">
            <VBtn
              @click="writePost()"
              type="submit"
              class="me-5"
            >
              Submit
            </VBtn>
            
            <!-- <VBtn
              color="secondary"
              type="reset"
              variant="outlined"
            >
              Reset
            </VBtn> -->
          </VCol>

        </div>
      </VCardText>
    </VCard>
    
    </VCol>
    
    <VCol
      cols="12"
      md="4"
    >
      <PostSort />
    </VCol>

  </VRow>
</template>
