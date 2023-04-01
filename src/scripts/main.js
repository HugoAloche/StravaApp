import villes from './villes.js';
window.addEventListener('load', initApp);

//Informations du courreur
var athlete = {
    firstname: '',
    lastname: '',
    profile_medium: '',
    state: '',
    city: '',
    distanceTotale: 0
}

/**
 * Init the app
 */
function initApp() {
  const villesUl = document.getElementById('villes');
  const nom = document.getElementById('athlete-name');
  const city = document.getElementById('athlete-city');
  const distance = document.getElementById('athlete-distance');
  const profile = document.getElementById('athlete-profile');
  const athleteProgress = document.getElementById('athlete-progress');
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  if (urlParams.get('code')) {
    connexionApp(urlParams.get('code'), nom, city, distance, profile, athleteProgress, villesUl);
  }
  villes.villes.forEach((ville) => {
    const li = document.createElement('li');
    li.innerHTML = `${ville.nom} - ${ville.pays} - ${ville.supperficie} km²`;
    villesUl.appendChild(li);
  })
}

/**
 * Get the token from Strava
 * @param {string} code
 */
function connexionApp(code, nom, city, distance, profile, athleteProgress, villesUl) {
    fetch('https://www.strava.com/oauth/token', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            code,
            client_id: '104903',
            client_secret: 'd18a391eca021190475ff6ab018c1686ed0514b3',
            grant_type: 'authorization_code'
        })
    })
    .then(response => {
        response.json().then((data) => {
          console.log(data);
          athlete.firstname = data.athlete.firstname
          athlete.lastname = data.athlete.lastname
          athlete.profile_medium = data.athlete.profile_medium
          athlete.state = data.athlete.state
          athlete.city = data.athlete.city

          getInformation(data.athlete.id, data.access_token, nom, city, distance, profile, athleteProgress, villesUl);
        })
    })
    .catch(error => {
        console.log(error)
    })
}

/**
 * Get information about the user
 * @param {number} id
 * @param {string} token
 */
function getInformation(id, token, nom, city, distance, profile, athleteProgress, villesUl) {
  fetch(`https://www.strava.com/api/v3/athletes/${id}/stats?access_token=${token}`, {
    method: 'get',
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    }
  })
  .then(response => {
      response.json().then((data) => {
          console.log(data)
          athlete.distanceTotale = data.all_run_totals.distance / 1000
      }).then(() => {
        setInformation(nom, city, distance, profile, athleteProgress, villesUl)
        document.querySelector('.btn').style.display = 'none';
      })
  })
  .catch(error => {
      console.log(error)
  })
}

/**
 * Set the information in the HTML
 * @param {HTMLElement} name
 * @param {HTMLElement} city
 * @param {HTMLElement} distance
 * @param {HTMLElement} profile
 */
function setInformation(name, city, distance, profile, athleteProgress, villesUl) {
    name.innerHTML = `@${athlete.firstname} ${athlete.lastname}`
    city.innerHTML = `Ville : ${athlete.city}, ${athlete.state}`
    distance.innerHTML = `Distance totale parcouru : ${athlete.distanceTotale} km`
    profile.src = athlete.profile_medium
    for (let i = 0; i < athlete.distanceTotale; i++) {
      athleteProgress.value = i;
    }
    let find = false;
    villes.villes.forEach((ville, index) => {
      athlete.distanceTotale > ville.supperficie ? villesUl.children[index].classList.add('done') : null
      if (athlete.distanceTotale < ville.supperficie && !find) {
        find = true
        athleteProgress.max = ville.supperficie
        athleteProgress.min = index != 0 ? ville.supperficie[index -1] : ville.supperficie
        document.getElementById('villeDepart').innerHTML = index != 0 ? villes.villes[index -1].nom : villes.villes[index].nom
        document.getElementById('villeArrivee').innerHTML = ville.nom
        document.getElementById('valueDepart').innerHTML = index != 0 ? `${villes.villes[index -1].supperficie} km` : `${villes.villes[index].supperficie} km`
        document.getElementById('valueArrivee').innerHTML = `${athleteProgress.max} km`
      }
    });
}