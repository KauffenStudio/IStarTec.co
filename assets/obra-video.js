/* Short silent job-site clips: play only while on screen, never for
   prefers-reduced-motion, and always with a pause button (WCAG 2.2.2). */
(function () {
  var videos = document.querySelectorAll('video[data-obra-video]');
  if (!videos.length) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Button labels follow the page language (FR/DE pages are generated and keep no data-* text)
  var LABELS = { pt: ['Pausar vídeo', 'Reproduzir vídeo'], en: ['Pause video', 'Play video'],
                 fr: ['Mettre la vidéo en pause', 'Lire la vidéo'], de: ['Video pausieren', 'Video abspielen'] };
  var lab = LABELS[(document.documentElement.lang || 'pt').slice(0, 2).toLowerCase()] || LABELS.pt;

  videos.forEach(function (video) {
    var btn = video.parentNode.querySelector('.obra-video-toggle');
    var userPaused = reduce;
    video.muted = true;

    function sync() {
      if (!btn) return;
      var paused = video.paused;
      btn.classList.toggle('is-paused', paused);
      btn.setAttribute('aria-label', paused ? lab[1] : lab[0]);
    }
    function play() {
      var p = video.play();
      if (p && p.catch) p.catch(function () { sync(); });
    }

    video.addEventListener('play', sync);
    video.addEventListener('pause', sync);
    sync();

    if (btn) {
      btn.addEventListener('click', function () {
        if (video.paused) { userPaused = false; play(); }
        else { userPaused = true; video.pause(); }
      });
    }

    if (reduce) return;
    if (!('IntersectionObserver' in window)) { play(); return; }
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { if (!userPaused) play(); }
        else if (!video.paused) video.pause();
      });
    }, { threshold: 0.35 }).observe(video);
  });
})();
