<script setup>
import Post from '@/k_views/post/Post.vue';
//import TableWikiList from '@/views/wiki/WikiList.vue';
import TableWikiList from '@/d_wiki/tablewikilist.vue';

import avatar1 from '@images/avatars/avatar-1.png';
import { useRouter } from "vue-router";

const serverAddress = inject('serverAddress')
const profileAddress = inject('profileAddress')

const userAddress = inject('userAddress')
const tableAddress = inject('tableAddress')
const postAddress = inject('postAddress')
const wikiAddress = inject('wikiAddress')

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
const router = useRouter()

const tables = ref([])
const invites = ref([])

async function getTables(){
  const userId = await getUserId()
  const response = await fetch(
      `http://${tableAddress}/api/tableuser/read/accept/${userId}`,
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
    tables.value = await response.json()
    getPosts()
  }
}

function moveTable(tableId){
  router.push(`/mytables/${tableId}`)
}

function createTable(){
  router.push('/createtable')
}

async function getInvites(){
  const userId = await getUserId()
  const response = await fetch(
      `http://${tableAddress}/api/tableuser/invite/${userId}`,
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
    invites.value = await response.json()
  }
}

async function acceptInvite(tableUserId){
  const userId = await getUserId()
  const response = await fetch(
      `http://${tableAddress}/api/tableuser/update/${tableUserId}/${userId}`,
      {
        method: 'PUT',
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
    getInvites()
    getTables()
  }
}

async function rejectInvite(tableUserId){
  const userId = await getUserId()
  const response = await fetch(
      `http://${tableAddress}/api/tableuser/delete/${tableUserId}/${userId}`,
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
    alert("실패!")
  } else{
    getInvites()
  }
}

getInvites()
getTables()


const posts = ref([])

async function getPosts(){
   const userId = await getUserId()
  // const formData = { tableIds : [] }
    
  // tables.value.forEach(function(table){
  //   formData.tableIds.push(table.id)
  // })

  // console.log(formData)
  const response = await fetch(
  
    `http://${postAddress}/api/post/read/table/all/${userId}`,
   {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth}`,          
      },
//      body: JSON.stringify(formData),
      credentials: 'include'
    }
)

if(!response.ok) {
  alert("실패!")
} else{
  try{
    posts.value = await response.json()

  } catch{

  }
}
}

const wikis = ref([])

async function getWikis(){
const userId = await getUserId()
const response = await fetch(
    `http://${wikiAddress}/api/wiki/read/table/all/${userId}`,
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
  wikis.value = await response.json()
}
}




//getPosts()
getWikis()

const changePostWiki = ref(true)

</script>

<template>
  <VRow>
    <VCol
      cols="12"
      md="8"
      class="mb-4"
    >
    <VRow style="height: 30px; margin-bottom: 20px;">
      <div class="selectPostWiki" @click="changePostWiki=true">POST</div>
      <div class="bar"></div>
      <div class="selectPostWiki" @click="changePostWiki=false">WIKI</div>
    </VRow>
      <div v-if="changePostWiki" v-for="(item, index) in posts" :key="index">
        <Post :post="item" style="margin-bottom: 20px;"/>       
      </div>
      <div v-if="!changePostWiki">
        <TableWikiList/>
      </div>
    </VCol>  
    <VCol
      cols="12"
      md="4"
    >
      <VCard title="Create Table" @click="createTable" style="margin-bottom: 20px;"/>
      <VCard v-if=invites.length title="Invite Table" style="margin-bottom: 20px;">
        <div v-for="(item, index) in invites" :key="index">
          <VDivider/>
          <VListItem>
          <VRow>            
            <VCol
            cols="12"
            md="7"
            class="mb-4">
              {{ item.table.name }}
            </VCol>
            <VCol
            cols="12"
            md="5"
            class="mb-4">
            <span @click="acceptInvite(item.id)">Accept/</span>
            <span @click="rejectInvite(item.id)">Reject</span>
            </VCol>
          </VRow>
        </VListItem>
        </div>
      </VCard>

      <VCard v-if=tables.length title="My Table" style="margin-bottom: 20px;">
        <div v-for="(item, index) in tables" :key="index">
          <VDivider/>
            <div
              @click="moveTable(item.table.id)" class="d-flex">
                <div>
                <img v-if="!item.table.profile" class="my-table-img" :src="avatar1"/>
                <img v-if="item.table.profile"  class="my-table-img" :src="profileAddress + item.table.profile.storeFileName"/>          
                </div>
                <div class="my-table-name">
                {{ item.table.name }}
                </div>
            </div>
        </div>
      </VCard>

    </VCol>  

  </VRow>
</template>
<style lang="scss">
@use "@core/scss/pages/page-auth.scss";
.selectPostWiki{
  align-items: center;
  width: 49%;
  display: flex;
  justify-content: center;
  font-size: 20px; 
//  font-weight: bold;
}

.bar {
    width: 1px; /* 바의 너비 */
    background-color: gray; /* 바의 배경색 */
}

.my-table-img{
  margin-left: 10%;
  margin-top:10%;
   width: 50px;
   height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.my-table-name{
  display: flex; 
  align-items: center;
  margin-left: 5%;
  font-size: 20px;
  color: black;
}
</style>
