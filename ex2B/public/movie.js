document.addEventListener('DOMContentLoaded', () => {
  const pathMatch = window.location.pathname.match(/\/movie=(.+)/);
  const movieCode = pathMatch ? pathMatch[1] : null;
  if (!movieCode) return;

  fetch(`/movie?movie=${movieCode}`)
    .then(res => res.json())
    .then(data => {
      document.getElementById('title').textContent = data.filmTitle;
      setPoster(movieCode);
      setScore(data.filmScore);
      populateDetails(data.filmDetails);
      populateReviews(data.reviews);
    })
    .catch(err => {
      document.body.innerHTML = `<h2>error: ${err.message}</h2>`;
    });
});

function setPoster(movieCode) {
  const poster = document.getElementById('poster');
  poster.src = `/${movieCode}/poster.jpg`;
  poster.onerror = () => {
    poster.onerror = null;
    poster.src = `/${movieCode}/poster.png`;
  };
} // chatgpt helped with this because last time we did trial and error for way too long

function setScore(filmScore) {
  const scoreImg = document.getElementById('scoreImage');
  const scoreText = document.getElementById('scoreText');

  if (filmScore > 60) {
    scoreImg.src = "freshbig.png";
    scoreImg.alt = "Fresh";
  } else {
    scoreImg.src = "rottenbig.png";
    scoreImg.alt = "Rotten";
  }

  scoreText.innerHTML = `<strong>${filmScore}%</strong>`;
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
        details[key].split(',').forEach(linkStr => { // last time we had trouble with this so we asked chatgpt for help also
          const parts = linkStr.split(':');
          const label = parts[0]?.trim() || 'Link';
          const url = 'https:' + parts[2]?.trim();
          const li = document.createElement('li');
          li.innerHTML = `<a href="${url}" target="_blank">${label}</a>`;
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

  halves.forEach((half, i) => {
    half.forEach(review => {
      const wrapper = document.createElement('div');

      const revbox = document.createElement('div');
      revbox.className = 'revbox';
      revbox.innerHTML = `
        <img src="fresh.gif" alt="Fresh" />
        <q>${review.ReviewText}</q>
      `;
      wrapper.appendChild(revbox);

      const critic = document.createElement('p');
      critic.innerHTML = `
        <img src="critic.gif" alt="Critic" /><br>
        <strong>${review.ReviewerName}</strong><br>
        ${review.Affiliation}
      `;
      wrapper.appendChild(critic);

      targets[i].appendChild(wrapper);
    });
  });

  document.getElementById('reviewCount').textContent = `reviews: ${reviews.length}`;
}
