<script setup>
import DefaultLayoutWithVerticalNav from './components/DefaultLayoutWithVerticalNav.vue';
import { default as socketModule1 } from '/test/index.js';
import { default as socketModule2 } from '/test/index2.js';

const serverAddress = inject('serverAddress')
const auth = inject('auth')
const userAddress = inject('userAddress')
const postAddress = inject('postAddress')
const wikiAddress = inject('wikiAddress')


const myPostAlarms = ref([])
const myWikiAlarms = ref([])




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


function getAlarmsFromSession(){
  myPostAlarms.value = JSON.parse(sessionStorage.getItem("postAlarms"))
  myWikiAlarms.value = JSON.parse(sessionStorage.getItem("wikiAlarms"))
  getAlarmCnt()
}

const postSocket = socketModule1;
const wikiSocket = socketModule2;

postSocket.setConnectionString(`ws://${postAddress}/ws/notifier`)
wikiSocket.setConnectionString(`ws://${wikiAddress}/ws/notifier`)

postSocket.connect();
wikiSocket.connect();

postSocket.onOpen(async () => {

  const userId = await getUserId();
  sessionStorage.removeItem('postAlarms')

  const formData = { auth: userId }
  postSocket.socket.value.send(JSON.stringify(formData))
  getAlarms()
})

postSocket.onMessage(message => {
    const jsonData = JSON.parse(message.data)
    var alarms = JSON.parse(sessionStorage.getItem("postAlarms"));
    if(alarms == null) alarms = [];
    alarms.push(jsonData);
    sessionStorage.setItem("postAlarms", JSON.stringify(alarms));

    getAlarmsFromSession()
})

postSocket.onClose(() => {
  
  postSocket.connect()
})


////////////////////

wikiSocket.onOpen(async () => {

const userId = await getUserId();
sessionStorage.removeItem('wikiAlarms')

const formData = { auth: userId }
wikiSocket.socket.value.send(JSON.stringify(formData))
getAlarms()
})

wikiSocket.onMessage(message => {
  const jsonData = JSON.parse(message.data)
  var alarms = JSON.parse(sessionStorage.getItem("wikiAlarms"));
  if(alarms == null) alarms = [];
  alarms.push(jsonData);
  sessionStorage.setItem("wikiAlarms", JSON.stringify(alarms));

  getAlarmsFromSession()
})

wikiSocket.onClose(() => {

  wikiSocket.connect()
})





async function getAlarms(){

  const userId = await getUserId()
  const postAlarmRes = await fetch(
      `http://${postAddress}/api/alarm/read/post/${userId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth}`,          
        },
        credentials: 'include'
      }
  )

  const wikiAlarmRes = await fetch(
    `http://${wikiAddress}/api/alarm/read/wiki/${userId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth}`,          
        },
        credentials: 'include'
      }
  )

  const replyAlarmRes = await fetch(
    `http://${postAddress}/api/alarm/read/reply/${userId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth}`,          
        },
        credentials: 'include'
      }
  )

  if(!postAlarmRes.ok || !wikiAlarmRes.ok || !replyAlarmRes.ok) {
    alert("실패!")
  } else{
    var postAlarms = JSON.parse(sessionStorage.getItem("postAlarms"));
    var wikiAlarms = JSON.parse(sessionStorage.getItem("wikiAlarms"));
    if(postAlarms == null) postAlarms = [];
    if(wikiAlarms == null) wikiAlarms = [];

    var postAlarms = await postAlarmRes.json()
    var wikiAlarms = await wikiAlarmRes.json()
    var replyAlarms = await replyAlarmRes.json()

    postAlarms.forEach(function(postAlarm){
      postAlarms.push(postAlarm)
    })

    wikiAlarms.forEach(function(wikiAlarm){
      wikiAlarms.push(wikiAlarm)
    })

    replyAlarms.forEach(function(replyAlarm){
      postAlarms.push(replyAlarm)
    })

    sessionStorage.setItem("postAlarms", JSON.stringify(postAlarms));
    sessionStorage.setItem("wikiAlarms", JSON.stringify(wikiAlarms));

    getAlarmsFromSession()
  }
}

const alarmCnt = ref()

function getAlarmCnt(){
  alarmCnt.value = JSON.parse(sessionStorage.getItem("postAlarms")).length 
                  + JSON.parse(sessionStorage.getItem("wikiAlarms")).length
}


</script>

<template>

  <!-- modal -->
  <div id="myModal" class="modal">
    <div class="modal-content">
      <span class="close">&times;</span>
      <span>알림</span>
      <div v-for="(item, index) in myPostAlarms" :key="index">
        <span v-if="item.name == 'reply'">새로운 댓글 : {{ item.content }}</span>
        <span v-else-if="item.name == 'post'">새로운 게시글 : {{ item.postTitle }}</span>
      </div>
      <div v-for="(item, index) in myWikiAlarms" :key="index">
        <span>새로운 위키 : {{ item.wikiTitle }}</span>
      </div>
    </div>
  </div>
  
  <DefaultLayoutWithVerticalNav v-model:modelValue="alarmCnt">
    <RouterView />
  </DefaultLayoutWithVerticalNav>
</template>

<style>

.modal {
  display: none;
  position: absolute;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0,0,0,0.4);
}

.modal-content {
  background-color: #fefefe;
  margin: 15% auto;
  padding: 20px;
  border: 1px solid #888;
  width: 50%;
}

.close {
  color: #aaaaaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: #000;
  text-decoration: none;
  cursor: pointer;
}
</style>
<style lang="scss">
// As we are using `layouts` plugin we need its styles to be imported
@use "@layouts/styles/default-layout";
</style>
