const { JSDOM } = require('jsdom');
const fs = require('fs');

(async () => {
  const html = fs.readFileSync('index.html', 'utf8');
  const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable' });

  const fetchTimes = [];
  dom.window.fetch = async () => {
    fetchTimes.push(Date.now());
    return {
      ok: true,
      json: async () => ({
        results: [{ id: 1, taxon: { id: 1, ancestor_ids: [1] }, photos: [{ url: 'http://e.com/square', attribution: 'attr' }] }]
      })
    };
  };

  await new Promise(resolve => dom.window.document.addEventListener('DOMContentLoaded', resolve));

  fetchTimes.length = 0; // clear initial API check

  await Promise.all([
    dom.window.fetchMushroomObservations(1),
    dom.window.fetchMushroomObservations(2),
    dom.window.fetchMushroomObservations(3)
  ]);

  const intervals = fetchTimes.slice(1).map((t, i) => t - fetchTimes[i]);
  console.log('Intervals:', intervals);
})();
