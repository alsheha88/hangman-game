
async function fetchWords() {
    const res = await fetch('./data.json')
    const data = await res.json()
    console.log(data)
    return data
}
fetchWords()

