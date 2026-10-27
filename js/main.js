(function () {
  // Мобильное меню
  var burger = document.querySelector('.burger');
  var nav = document.querySelector('.nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Цели Метрики (если счётчик подключён)
  function goal(name) {
    var id = window.__metrikaId;
    if (id && typeof window.ym === 'function') window.ym(id, 'reachGoal', name);
  }
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-goal]');
    if (el) goal(el.getAttribute('data-goal'));
  });

  // Фильтр каталога
  var tabs = document.querySelectorAll('.tab[data-filter]');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var f = tab.getAttribute('data-filter');
      tabs.forEach(function (t) { t.classList.toggle('is-active', t === tab); });
      document.querySelectorAll('[data-line]').forEach(function (card) {
        card.hidden = f !== 'all' && card.getAttribute('data-line') !== f;
      });
    });
  });

  // Формы заявок
  document.querySelectorAll('form[data-lead]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = form.querySelector('.form__status');
      var btn = form.querySelector('button[type="submit"]');
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      data.page = location.pathname;
      status.className = 'form__status';
      if (window.__pilot) {
        status.classList.add('is-ok');
        status.textContent = 'Пилотная версия: заявка не отправляется. На рабочем сайте здесь будет подтверждение отправки.';
        return;
      }
      status.textContent = 'Отправляем…';
      btn.disabled = true;
      fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, body: j }; }); })
        .then(function (res) {
          if (!res.ok) throw new Error(res.body && res.body.error || 'Ошибка');
          status.classList.add('is-ok');
          status.textContent = 'Спасибо! Заявка отправлена — менеджер свяжется с вами в течение рабочего дня.';
          form.reset();
          goal('lead_form');
        })
        .catch(function (err) {
          status.classList.add('is-error');
          status.textContent = err.message || 'Не удалось отправить заявку. Позвоните или напишите нам.';
        })
        .finally(function () { btn.disabled = false; });
    });
  });

  // Баннер cookie
  var cookie = document.querySelector('.cookie');
  var key = 'perekusov-cookie-ok';
  var accepted = false;
  try { accepted = localStorage.getItem(key) === '1'; } catch (e) {}
  if (cookie && !accepted) {
    cookie.classList.add('is-visible');
    cookie.querySelector('button').addEventListener('click', function () {
      try { localStorage.setItem(key, '1'); } catch (e) {}
      cookie.classList.remove('is-visible');
    });
  }
})();
