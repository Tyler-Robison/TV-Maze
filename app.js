async function searchShows(query) {

    const response = await axios.get(`http://api.tvmaze.com/search/shows?q=${query}`)
    const shows = []
    for (let i = 0; i < response.data.length; i++) {
        const showObj = {}
        showObj.id = response.data[i].show.id
        showObj.name = response.data[i].show.name
        showObj.summary = response.data[i].show.summary

        response.data[i].show.image ? showObj.image = response.data[i].show.image.medium :
            showObj.image = 'http://tinyurl.com/missing-tv';

        shows.push(showObj)
    }
    return shows
    // return [{ id, name, summary, image }{x}{x}]
    //4 variables extracted from response object, returned as an array for use in populateShows()
}

function populateShows(shows) {
    //iterates through shows to build item div. shows is the output of searchShows()
    // data-show-id is used to create showID variable
    // class = episodeButton used as selector in event-listener

    const $showsList = $("#shows-list");
    $showsList.empty();
    for (let show of shows) {
        const $item = $(
            `<div class="col-md-6 col-lg-3 Show" data-show-id="${show.id}">
               <div class="card" data-show-id="${show.id}">
                 <div class="card-body">
                   <h5 class="card-title">${show.name}</h5>
                   <p class="card-text">${show.summary}</p>
                   <img class="card-img-top" src=${show.image}>
                   <button class="episodeButton">Get Episodes</button>
                 </div>
               </div>
             </div>
            `);
        $showsList.append($item);
    }
}

/** Handle search form submission:
 *    - hide episodes area
 *    - get list of matching shows and show in shows list
 */

$("#search-form").on("submit", async function handleSearch(evt) {
    evt.preventDefault();

    const query = $("#search-query").val();
    if (!query) return;

    $("#episodes-area").hide();

    const shows = await searchShows(query);

    populateShows(shows);
});

//select evt.target then traverses up the DOM looking for closest element with class .Show 
// then getAttribute (not actually getAttribute, but close) 'show-id'
//listen for click on any element that has .episodeButton class
$('#shows-list').on('click', '.episodeButton', async function(e){
    e.preventDefault();
    const showId = $(e.target).closest(".Show").data("show-id");
    const episodes = await getEpisodes(showId)
    populateEpisodes(episodes)
    
})

//searches for all episodes of TV show based on ID
//creates array of objects with each object containing episode id/name/season/number
async function getEpisodes(id) {
    const response = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`)
    const episodes = []
    for (let i = 0; i < response.data.length; i++){
        const episodeObj = {}
        episodeObj.id = response.data[i].id
        episodeObj.name = response.data[i].name
        episodeObj.season = response.data[i].season
        episodeObj.number = response.data[i].number
        episodes.push(episodeObj)
    }
    return episodes
}

//accepts array return by get Episode as argument, appends the data to LI's
function populateEpisodes(episodes) {
    document.querySelector('#episodes-area').style.display = '';
    document.querySelector('#episodes-list').innerHTML = ''

    for (let episode of episodes) {
        const newLi = document.createElement('li');
        newLi.innerText = `Episode ID: ${episode.id}, Episode Name: ${episode.name}, 
       Season: ${episode.season}, Number: ${episode.number}`
        document.querySelector('#episodes-list').append(newLi)
    }
}