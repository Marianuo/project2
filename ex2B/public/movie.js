document.addEventListener('DOMContentLoaded', () => {
  const pathMatch = window.location.pathname.match(/\/film=(.+)/);
  const filmCode = pathMatch ? pathMatch[1] : null;
  if (!filmCode) return;

  fetch(`/film?film=${filmCode}`)
    .then(res => res.json())
    .then(data => {
      document.getElementById('title').textContent = data.filmTitle;
      setPoster(filmCode);
      setScore(data.filmScore);
      populateDetails(data.filmDetails);
      populateReviews(data.reviews);
    })
    .catch(err => {
      document.getElementById('layout').style.display = 'none';
      const errorDiv = document.getElementById('error');
      errorDiv.textContent = `error: ${err.message}`;
      errorDiv.style.display = 'block';
    });
});

function setPoster(filmCode) {
  const poster = document.getElementById('poster');
  poster.src = `/${filmCode}/poster.jpg`;
  poster.onerror = () => {
    poster.onerror = null;
    poster.src = `/${filmCode}/poster.png`;
  };
}

function setScore(filmScore) {
  const scoreImg = document.getElementById('scoreImage');
  const scoreText = document.getElementById('scoreText').querySelector('strong');

  if (filmScore > 60) {
    scoreImg.src = "freshbig.png";
    scoreImg.alt = "Fresh";
  } else {
    scoreImg.src = "rottenbig.png";
    scoreImg.alt = "Rotten";
  }

  scoreText.textContent = `${filmScore}%`;
}

function populateDetails(details) {
  const container = document.getElementById('detailsList');
  container.innerHTML = '';

  const order = [
    'starring', 'director', 'rating', 'theatrical release', 'movie synopsis',
    'mpaa rating', 'release company', 'runtime', 'genre', 'box office', 'links'
  ];

  order.forEach(key => {
    if (details[key]) {
      const dt = document.createElement('dt');
      dt.textContent = key;
      container.appendChild(dt);

      const dd = document.createElement('dd');
      if (key === 'starring') {
        dd.innerHTML = details[key].join('<br>');
      } else if (key === 'links') {
        const ul = document.createElement('ul');
        details[key].split(',').forEach(linkStr => {
          const parts = linkStr.split(':');
          const label = parts[0]?.trim() || 'Link';
          const url = 'https:' + parts[2]?.trim();
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.href = url;
          a.target = "_blank";
          a.textContent = label;
          li.appendChild(a);
          ul.appendChild(li);
        });
        dd.appendChild(ul);
      } else {
        dd.textContent = details[key];
      }
      container.appendChild(dd);
    }
  });
}

function populateReviews(reviews) {
  const rev1 = document.getElementById('reviews1');
  const rev2 = document.getElementById('reviews2');
  rev1.innerHTML = '';
  rev2.innerHTML = '';

  const mid = Math.ceil(reviews.length / 2);
  const halves = [reviews.slice(0, mid), reviews.slice(mid)];
  const targets = [rev1, rev2];

  const reviewBoxTemplate = document.getElementById('reviewBoxTemplate');
  const criticTemplate = document.getElementById('criticTemplate');

  halves.forEach((half, i) => {
    half.forEach(review => {
      const wrapper = document.createElement('div');

      const revbox = reviewBoxTemplate.content.cloneNode(true).querySelector('.revbox');
      revbox.querySelector('q').textContent = review.ReviewText;
      wrapper.appendChild(revbox);

      const critic = criticTemplate.content.cloneNode(true).querySelector('.critic');
      critic.querySelector('strong').textContent = review.ReviewerName;
      critic.querySelector('.affiliation').textContent = review.Affiliation;
      wrapper.appendChild(critic);

      targets[i].appendChild(wrapper);
    });
  });

  document.getElementById('reviewCount').textContent = `reviews: ${reviews.length}`;
}