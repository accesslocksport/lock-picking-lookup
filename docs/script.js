async function loadData () {
  const response = await fetch('./data/dataset.json')
  return response.json()
}

loadData().then((data) => {
  console.log(data.dataset)
})
