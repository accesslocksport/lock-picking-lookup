const search = (function () { // eslint-disable-line no-unused-vars
  let _dataset = null
  let _searchTarget = null

  const loadData = async function () {
    const response = await fetch('./data/dataset.json')
    return response.json()
  }

  const normalise = function (query) {
    return query.split(' ').map(part => {
      return part.toLowerCase().replace(/[^\w]+$/i, '').replace(/^[^\w]+/i, '')
    }).filter(part => {
      return part.length > 1
    }).join(' ')
  }

  const search = function (query) {
    query = normalise(query)
    const queryTokens = query.split(' ')

    if (query.length < 3) {
      _searchTarget.innerText = 'Enter more'
      return
    }

    const scores = Object.fromEntries(Object.entries(_dataset).map(([key, value]) => [key, 0]))
    const keys = Object.keys(scores)

    // Simple overlapping search.
    keys.forEach(key => {
      if (_dataset[key].search.includes(query)) {
        scores[key] += 1
      }
    })

    // Percentage of full token overlap
    keys.forEach(key => {
      queryTokens.forEach(queryToken => {
        if (_dataset[key].searchTokens.includes(queryToken)) {
          scores[key] += 1
        }
      })
    })

    const results = Object.entries(_dataset).filter(([key, value]) => {
      return scores[key] > 0
    })

    _searchTarget.innerText = JSON.stringify(results)
  }

  const init = function (searchInputSelector, resultsListSelector) {
    _searchTarget = document.querySelector(resultsListSelector)

    loadData().then((data) => {
      _dataset = Object.fromEntries(Object.entries(data.dataset).map(([key, value]) => {
        value.search = normalise(value.shortTitle)
        value.searchTokens = value.search.split(' ')
        return [key, value]
      }))
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
