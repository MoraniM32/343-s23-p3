let sortValue = 1;

function setSort(value) {
  switch (value) {
    case 1:
      sortValue = 1;
      console.log("Setting Sorting method to Unsorted");
      break;
    case 2:
      sortValue = 2;
      console.log("Setting Sorting method to Alphabetical");
      break;
    case 3:
      sortValue = 3;
      console.log("Setting Sorting method to Reverse Alphabetical");
      break;
    default:
      break;
  }
}

// function sortJson(items) {
//   let toSort = items;
//   switch (sortValue) {
//     case 1:
//       break;

//     case 2:
//       toSort.sort(function (a, b) {
//         if (a.innerText < b.innerText) {
//           return -1;
//         }
//         if (a.innerText > b.innerText) {
//           return 1;
//         }
//         return 0;
//       });
//       break;

//     case 3:
//       toSort.sort(function (a, b) {
//         if (a.innerText < b.innerText) {
//           return 1;
//         }
//         if (a.innerText > b.innerText) {
//           return -1;
//         }
//         return 0;
//       });
//       break;
//     default:
//       break;
//   }
//   return toSort;
// }

const searchForm = document.getElementById("top-search");
searchForm.onsubmit = (ev) => {
  console.log("submitted top-search with", ev);
  ev.preventDefault();
  clearRhymes();
  clearMovies();
  // https://stackoverflow.com/a/26892365/1449799
  const formData = new FormData(ev.target);
  const queryText = formData.get("query");
  console.log("queryText", queryText);

  const rhymeResultsPromise = getRhymes(queryText);
  rhymeResultsPromise.then((rhymeResults) => {    // Sorting not working.
    // const sortedRhymeResults = sortJson(rhymeResults);
    // console.log(sortedRhymeResults);
    const rhymeListItemsArray = rhymeResults.map(rhymObj2DOMObj);
    console.log("rhymeListItemsArray", rhymeListItemsArray);
    const rhymeResultsUL = document.getElementById("rhyme-results");
    rhymeListItemsArray.forEach((rhymeLi) => {
      rhymeResultsUL.appendChild(rhymeLi);
    });
  });
};

// given a word (string), search for rhymes
// https://rhymebrain.com/api.html#rhyme
//  https://rhymebrain.com/talk?function=getRhymes&word=hello

const getRhymes = (word) => {
  console.log("attempting to get rhymes for", word);
  return fetch(
    `https://rhymebrain.com/talk?function=getRhymes&word=${word}&maxResults=50`
  ).then((resp) => resp.json());
};

const rhymObj2DOMObj = (rhymeObj) => {
  //this should be an array where each element has a structure like
  //
  // "word": "no",
  // "frequency": 28,
  // "score": "300",
  // "flags": "bc",
  // "syllables": "1"
  const rhymeListItem = document.createElement("li");
  const rhymeButton = document.createElement("button");
  rhymeButton.classList.add('btn')
  rhymeButton.classList.add('btn-info')
  rhymeButton.textContent = rhymeObj.word;
  rhymeButton.onclick = searchForMovie;
  rhymeListItem.appendChild(rhymeButton);
  return rhymeListItem;
};

function clearRhymes() {
  const rhyme_list = document.getElementById("rhyme-results");
  while (rhyme_list.firstChild) {
    rhyme_list.firstChild.remove();
  }
}

function clearMovies() {
  const book_list = document.getElementById("movie-results");
  while (book_list.firstChild) {
    book_list.firstChild.remove();
  }
}

const searchForMovie = async (ev) => {
  clearMovies();
  const word = ev.target.textContent;
  console.log("search for", word);
  const url = `https://watchmode.p.rapidapi.com/autocomplete-search/?search_value=${word}&search_type=3`;
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': 'a57252c16bmshde9bdf2306d882ep1c79a5jsn128381ab915b',
      'X-RapidAPI-Host': 'watchmode.p.rapidapi.com'
    }
  }

  try {
    const response = await fetch(url, options);
    const movieResults = await response.text();
    let movieResultsObj = JSON.parse(movieResults);
    console.log("movieListItemsArray", movieResultsObj.results);

    const movieCardsArray = movieResultsObj.results.map(movieObj2DOMObj)
    const movieResultsElem = document.getElementById("movie-results");
    movieCardsArray.forEach(book => movieResultsElem.appendChild(book))
  } catch (error) {
    console.error(error);
  }
};

// Format sample.
/* {name:"El Camino: A Breaking Bad Movie"
  relevance:169.83
  type:"movie"
  id:1586594
  year:"2019"
  result_type:"title"
  tmdb_id:559969
  tmdb_type:"movie"
  image_url:"https://cdn.watchmode.com/posters/01586594_poster_w185.jpg"},
  */

const movieObj2DOMObj = (movieObj) => {
  // make a dom element
  // add movieObj.title to the element
  // return element

  const movieCardDiv = document.createElement("div");
  movieCardDiv.classList.add("card");

  const movieCardBody = document.createElement("div");
  movieCardBody.classList.add("card-body");

  const titleElem = document.createElement("h5");
  titleElem.textContent = movieObj.name;
  movieCardBody.appendChild(titleElem);

  const cardText = document.createElement("p");
  cardText.textContent = `year: ${movieObj.year}`;
  movieCardBody.appendChild(cardText);

  if (movieObj.image_url == null) {
    const movieCardImg = document.createElement("p");
    movieCardImg.textContent = `No art avaliable of: ${movieObj.name}`;
    movieCardBody.appendChild(movieCardImg);
  } else {
    const movieCardImg = document.createElement("img");
    movieCardImg.classList.add("card-img-top");
    movieCardImg.src = movieObj.image_url;
    movieCardImg.alt = `Cover art of: ${movieObj.name}`;
    movieCardBody.appendChild(movieCardImg);
  }

  // Generates the imdb link on-click, helps limit API calls to demand.
  // Error: Does not display on Google Chrome, but works fine Edge, Firefox, Firefox for android .
  const movieTextLink = document.createElement("a");
  movieTextLink.href = '#' // https://www.imdb.com/${result_Type}/${imdb_id}/
  movieTextLink.onclick = async function (ev) {
    ev.preventDefault();
    const url = `https://watchmode.p.rapidapi.com/search/?search_field=name&search_value=${movieObj.name}`;
    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': 'a57252c16bmshde9bdf2306d882ep1c79a5jsn128381ab915b',
        'X-RapidAPI-Host': 'watchmode.p.rapidapi.com'
      }
    };

    // Should not fail since the title was already found earlier in the same database.
    try {
      const response = await fetch(url, options);
      const result = await response.text();
      const jsonResult = JSON.parse(result);
      console.log(jsonResult.title_results[0]);
      let found = jsonResult.title_results[0];
      window.open(`https://www.imdb.com/${found.resultType}/${found.imdb_id}/`, "_blank");
    } catch (error) {
      console.error(error);
    }
  }
  movieTextLink.classList.add("btn");
  movieTextLink.classList.add("btn-primary");
  movieTextLink.textContent = "Open IMDb page";

  movieCardBody.appendChild(movieTextLink);
  movieCardDiv.appendChild(movieCardBody)
  return movieCardDiv

};