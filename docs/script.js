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

    // Full token existence.
    keys.forEach(key => {
      queryTokens.forEach(queryToken => {
        if (_dataset[key].searchTokens.includes(queryToken)) {
          scores[key] += 1
        }
      })
    })

    // Partial token existence.
    keys.forEach(key => {
      queryTokens.forEach(queryToken => {
        _dataset[key].searchTokens.forEach(searchToken => {
          if (searchToken.includes(queryToken)) {
            scores[key] += 1
          }
        })
      })
    })

    const results = Object.entries(_dataset).filter(([key, value]) => {
      return scores[key] > 0
    }).map(([key, value]) => {
      value.score = scores[key]
      return [key, value]
    }).sort((entry1, entry2) => entry1[1].score - entry2[1].score).reverse()

    const display = results.map(([number, result]) => {
      return JSON.stringify([result.score, result.fullTitle]) + '<br />'
    })

    _searchTarget.innerHTML = JSON.stringify(display)
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
