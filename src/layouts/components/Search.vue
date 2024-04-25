<script setup>
import axios from 'axios';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const postAddress = inject('postAddress')
const userAddress = inject('userAddress')
const wikiAddress = inject('wikiAddress')

const auth = inject('auth')

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

// 검색 변수 설정
const setFocus = ref(false);
const filteredData = ref(null);
const filterKeywords = ref();

// input 박스 클릭시 block 노출
function handleFocus(){ // event
  // 클릭시 block 노출
  setFocus.value = true
  // console.log(setFocus.value)

    // 검색 목록 출력
    // 특수문자 정리
    const cleanedKeyword = searchKeyword.value.keyword.replace(/[^\wㄱ-ㅎㅏ-ㅣ가-힣\s]/g, '');
    const searchTerm = cleanedKeyword.replace(/\s/g, '').toLowerCase(); // 검색 키워드를 소문자로 변환
    const searchTermRegex = makeRegexByCho(searchTerm);

    if(searchKeyword.value.option == 'Post'){
    if(searchKeyword.value.keyword != null && searchKeyword.value.keyword != '' && searchKeyword.value.keyword.trim() !== ''){
      filteredData.value = responsePostData.value.sort((a, b) => a.length - b.length)
                                               .filter(item => item.replace(/\s/g, '').toLowerCase().match(searchTermRegex))
                                               .slice(0, 10); // 걸러진 데이터 필터링

    // filteredData.value = responsePostData.value.filter(item => item.replace(/\s/g, '').toLowerCase().match(searchTermRegex))
    //                                            .slice(0, 10); // 걸러진 데이터 필터링
    if(filteredData.value.length > 0){
        filterKeywords.value = filteredData.value
    } else {
        filterKeywords.value =  [searchKeyword.value.keyword] // 어떤게 더 낫나 ['검색 데이터가 없습니다']
    } // 검색 데이터가 없는 것은 클릭시 POST로 넘어갈 수 있도록 만들기
    } else {
    filterKeywords.value = searchPostHistory.value
    }
  }

  if(searchKeyword.value.option == 'Wiki'){

    if(searchKeyword.value.keyword != null && searchKeyword.value.keyword != '' && searchKeyword.value.keyword.trim() !== ''){
        // Wiki는 responseData를 Wiki에 맞게 바꿔줘야 함.
        filteredData.value = responseWikiData.value.sort((a, b) => a.length - b.length).filter(item => item.replace(/\s/g, '').toLowerCase().match(searchTermRegex)).slice(0, 10);; // 걸러진 데이터 필터링
      if(filteredData.value.length > 0){
          filterKeywords.value = filteredData.value
      } else {
          filterKeywords.value =  [searchKeyword.value.keyword] // 어떤게 더 낫나 ['검색 데이터가 없습니다']
      } // 검색 데이터가 없는 것은 클릭시 POST로 넘어갈 수 있도록 만들기
    } else {
    
    filterKeywords.value = searchWikiHistory.value

    }
  }

}

// input 박스 외부 클릭시 block 사라짐 기능
function handleBlur(){
  setFocus.value = false
  // console.log(setFocus.value)
}

// 키보드 입력에 따른 목록 변환
function keyHandle(event) {

  // 키보드 방향키 작업시 input 창에 글자 나오도록 설정
  if(event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowRight'){return} 
  if(event.key === 'Process'){return} // console.log(event.key) console.log(event.isComposing) 

  // 검색 목록 출력
  // 특수문자 정리
  const cleanedKeyword = searchKeyword.value.keyword.replace(/[^\wㄱ-ㅎㅏ-ㅣ가-힣\s]/g, '');
  const searchTerm = cleanedKeyword.replace(/\s/g, '').toLowerCase(); // 검색 키워드를 소문자로 변환
  const searchTermRegex = makeRegexByCho(searchTerm);

  if(searchKeyword.value.option == 'Post'){
    if(searchKeyword.value.keyword != null && searchKeyword.value.keyword != '' && searchKeyword.value.keyword.trim() !== ''){
    filteredData.value = responsePostData.value.sort((a, b) => a.length - b.length).filter(item => item.replace(/\s/g, '').toLowerCase().match(searchTermRegex)).slice(0, 10); // 걸러진 데이터 필터링 // 10개 잘랐음
    if(filteredData.value.length > 0){
        filterKeywords.value = filteredData.value
    } else {
        filterKeywords.value =  [searchKeyword.value.keyword] // 어떤게 더 낫나 ['검색 데이터가 없습니다']
    } // 검색 데이터가 없는 것은 클릭시 POST로 넘어갈 수 있도록 만들기
    } else {
    filterKeywords.value = searchPostHistory.value
    
    }
  }

  if(searchKeyword.value.option == 'Wiki'){
    if(searchKeyword.value.keyword != null && searchKeyword.value.keyword != '' && searchKeyword.value.keyword.trim() !== ''){
        // Wiki는 responseData를 Wiki에 맞게 바꿔줘야 함.
        filteredData.value = responsePostData.value.sort((a, b) => a.length - b.length)
                                                  .filter(item => item.replace(/\s/g, '').toLowerCase().match(searchTermRegex))
                                                  .slice(0, 10); // 걸러진 데이터 필터링
      if(filteredData.value.length > 0){
          filterKeywords.value = filteredData.value
      } else {
          filterKeywords.value =  [searchKeyword.value.keyword] // 어떤게 더 낫나 ['검색 데이터가 없습니다']
      } // 검색 데이터가 없는 것은 클릭시 POST로 넘어갈 수 있도록 만들기
    } else {
    filterKeywords.value = searchWikiHistory.value

    }
  }

}

// 한글 즉시 인식
function changeKeyword(event) {
  // if(!event.isComposing){return}
  searchKeyword.value.keyword = event.target.value
}

// 초성 검색 기능
// 1. 초성배열
const CHO_HANGUL = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ',
  'ㄹ', 'ㅁ', 'ㅂ','ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ',
  'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
];

// 2. 한글 시작 유니코드
const HANGUL_START_CHARCODE = "가".charCodeAt();

// 3. 초성, 종성 주기
const CHO_PERIOD = Math.floor("까".charCodeAt() - "가".charCodeAt());
const JUNG_PERIOD = Math.floor("개".charCodeAt() - "가".charCodeAt());

// 4. 한글 결합 함수
function combine(cho, jung, jong) {
  return String.fromCharCode(
    HANGUL_START_CHARCODE + cho * CHO_PERIOD + jung * JUNG_PERIOD + jong
  );
}

// 5. 초성검색
function makeRegexByCho(search = "") {
  const regex = CHO_HANGUL.reduce(
    (acc, cho, index) =>
      acc.replace(
        new RegExp(cho, "g"),
        `[${combine(index, 0, 0)}-${combine(index + 1, 0, -1)}]` // [시작-끝] -> [가-깋]
      ),
    search
  );

  return new RegExp(`(${regex})`, "g");
}

// 변수와 일치하는 단어 강조하기(하이라이트) - 도전과제



// 검색창 block 선택하기
function selectKeyword(filterKeyword, event){
  // 클릭된 요소가 <v-btn>인 경우에만 deleteSearchHistory 함수를 호출
  
  if (event.target.tagName != 'UL' && event.target.classList.contains('search-keyword') == false) {
    event.preventDefault();
    return;
  }
  searchKeyword.value.keyword = filterKeyword;
  search();
}

// 검색창 block 요소 마우스 커서 하이라이트 
const highlightedKeyword = ref(null);
function mouseenterHandler(filterKeyword) {
  // console.log(filterKeyword)
  highlightedKeyword.value = filterKeyword;
}
function mouseleaveHandler() {
  // console.log(filterKeyword)
  highlightedKeyword.value = null;
}

// 검색창 block 요소 방향키 하이라이트
const highlightedFilterKeyword = ref(null);
const highlightedFilterKeywordIndex = ref(-1);
function keyboardHandler(event){
  if (event.key === 'ArrowUp') {
    event.preventDefault();
    highlightedFilterKeywordIndex.value--;
    if (highlightedFilterKeywordIndex.value < 0) {
      highlightedFilterKeywordIndex.value = filterKeywords.value.length - 1;
    }
    highlightedFilterKeyword.value = filterKeywords.value[highlightedFilterKeywordIndex.value]
    searchKeyword.value.keyword = highlightedFilterKeyword.value
    // event.stopPropagation()
    // changeKeyword(event)
    // event.preventDefault();
  } else if (event.key === 'ArrowDown') {
    event.preventDefault();
    // 아래쪽 화살표 키를 눌렀을 때 수행할 동작
    highlightedFilterKeywordIndex.value++;
    // 배열의 길이를 초과하는지 확인하고, 초과하는 경우 처음 요소로 돌아감.
    if (highlightedFilterKeywordIndex.value >= filterKeywords.value.length) {
      highlightedFilterKeywordIndex.value = 0;
    }
    // console.log(filterKeywords.value[highlightedFilterKeywordIndex.value]);
    highlightedFilterKeyword.value = filterKeywords.value[highlightedFilterKeywordIndex.value]
    searchKeyword.value.keyword = highlightedFilterKeyword.value
    // event.stopPropagation()
  } else if (event.key === 'ArrowLeft') {
    // 왼쪽 화살표 키를 눌렀을 때 수행할 동작
  } else if (event.key === 'ArrowRight') {
    // 오른쪽 화살표 키를 눌렀을 때 수행할 동작
  }
}








// axios Post
const responsePostData = ref(null); // responseData를 ref()로 래핑
const searchPostHistory = ref(null);
onMounted(() => {
  getPostData(); // 페이지가 실행될 때 getData() 메소드 실행
  getSearchPostHistory();
  getWikiData();
  getSearchWikiHistory();
  if(searchKeyword.value.option == ''){searchKeyword.value.option = 'Post'};
});

async function getPostData() { // Post 데이터 가져오기
  try {
    const userId = await getUserId()
    const jwtToken = $cookies.get("jwtToken")
    const response = await axios.get(`http://${postAddress}/api/post/search/all/${userId}`, {
      headers: {
        'Authorization': `Bearer ${jwtToken}`
      }
    });
    // responseData.value = response.data;
    // 특수문자 제거 후 출력 
    responsePostData.value = response.data.map(item => item.replace(/[^\wㄱ-ㅎㅏ-ㅣ가-힣\s]/g, ''));
  
  } catch (error) {
    console.error(error);
  }
}

// axios 검색 기록 불러오기
async function getSearchPostHistory() {
  try {
    const userId = await getUserId()
    const jwtToken = $cookies.get("jwtToken")
    const responseSearchPostHistory = await axios.get(`http://${postAddress}/api/post/searchlog/read/${userId}`, {
      headers: {
        'Authorization': `Bearer ${jwtToken}`
      }
    });
    searchPostHistory.value = responseSearchPostHistory.data.map(item => item.postSearchLogContent);

  } catch (error) {
    console.error(error);
  }
}

// axios 검색 기록 로그 보내기
async function postSearchPostHistory() {
  try {
    const userId = await getUserId()
    // 정규 표현식을 사용하여 특수 문자가 있는지 확인
    const cleanedKeyword = searchKeyword.value.keyword.replace(/[^\wㄱ-ㅎㅏ-ㅣ가-힣\s]/g, '');

    const jwtToken = $cookies.get("jwtToken")
    if(searchKeyword.value.keyword == null || searchKeyword.value.keyword == ''){return}
    await axios.post(`http://${postAddress}/api/searchlog/save/${userId}`, {
      postSearchLogContent: cleanedKeyword
    }, {
      headers: {
        'Authorization': `Bearer ${jwtToken}`
      }
    });
    getSearchPostHistory();
  } catch (error) {
    console.error(error);
  }
}

// axios 검색 기록 삭제하기
async function deleteSearchPostHistory(filterKeyword) {
  try {
    const userId = await getUserId()
    const jwtToken = $cookies.get("jwtToken")
    if(filterKeyword == null || filterKeyword == '') { return; }
    await axios.post(`http://${postAddress}/api/searchlog/delete/${userId}`, 
      {
        postSearchLogContent: filterKeyword // filterKeyword를 직접 전달
      },
      {
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        }
      }
    );

    // 기록 삭제 후 즉각 반영하기
    await getSearchPostHistory();
    filterKeywords.value = searchPostHistory.value;

  } catch (error) {
    console.error(error);
  }
}


// axios Wiki
const responseWikiData = ref(null); // responseData를 ref()로 래핑
const searchWikiHistory = ref(null);

async function getWikiData() { // Post 데이터 가져오기
  try {
    const userId = await getUserId()
    const jwtToken = $cookies.get("jwtToken")
    const response = await axios.get(`http://${wikiAddress}/api/wiki/search/all/${userId}`, {
      headers: {
        'Authorization': `Bearer ${jwtToken}`
      }
    });
    // responseData.value = response.data;
    // 특수문자 제거 후 출력 
    responseWikiData.value = response.data.map(item => item.replace(/[^\wㄱ-ㅎㅏ-ㅣ가-힣\s]/g, ''));
    
  } catch (error) {
    console.error(error);
  }
}

// axios 검색 기록 불러오기
async function getSearchWikiHistory() {
  try {
    const userId = await getUserId()
    const jwtToken = $cookies.get("jwtToken")
    const responseSearchWikiHistory = await axios.get(`http://${wikiAddress}/api/wiki/searchlog/read/${userId}`, {
      headers: {
        'Authorization': `Bearer ${jwtToken}`
      }
    });
    searchWikiHistory.value = responseSearchWikiHistory.data.map(item => item.wikiSearchLogContent);
    
  } catch (error) {
    console.error(error);
  }
}

// axios 검색 기록 로그 보내기
async function postSearchWikiHistory() {
  try {
    const userId = await getUserId()
    // 정규 표현식을 사용하여 특수 문자가 있는지 확인
    const cleanedKeyword = searchKeyword.value.keyword.replace(/[^\wㄱ-ㅎㅏ-ㅣ가-힣\s]/g, '');
    

    const jwtToken = $cookies.get("jwtToken")
    if(searchKeyword.value.keyword == null || searchKeyword.value.keyword == ''){return}
    await axios.post(`http://${wikiAddress}/api/wiki/searchlog/save/${userId}`, {
      wikiSearchLogContent: cleanedKeyword
    }, {
      headers: {
        'Authorization': `Bearer ${jwtToken}`
      }
    });
    getSearchWikiHistory();
  } catch (error) {
    console.error(error);
  }
}

// axios 검색 기록 삭제하기
async function deleteSearchWikiHistory(filterKeyword) {
  try {
    const userId = await getUserId()
    const jwtToken = $cookies.get("jwtToken")
    if(filterKeyword == null || filterKeyword == '') { return; }
    await axios.post(`http://${wikiAddress}/api/wiki/searchlog/delete/${userId}`, 
      {
        wikiSearchLogContent: filterKeyword // filterKeyword를 직접 전달
      },
      {
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        }
      }
    );

    // 기록 삭제 후 즉각 반영하기
    await getSearchWikiHistory();
    filterKeywords.value = searchWikiHistory.value;

  } catch (error) {
    console.error(error);
  }
}






const router = useRouter();

const searchKeyword = ref({
  keyword: '',
  option: ''
})

// Option에 다른 검색 방향성
async function search(){ 
    const cleanedKeyword = searchKeyword.value.keyword.replace(/[^\wㄱ-ㅎㅏ-ㅣ가-힣\s]/g, '');    
  if(searchKeyword.value.option == 'Wiki'){
    if(cleanedKeyword.length != 0){
      router.push({
        path: `/search/${cleanedKeyword}/${searchKeyword.value.option}`
      })
    } else {
      // 검색어 없을시 option에 맞는 리스트 전체 출력
      router.push({
        path: `/search`
      })
    }
  } else{
    if(searchKeyword.value.option == ''){searchKeyword.value.option = 'Post'}
    if(cleanedKeyword.length != 0){
      router.push({
        path: `/search/${cleanedKeyword}/${searchKeyword.value.option}`
      })
    } else {
      // 검색어 없을시 option에 맞는 리스트 전체 출력
      router.push({
        path: `/search`
      })
    }
  }
}


// 검색 로그 보내기
function postSearchHistory() {
  if (searchKeyword.value.option === 'Post') {
    postSearchPostHistory()
  } else if (searchKeyword.value.option === 'Wiki') {
    postSearchWikiHistory()
  }
}

// 검색 로그 삭제하기
function deleteSearchHistory(filterKeyword) {
  if(searchKeyword.value.option === 'Post'){
    deleteSearchPostHistory(filterKeyword)
  } else if(searchKeyword.value.option === 'Wiki') {
    deleteSearchWikiHistory(filterKeyword)
  }
}

</script>

<template>

<!-- 👉 Search Trigger button  수정한 부분-->
<div class="search-group">
<form @submit.prevent="search()" @keydown.tab="KeydownTab"> 
    
    <div class="input-group">
    <img src="@\assets\images\logos\search-keyword.png"
    class="icons"/>

    <section>
        <input type="text" @input="changeKeyword" placeholder="Search"
        style="display:flex; height:20px; width:450px;" class="search-bar"
        @focus="handleFocus" @blur="handleBlur()"
        @keyup="keyHandle"
        @keyup.enter="postSearchHistory()"
        @keydown="keyboardHandler"
        v-model="searchKeyword.keyword">
        </input>

        <div class="wrapper" >
        <div class="block" v-if="setFocus">
            <ul v-for="filterKeyword in filterKeywords"
                
            @mousedown="selectKeyword(filterKeyword, $event)"
            @mouseenter="mouseenterHandler(filterKeyword)"
            @mouseleave="mouseleaveHandler()"
            :class="{ 'highlighted': highlightedKeyword === filterKeyword, 
            'highlightedFilter': highlightedFilterKeyword === filterKeyword }"
            style="position: relative;"
            >                 

            <!-- Post 이미지 -->
            <img class="searchlog-icons" 
            src="@\assets\images\logos\history.png"
            v-if="filterKeywords === searchPostHistory && searchKeyword.option === 'Post'"/>
            <img class="searchlog-icons" 
            src="@\assets\images\logos\search-keyword.png"
            v-if="filterKeywords === filteredData && searchKeyword.option === 'Post'"/> 
            <img class="searchlog-icons" 
            src="@\assets\images\logos\question-mark-purple.png"
            v-if="filterKeywords != searchPostHistory && filterKeywords != filteredData && searchKeyword.option === 'Post'"/> 

            <!-- Wiki 이미지 -->
            <img class="searchlog-icons" 
            src="@\assets\images\logos\history.png"
            v-if="filterKeywords === searchWikiHistory && searchKeyword.option === 'Wiki'"/>
            <img class="searchlog-icons" 
            src="@\assets\images\logos\wiki.png"
            v-if="filterKeywords === filteredData && searchKeyword.option === 'Wiki'"/> 
            <img class="searchlog-icons" 
            src="@\assets\images\logos\empty-wiki.png"
            v-if="filterKeywords != searchWikiHistory && filterKeywords != filteredData && searchKeyword.option === 'Wiki'"/> 



            <ul class="search-keyword">{{ filterKeyword }}</ul>
            <v-btn icon="$vuetify" variant="text" class="search-delete"
            v-if="highlightedKeyword === filterKeyword"
            @mousedown="deleteSearchHistory(filterKeyword)">
                삭제
            </v-btn>
            </ul>
        </div>
        </div>
    </section>

    <select class="option-key" aria-label="Default select example" v-model="searchKeyword.option">
        <option style="display: none;" disabled value="" class="list">Post</option>
        <option value="Post" class="list">Post</option>
        <option value="Wiki" class="list">Wiki</option>
    </select>

    </div>
</form>
</div>
<!-- 👉 Search Trigger button end -->

</template>


<style lang="scss" scoped>
.search-group {
  position: relative;
  width: 100%;
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: -50px;

  .input-group {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;

    .search-bar {
    width: 100%;
    padding: 13px;
    padding-left: 45px;
    padding-right: 60px;
    border-radius: 30px;
    border: 1px solid #a738ed;
    outline: none;
    font-size: 16px;
    display: flex;
    justify-content: center;
    }

    .search-bar {
    width: 100%;
    padding: 13px;
    padding-left: 45px;
    padding-right: 60px;
    border-radius: 30px;
    border: 1px solid #a738ed;
    outline: none;
    font-size: 16px;
    display: flex;
    justify-content: center;
    }


    .wrapper {
      position: relative;
    
      .block {
      position: absolute;
      // width: 100%;
      // height: 30px;
      width: 100%;
      height: auto;
      max-width: 100%; 
      background: white;
      box-shadow: 0px 0.25rem 0.5rem;
      border-radius: 0.5rem;
      font-size: 1.02em;
      // display: flex;

        .search-keyword {
          margin-left: 46px;
        }

        .searchlog-icons {
          position: absolute;
          left: -5px;
          top: -7px;
          width: 12%;
          display: flex;
          padding: 12px 20px;
          pointer-events: none;
        }

        .highlighted {
          background-color: rgb(228, 213, 236);
        }

        .highlightedFilter{
          background-color: rgb(228, 213, 236);
        }

        .search-delete{
          position: absolute; /* 절대 위치 설정 */
          left: 420px; /* 원하는 만큼 왼쪽으로 이동 */
          top: -2px;
          font-size: 0.82em;
          width: 20px;
          height: 28px;
        }

      }

    }


    .icons {
      position: absolute;
      left: -4px;
      top: 1;
      width: 12%;
      display: flex;
      padding: 12px 20px;
      pointer-events: none;
    }

    .option-key {
      position: absolute;
      // right: -1px;
      left: 390px;
      width: 58px;
      outline: none;
      // border: thin solid rgba(var(--v-border-color), var(--v-border-opacity)) ;
      border-radius: 6px ;
      block-size: 1.5625rem;
      line-height: 1.3125rem;
      padding-block: 0.125rem;
      padding-inline: 0.25rem;
      display: inline-block;
      text-align: center;
      // text-align: right;
    }

  }

}
</style>
