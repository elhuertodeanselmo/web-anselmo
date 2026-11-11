// Contador público de visitas (Cloudflare Worker «contador-anselmo» + base de datos D1).
// Suma una visita una sola vez por sesión del navegador y muestra el total en la cabecera.
(function () {
  var URL_CONTADOR = "https://contador-anselmo.elhuertodeanselmo.workers.dev/";
  var nav = document.querySelector(".cab nav");
  if (!nav) return;

  var css = document.createElement("style");
  css.textContent =
    ".visitas{display:none;align-items:center;gap:6px;font-size:.88rem;color:var(--suave);white-space:nowrap}" +
    ".visitas.lista{display:inline-flex}" +
    ".visitas svg{width:17px;height:17px;flex:none}" +
    ".visitas b{color:var(--tinta);font-weight:600}" +
    "@media (max-width:520px){.visitas .txt{display:none}}";
  document.head.appendChild(css);

  var el = document.createElement("span");
  el.className = "visitas";
  el.title = "Visitas a la web";
  el.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>' +
    '<span><b></b><span class="txt"> visitas</span></span>';
  var boton = nav.querySelector(".bt");
  nav.insertBefore(el, boton || null);

  var yaContada = false;
  try { yaContada = sessionStorage.getItem("anselmo_visita") === "1"; } catch (e) {}

  fetch(URL_CONTADOR, { method: yaContada ? "GET" : "POST" })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (typeof d.visitas !== "number" || d.visitas < 1) return;
      try { sessionStorage.setItem("anselmo_visita", "1"); } catch (e) {}
      el.querySelector("b").textContent = d.visitas.toLocaleString("es-ES");
      el.classList.add("lista");
    })
    .catch(function () {});
})();
