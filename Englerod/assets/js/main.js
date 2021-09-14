const fetchURL = 'https://sldesign.dk/wp-json/wp/v2/posts?per_page=100';

function getData() {
  fetch(fetchURL)
    .then((response) => response.json())
    .then((data) => {
      drawSite(data);
      // data er det JSON objekt vi kommer til at arbejde med i dette projekt
    })
    .catch((error) => {
      console.error(error);
    });
}

getData(); // initierer funktionen 'getData'

// Koden fra linje 20 til 59 kommer fra et Github repository 'mmd API 1 JSON', som kan ses på linket.
// Høegh, D. (2021). MMD API 1 JSON. Hentet fra Github: https://github.com/SpacemanSpiffDK/mmd-API-1-JSON - set d. 18/4-2021

let pageId = getPageIdFromUrl();

function getPageIdFromUrl() {
  let pageId = 0;

  const url = window.location.href;
  console.log(url);
  if (url.indexOf('pageId') != -1) {
    const urlSplit = url.split('?');
    if (urlSplit[1].indexOf('&') == -1) {
      const parameterSplit = urlSplit[1].split('=');
      pageId = parameterSplit[1];
    } else {
      const urlParameters = urlSplit[1].split('&');
      for (let i = 0; i < urlParameters.length; i++) {
        if (urlParameters[i].substring(0, 6) == 'pageId') {
          const pageIdSplit = urlParameters[i].split('=');
          pageId = pageIdSplit[1];
          break;
        }
      }
    }
  }
  return pageId;
}

function drawSite(data) {
  if (pageId == 0) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].rootPage === true) {
        pageId = data[i].id;
        break;
      }
    }
  }
  drawPage(data);
  footer(data);
  navigation(data);
}

function footer() {
  const footerString = `
  <div class="wrapper">
    <div class="footer-left center-flex column-flex">
    <h2 class="logo">Englerod</h2>
    <div class="footer-some">
      <a href="#" target="_blank" class="icon-some underline" aria-label="Visit Englerod's YouTube"><i class="fab fa-youtube"></i></a>
      <a href="#" target="_blank" class="icon-some underline" aria-label="Visit Englerod's Facebook"><i class="fab fa-facebook-f"></i></a>
      <a href="#" target="_blank" class="icon-some underline" aria-label="Visit Englerod's Instagram"><i class="fab fa-instagram"></i></a>
      <a href="#" target="_blank" class="icon-some underline" aria-label="Visit Englerod's Pinterest"><i class="fab fa-pinterest-p"></i></a>
    </div>
    </div>
    <div class="footer-right">
      <ul>
        <li><a href="?pageId=87" class="underline">Forside</a></li>
        <li><a href="?pageId=155" class="underline">Opskriftindex</a></li>
        <li><a href="?pageId=164" class="underline">Om Englerod</a></li>
      </ul>
    </div>
  </div>
  `;
  drawHtml('footer', footerString);
}

function navigation(data) {
  let navString = '<ul>';
  data.reverse();
  for (let i = 0; i < data.length; i++) {
    if (data[i].acf.visible) {
      // visible er enten true eller false afhængig af om den post skal vises i menuen
      let activePage = '';
      if (data[i].id == pageId) {
        activePage = 'class="active"';
      }
      // link is now only "?pageId=[id]" instead of "index.html?pageId=[id]"
      // Site still reloads on click, but just using the parameter is cleaner
      navString += `
                  <li>
                      <a ${activePage} href="?pageId=${data[i].id}" class="underline">
                          ${data[i].title.rendered}
                      </a>
                  </li>
              `;
    }
  }
  navString += '</ul>';
  drawHtml('nav', navString);
}

function drawPage(data) {
  let template = '';

  drawTitle(data);

  for (let i = 0; i < data.length; i++) {
    if (pageId == data[i].id) template = data[i].acf.page_template;
  }
  console.log('Template er: ' + template);
  switch (template) {
    case '':
      templateForside(data);
      break;
    case 'forside':
      templateForside(data);
      break;
    case 'opskriftindex':
      templateOpskriftindex(data);
      break;
    case 'enkelt-opskrift':
      templateOpskrift(data, pageId);
      break;
    case 'om':
      templateOm(data);
      break;
  }
  const templateClass = `template-${template}`;
  document.querySelector('body').classList.add(templateClass);
}

function drawTitle(data) {
  for (let i = 0; i < data.length; i++) {
    if (pageId == data[i].id) {
      document.title = `Englerod | ${data[i].title.rendered}`;
    }
  }
}

function templateForside(data) {
  const findOpskrift = data.filter((opskrift) => opskrift.categories[0] == 18);
  const selfie = data.filter((selfie) => selfie.id == 164);

  const selfieImg = selfie[0].acf.image_third.sizes.large;
  const hvemEnglerod = selfie[0].excerpt.rendered;

  const randNum = Math.floor(Math.random() * findOpskrift.length * 1);
  const opskrift = findOpskrift[randNum];

  const opskriftTitle = opskrift.acf.name;
  const opskriftImg = opskrift.acf.image.sizes.large;

  const opskriftExcerpt = opskrift.excerpt.rendered;
  const opskriftTime = opskrift.acf.time;
  const opskriftTags = opskrift.acf.tag;
  const tags = opskriftTags.join(', ');

  const heroHTML = `<div id="hero">
  <img src="${opskriftImg}" alt="${opskriftTitle}" >
  <div class="hero-recipe">
    <a href="?pageId=${opskrift.id}" class="hero-recipe-text center-flex column-flex">
      <h1>${opskriftTitle}</h1>
      ${opskriftExcerpt}
      <div class="recipe-tags">
        <span class="time"> ${opskriftTime} min.</span>
        <span class="tag"> ${tags}</span>
      </div>
    </a>
  </div>
  </div>`;
  const searchHTML = `
  <section class="wrapper center-flex">
    <form action="/action_page.php" class="search center-flex">
      <input id="searchInput" type="text" placeholder="Søg efter opskrift" class="shadow-neutral-lighterx">
      <button name="search" value="Search" type="submit" class="shadow-neutral-lighterx" aria-label="Søg"><i class="fa fa-search"></i></button>
    </form>
  </section>`;
  const newsHTML = `
  <section class="recipes-horisontal wrapper">
  <div class="section-header inline-flex wide between-flex">
  <h2>Nyheder</h2>
  <a href="?pageId=155" class="cta-btn">Alle nyheder</a>
  </div>
  <div id="news"></div>
  </section>`;
  const catHTML = `
  <section class="wrapper">
  <div class="section-header inline-flex wide between-flex">
  <h2>Kategorier</h2>
  <a href="?pageId=155" class="cta-btn">Alle kategorier</a>
  </div>
  <div id="categories"></div>
  </section>`;
  const englerod = `
  <div class="wrapper">
  <section class="grid-equal-2x">
    <img src="${selfieImg}" alt="Vaganer">
    <article class="grid-equal-2x-text">
      ${hvemEnglerod}
    </article>
  </section>`;
  const forsideString = `
  ${heroHTML}
  ${searchHTML}
  ${newsHTML}
  ${catHTML}
  ${englerod}
    `;
  drawHtml('main', forsideString);
  newRecipes(data, 'news', 5);
  categories(data, 'categories');
}

function templateOpskriftindex(data) {
  // const index = varFilter(data, 18);
  // console.log(index);
  const filter = `<details id="filter" class="color-primary center-flex">
  <summary>Filter</summary>
  <div class="filter-container">
    <details>
    <summary>Sorter</summary>
    <div class="block">
      <label for="populaer">Populær</label>
      <select name='populaer' id="pop">
        <option value="DESC"> Mest </option>
        <option value="ASC"> Mindst </option>
      </select>
    </div>
    <div class="block">
      <label for="ny">Ny</label>
      <select name="age" id="age">
        <option value="DESC"> Nyeste </option>
        <option value="ASC"> Ældste </option>
      </select>
    </div>
  </details>`;
  const kategorier = `<details>
  <summary>Kategorier</summary>
    <div class="block">
      <label for="morgenmad">Morgenmad</label>
      <input type="radio" id="morgenmad" name="kategori" value="morgenmad">
    </div>
    <div class="block">
      <label for="middagsmad">Store måltider</label>
      <input type="radio" id="storeMaaltider" name="kategori" value="storeMaaltider">
    </div>
    <div class="block">
      <label for="aftensmad">Mindre retter</label>
      <input type="radio" id="mindreRetter" name="kategori" value="mindreRetter">
    </div>
    <div class="block">
      <label for="aftensmad">Tilbehør</label>
      <input type="radio" id="tilbehoer" name="kategori" value="tilbehoer">
    </div>
    <div class="block">
      <label for="aftensmad">Drikke</label>
      <input type="radio" id="drikke" name="kategori" value="drikke">
    </div>
    <div class="block">
      <label for="aftensmad">Bagværk</label>
      <input type="radio" id="bagvaerk" name="kategori" value="bagvaerk">
    </div>
    <div class="block">
      <label for="aftensmad">Dessert</label>
      <input type="radio" id="dessert" name="kategori" value="dessert">
    </div>
    <div class="block">
      <label for="aftensmad">Salat</label>
      <input type="radio" id="salat" name="kategori" value="salat">
    </div>
</details>`;
  const indexString = `
      <section class="wrapper">
      <div class="section-header inline-flex wide between-flex align-start">
      <h1>Opskriftsindex</h1>
      </div>
      ${filter}
      ${kategorier}
      <div class="slide-container ">
      <label for="myrange">Tid:</label>
      <input type="range" min="1" max="100" value="50" class="slider color-neutral-lighterx" id="tidSlider">
      </div>
    </div>

    </details>
    <section id="allRecipes" class="grid-main"></section>
    `;

  drawHtml('main', indexString);
  allRecipes(data, 'allRecipes');

  const lblAge = document.getElementById('age');
  lblAge.onchange = (event, data) => {
    event.preventDefault();
    if (age.selectedIndex == 0) {
      console.log('Selected index: ' + age.selectedIndex);
      allRecipes(data, 'allRecipes');
    }
    console.log(age.selectedIndex);
  };
}

function filterByAge() {}

function templateOpskrift(data, pageId) {
  const result = data.filter((data) => data.id == pageId);
  const opskrift = result[0];
  console.log(opskrift);
  const category = opskrift.acf.category;
  console.log(category);
  const opskriftImg = opskrift.acf.image.sizes.large;
  const imgAltTag = opskrift.acf.name;
  const opskriftTime = opskrift.acf.time;
  let opskriftTags = opskrift.acf.tag;

  let notes;
  if (opskrift.acf.notes == '') {
    notes = '';
  } else {
    notes = `
    <section class="opskrift-notes">
    ${opskrift.acf.notes}
    </section>`;
  }
  const content = `
  <div class="wrapper">
  <section class="grid-equal-2x opskrift-intro">
    <img src="${opskriftImg}" alt="${imgAltTag}">
    <article class="grid-equal-2x-text">
      <h1>${opskrift.acf.name}</h1>
    <div class="recipe-tags">
      <span class="time"> ${opskriftTime} min.</span>
      <span class="tag"> ${opskriftTags}</span>
    </div>
      ${opskrift.acf.intro}
    </article>
  </section>
  <section class="opskrift-ingredienser">
    ${opskrift.acf.ingredienser}
  </section>
  <section class="opskrift-steps">
    ${opskrift.acf.steps}
  </section>
  ${notes}
  <section>
    <div class="section-header inline-flex wide between-flex align-start">
    <h2>Relaterede opskrifter</h2>
    </div>
    <div id="relaterede">
    </div>
  </section>
  </div>
  `;
  drawHtml('main', content);
  relatedRecipes(data, opskrift, category, 'relaterede');
}

function templateOm(data) {
  const result = filterId(data, 164);
  const om = result[0];

  const omTitle = om.acf.name;
  const omTekst = om.content.rendered;
  const heroImg = om.acf.image.sizes.large;
  const imgHeroAlt = om.acf.image.alt;
  const imgSecondary = om.acf.image_secondary.sizes.large;
  const imgSecAlt = om.acf.image_secondary.alt;

  const content = `
  <div id="hero">
    <img src="${heroImg}" alt="${imgHeroAlt}">  
  </div>
  <section id="om" class="wrapper grid-equal-2x">
    <img src="${imgSecondary}" alt="${imgSecAlt}" class="hide">
  <article class="grid-equal-2x-text">
    <h1>${omTitle}</h1>
    ${omTekst}
  </article>
  </section>
  <section class="wrapper">
  <div class="section-header inline-flex wide between-flex align-start">
    <h2>Bøger</h2>
  </div>
    <div class="books" id="books">
    </div>
  </section>
  <section class="wrapper">
  <div class="section-header inline-flex wide between-flex align-start">
  <h2>Kontakt</h2>
  </div>
    <article class="wrapper">
        <h3>Spørgsmål og generelle henvendelser</h3>
        <p>Du kan sende mig en mail til johanne@englerod.dk, du er også velkommen til at kontakte mig via min Facebook- eller Instagramside: Englerod</p>
        <h3>Annoncering eller udarbejdelse af content marketing?</h3>
        <p>Jeg har udarbejdet opskrifter, taget billeder og meget mere for en lang række virksomheder og kan også hjælpe din virksomhed med skabe lækkert indhold til marketingsmateriale og/eller sociale medier. Se noget af mit arbejde her.</p>
    </article>
  </section>
  `;
  drawHtml('main', content);
  // allBooks(data);
  allBooks(data);
}
function relatedRecipes(data, opskrift, category, container) {
  let opskriftTime;
  let opskriftTags;

  for (let i = 0; i < data.length; i++) {
    if (data[i].acf.category == category) {
      opskriftTime = data[i].acf.time;
      opskriftTags = data[i].acf.tag;
      let twoTags = opskriftTags.slice(0, 2);
      let tags = twoTags.join(', ');

      const recipesString = `
    <div class="center-flex">
    <a href="?pageId=${data[i].id}" class="card-recipe shadow-neutral-lighterx">
    <img src="${data[i].acf.image.sizes.medium}" alt="${data[i].title.rendered}">
    <h5 class="card-recipe-header bold">${data[i].title.rendered}</h5>
    <div class="recipe-tags">
      <span class="time"> ${opskriftTime} min.</span>
      <span class="tag"> ${tags}</span>
    </div>
    </a>
    </div>
    `;
      document.getElementById(container).innerHTML += recipesString;
    }
  }
}

function varFilter(data, catId) {
  const result = data.filter((data) => data.categories[0] == catId);
  return result;
}
function filterId(data, pageId) {
  const result = data.filter((data) => data.id == pageId);
  return result;
}

function filterCategory(data, category) {
  const result = data.filter((data) => data.acf.category == category);
  const filteredCategory = result[0].acf.category;
  return filteredCategory;
}

function allBooks(data) {
  const books = data.filter((book) => book.categories[0] == 16);

  books.forEach((bookElement) => {
    const bookString = `
    <div class="card-book shadow-neutral-lighterx">
      <img src="${bookElement.acf.image.sizes.medium}" alt="${bookElement.acf.description}">
      <div class="card-book-text">
        <h4>${bookElement.acf.title}</h4>
        <p>${bookElement.acf.description}</p>
      </div>
      `;
    document.getElementById('books').innerHTML += bookString;
  });
}
function drawHtml(elementId, newContent) {
  document.getElementById(elementId).innerHTML = newContent;
}
console.log('DU KAN GODT! <"3 <3 <3');

function allRecipes(data, container) {
  const opskrifter = varFilter(data, 18);
  opskrifter.reverse(); // Array'et vendes, så nyeste opskrift kommer først

  opskrifter.forEach((opskrift) => {
    // console.log(opskrift.acf.category)

    const opskriftTime = opskrift.acf.time;
    let opskriftTags = opskrift.acf.tag;
    let twoTags = opskriftTags.slice(0, 2);
    // twoTags er en "shallowcopy" af det oprindelige array af tags. Dette gøres for kun at vise to på hvert recipe card og for at potentielt kunne iterere over det oprindelige array igen
    // console.log(twoTags)
    const tags = twoTags.join(', ');

    const recipesString = `
    <div class="center-flex">
    <a href="?pageId=${opskrift.id}" class="card-recipe shadow-neutral-lighterx">
    <img src="${opskrift.acf.image.sizes.medium}" alt="${opskrift.title.rendered}">
    <h5 class="card-recipe-header bold">${opskrift.title.rendered}</h5>
    <div class="recipe-tags align-end">
      <span class="time"> ${opskriftTime} min.</span>
      <span class="tag"> ${tags}</span>
    </div>
    </a>
    </div>
    `;
    document.getElementById(container).innerHTML += recipesString;
  });
}

function newRecipes(data, container, amount) {
  const opskrifter = varFilter(data, 18);

  for (let i = 0; i < amount; i++) {
    const opskriftTime = opskrifter[i].acf.time;
    let opskriftTags = opskrifter[i].acf.tag;
    let twoTags = opskriftTags.slice(0, 2);
    // twoTags er en "shallowcopy" af det oprindelige array af tags. Dette gøres for kun at vise to på hvert recipe card og for at potentielt kunne iterere over det oprindelige array igen
    // console.log(twoTags)
    const tags = twoTags.join(', ');

    const recipesString = `
    <div class="center-flex">
    <a href="?pageId=${opskrifter[i].id}" class="card-recipe shadow-neutral-lighterx">
    <img src="${opskrifter[i].acf.image.sizes.medium}" alt="${opskrifter[i].title.rendered}">
    <h5 class="card-recipe-header bold">${opskrifter[i].title.rendered}</h5>
    <div class="recipe-tags align-end">
      <span class="time"> ${opskriftTime} min.</span>
      <span class="tag"> ${tags}</span>
    </div>
    </a>
    </div>
    `;
    document.getElementById(container).innerHTML += recipesString;
  }
}

function categories(data, container) {
  const morgen = filterCategory(data, 'Morgenmad');
  const aften = filterCategory(data, 'Store måltider');
  const retter = filterCategory(data, 'Mindre retter');
  const tilbehor = filterCategory(data, 'Tilbehør');
  const drikke = filterCategory(data, 'Drikke');
  const bagvaerk = filterCategory(data, 'Bagværk');
  const dessert = filterCategory(data, 'Dessert');
  const salat = filterCategory(data, 'Salat');

  let categoriesArray = [
    morgen,
    aften,
    retter,
    tilbehor,
    drikke,
    bagvaerk,
    dessert,
    salat,
  ];

  // console.log(categoriesArray)

  categoriesArray.forEach((opskrift) => {
    const kateogriString = `
    <div class="center-flex">
    <a href="?pageId=156" class="card-recipe shadow-neutral-lighterx">
    <img src="./assets/images/kategori/${opskrift}.jpg" alt="Kategorien ${opskrift}">
    <h5 class="card-recipe-header bold">${opskrift}</h5>
    <p class="wrapper center-text">Find flere opskrifter til "${opskrift}" her.</p>
    </a>
    </div>
    `;
    document.getElementById(container).innerHTML += kateogriString;
  });
}
