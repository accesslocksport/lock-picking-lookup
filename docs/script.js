const search = (function () { // eslint-disable-line no-unused-vars
  let _dataset = null
  let _searchTarget = null

  const loadData = async function () {
    const response = await fetch('./data/dataset.json')
    return response.json()
  }

  const normaliseQuery = function (query) {
    return query.split(' ').map(part => {
      return part.toLowerCase().replace(/^[^\w-]+/i, '').replace(/[^\w]+$/i, '')
    }).filter(part => {
      return part.length > 1
    }).join(' ')
  }

  const normaliseTitle = function (query) {
    return query.split(' ').map(part => {
      return part.toLowerCase().replace(/[^\w]+$/i, '').replace(/^[^\w]+/i, '')
    }).filter(part => {
      return part.length > 1
    }).join(' ')
  }

  const search = function (query) {
    query = normaliseQuery(query)
    const queryTokens = query.split(' ').filter(token => !token.startsWith('-'))
    const negativeTokens = query
      .split(' ')
      .filter(token => token.startsWith('-') && token.length > 2)
      .map(token => token.substring(1))

    if (query.length < 3) {
      _searchTarget.innerHTML = ''
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
      return !negativeTokens.some(token => value.search.includes(token))
    }).filter(([key, value]) => {
      return scores[key] > 0
    }).map(([key, value]) => {
      value.score = scores[key]
      return [key, value]
    }).sort((entry1, entry2) => entry1[1].score - entry2[1].score).reverse()

    if (results.length === 0) {
      _searchTarget.innerHTML = 'Somehow you\'re searching for a lock LPL hasn\'t picked? Try something like "Master Combination" or "1100" or "Kryptonite".'
      return
    }

    _searchTarget.innerHTML = ''
    results.slice(0, 100).forEach(([number, result]) => {
      _searchTarget.appendChild(render(result))
    })
  }

  const render = function (result) {
    const link = document.createElement('a')
    link.href = result.url
    link.innerText = result.shortTitle

    const entry = document.createElement('li')
    entry.classList.add(result.prefix)
    entry.appendChild(link)
    return entry
  }

  const init = function (searchInputSelector, resultsListSelector) {
    _searchTarget = document.querySelector(resultsListSelector)

    loadData().then((data) => {
      _dataset = Object.fromEntries(Object.entries(data.dataset).map(([key, value]) => {
        value.search = normaliseTitle(value.shortTitle)
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
