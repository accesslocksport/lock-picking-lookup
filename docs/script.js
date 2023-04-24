const search = (function () { // eslint-disable-line no-unused-vars
  let _dataset = null
  let _searchTarget = null

  const loadData = async function () {
    const response = await fetch('./data/dataset.json')
    return response.json()
  }

  const search = function (query) {
    let results = []
    if (query.length < 3) {
      _searchTarget.innerText = results
      return
    }

    results = Object.fromEntries(Object.entries(_dataset).filter(([k, v]) => v.shortTitle.toLowerCase().includes(query.toLowerCase())))

    _searchTarget.innerText = JSON.stringify(results)
  }

  const init = function (searchInputSelector, resultsListSelector) {
    _searchTarget = document.querySelector(resultsListSelector)

    loadData().then((data) => {
      _dataset = data.dataset
    })

    document
      .querySelector(searchInputSelector)
      .addEventListener('keyup', (event) => {
        search(event.target.value)
      })
  }

  return {
    init
  }
})()
