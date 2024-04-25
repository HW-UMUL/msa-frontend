<script setup>
import PostSort from '@/k_views/list/PostSort.vue';
import { useRouter } from "vue-router";
import { VCol, VRow, VTextField } from 'vuetify/lib/components/index.mjs';

const router = useRouter()
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


const post = ref({
  postTitle: '',
  postContent: '',
  tag: ''
})


const props = defineProps({
    id: String
})

async function getPost(postId){


  const userId = await getUserId()

  const postResponse = await fetch(
      `http://${postAddress}/api/post/read/${postId}/${userId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth}`,
        },
        credentials: 'include'
      }
  )

  const tagResponse = await fetch(
      `http://${postAddress}/api/tagpost/read/${postId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth}`,
        },
        credentials: 'include'
      }
  )

  if(!postResponse.ok || !tagResponse.ok) {
    alert("실패!")
  } else{
    post.value = await postResponse.json()
    post.value.tag = await tagResponse.text()
  }
}

const postId = props.id
getPost(postId)

async function updatePost(postId){

  const userId = await getUserId()

  const formData = {
    postTitle: post.value.postTitle,
    postContent: post.value.postContent,
    tag: post.value.tag
  }

  const response = await fetch(
      `http://${postAddress}/api/post/update/${postId}/${userId}`,
      {
        method: 'PUT',
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
          <div>
            <p >Post 수정</p>
                <VCol
                >
                  <VTextField
                  id="title"
                  v-model="post.postTitle"
                  placeholder="제목"
                  label="제목"
                  />
                </VCol>

                <VCol
                >

                <VTextarea
                id="content"
                v-model="post.postContent"
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
                @click="updatePost(props.id)"
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
