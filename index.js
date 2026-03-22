const state = {
	library: [],
	wordSelected: [],
	wrongSelectionCount: 0,
    correctSelectionCount: 0,
	letterSelected: "",
	categorySelected: undefined,
	progress: 0,
};

async function fetchWords() {
	const res = await fetch("./data.json");
	const data = await res.json();
	return data;
}
function resetDOM(){
	document.getElementById("mainMenu").classList.remove("hide");
	document.getElementById("categoriesSection").classList.remove("show");
	document.getElementById("howToPlay").classList.remove("show");
    document.querySelector('#inGameSection').classList.remove('show');
    document.querySelector('#gamePause').classList.remove('show');
    document.querySelector('#gameWon').classList.remove('show');
    document.querySelector('#gameLost').classList.remove('show');
}
function resetState(){
    state.wordSelected = [];
	state.wrongSelectionCount = 0;
    state.correctSelectionCount = 0;
	state.letterSelected = "";
	state.categorySelected = undefined;
	state.progress = 0;
}
function selectCategory(e){
    const btn = e.target.closest('[data-category]');
    if (!btn) return;
    state.categorySelected = btn.dataset.category;
    getWord(state.categorySelected)
    document.querySelector('#categoriesSection').classList.remove('show');
    document.querySelector('#inGameSection').classList.add('show');
    document.querySelector('#gameCategory').innerHTML = state.categorySelected;
}
function getWord(category) {
  const available = state.library.categories[category].filter(item => !item.selected);

  if (available.length === 0) {
    // No words left: show a friendly message and stop the selection flow
    document.querySelector('.word-box').textContent = 'No more words in this category.';
    // Optionally disable the play button or offer "reset" UI
    return;
  }

  const idx = Math.floor(Math.random() * available.length); // safe because available.length > 0
  const chosen = available[idx];

  // Mark as selected in the original category array
  const original = state.library.categories[category].find(item => item.name === chosen.name);
  if (original) original.selected = true;

  state.wordSelected = chosen.name.toUpperCase().split(' ');
  document.querySelector('.word-box').innerHTML = renderWord(state.wordSelected);
}
function createWordRows(wordArr){
    const rows = [];
    let currentRow = [];
    let currentRowLength = 0;
    let rowLimit = 8;
    
    wordArr.forEach((word) => {
        if (word.length > rowLimit) {
            if (currentRow.length > 0) rows.push([...currentRow])
            rows.push([word])
            currentRow = []
            currentRowLength = 0
            return
        }
        if (currentRowLength + word.length <= rowLimit){
            currentRow.push(word);
            currentRowLength += word.length + 1;
        } else {
            rows.push([...currentRow]);
            currentRow = [word]
            currentRowLength = word.length;
        }
    })
    rows.push(currentRow)

    return rows
}
function checkWord(e){
    const btn = e.target.closest('[data-letter]');
    const lettersArray = state.wordSelected.join('').split('')
    const wrongCount = 8;
    document.querySelectorAll('[data-word]').forEach((value) => value.dataset.word)
    if (!btn) return;
    if (btn) btn.disabled = true;
    state.letterSelected = btn.dataset.letter;
    if (lettersArray.includes(state.letterSelected)){
        document.querySelectorAll(`[data-word = "${state.letterSelected}"]`).forEach((letter) =>{
            letter.classList.add('correct')
            letter.querySelector('span').classList.remove('hidden')
            state.correctSelectionCount += 1;
        })
    } else {
        state.wrongSelectionCount += 1;
        state.progress = 100 - ((state.wrongSelectionCount / wrongCount) * 100).toFixed(2)
        document.querySelector('.progress-bar').style.width = `${state.progress}%`;
    }
    gameEnd(state.correctSelectionCount, state.wrongSelectionCount, wrongCount)
}
function gameEnd(correctSelectionCount, wrongSelectionCount, wrongCount){
    const letterCount = state.wordSelected.join('').split('').length;
    if (correctSelectionCount === letterCount){
        document.querySelector('#gameWon').classList.add('show');
    }
    if (wrongSelectionCount === wrongCount){
        document.querySelector('#gameLost').classList.add('show');
    }
    // console.log(state.library)

}
function quitGame(e){
    const btn = e.target.closest('[data-action="quitGame"]');
    if (!btn) return;
    resetState();
    resetDOM();
}
function pickNewCategory(e){
    const btn = e.target.closest('[data-action="newCategory"]');
    if (!btn) return;
    resetState();
	document.getElementById("categoriesSection").classList.add("show");
    document.querySelector('#inGameSection').classList.remove('show');
    document.querySelector('.progress-bar').style.width = '100%'
    document.querySelectorAll('[data-letter]').forEach((btn) => btn.disabled = false);
    e.target.parentElement.parentElement.classList.remove('show')
}
function renderPauseMenu(e){
    const btn = e.target.closest('[data-menu]');
    if (!btn) return;
    document.querySelector('#gamePause').classList.add('show')
}
function renderGameGuide() {
	document.getElementById("mainMenu").classList.add("hide");
	document.getElementById("howToPlay").classList.add("show");
}
function renderHomePage(e) {
    const section = e.currentTarget.closest('[data-section]');
    if (!section) return;
    if (section) {
        section.classList.remove('show')
        document.getElementById('mainMenu').classList.remove('hide')
    }
}
function renderCategoriesSection() {
	document.getElementById("mainMenu").classList.add("hide");
	document.getElementById("categoriesSection").classList.add("show");
}
function continuePlaying(e){
    const btn = e.target.closest('[data-action="continue"]');
    if (!btn) return;
    document.querySelector('#gamePause').classList.remove('show');
}
function playAgain(e){
    const btn = e.target.closest('[data-action="playAgain"]');
    if (!btn) return;
    state.wordSelected = [];
    state.wrongSelectionCount = 0;
    state.correctSelectionCount = 0;
    state.letterSelected = "";
    state.progress = 0;
    document.querySelector('.progress-bar').style.width = '100%'
    document.querySelectorAll('[data-letter]').forEach((btn) => btn.disabled = false);
    getWord(state.categorySelected);
    e.target.parentElement.parentElement.classList.remove('show');
}
function renderWord(wordArr){
    return createWordRows(wordArr).map((phrase) => {
        return `<div class="word-row" style="grid-template-columns: repeat(${state.wordSelected.length}, 1fr)">
            ${phrase.map((word, index) => {
        const letters = word.split('').map((letter) => {
            return `<button class="word" data-word='${letter}' disabled="true"><span class="hidden">${letter}</span></button>`
        }).join('')
        
        const spacer = index < phrase.length - 1 
            ? `<button class="word word-spacer" disabled="true"><span></span></button>` 
            : ''
        
        return letters + spacer
    }).join('')}
            
          </div>`
    }).join('')
}
function renderSections(){
    document.getElementById("howToPlayBtn").addEventListener("click", renderGameGuide);
	document.getElementById("startGame").addEventListener("click", renderCategoriesSection);
	document.querySelectorAll('[data-action="backBtn"]').forEach(btn => btn.addEventListener("click", renderHomePage));
}
async function initHangman() {
    state.library = await fetchWords();

    resetDOM()
    document.querySelector('.categories').addEventListener('click', selectCategory);
    document.querySelector('#letterBox').addEventListener('click', checkWord);
    document.querySelector('[data-menu]').addEventListener('click', renderPauseMenu);
    document.querySelectorAll('[data-action="quitGame"]').forEach((btn) => btn.addEventListener('click', quitGame))
    document.querySelectorAll('[data-action="newCategory"]').forEach((btn) => btn.addEventListener('click', pickNewCategory))
    document.querySelector('[data-action="continue"]').addEventListener('click', continuePlaying);
    document.querySelectorAll('[data-action="playAgain"]').forEach((btn) => btn.addEventListener('click', playAgain));
    renderSections();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHangman);
} else {
  initHangman();
}
