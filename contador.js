// Contador público de visitas (Cloudflare Worker «contador-anselmo» + base de datos D1).
// Suma una visita una sola vez por sesión del navegador (en cualquier página)
// y, en la portada, la muestra como un cuentakilómetros que gira desde 0000.
(function () {
  var URL_CONTADOR = "https://contador-anselmo.elhuertodeanselmo.workers.dev/";
  var ALTO = 52;

  var yaContada = false;
  try { yaContada = sessionStorage.getItem("anselmo_visita") === "1"; } catch (e) {}

  var botones = document.querySelector(".portada .botones");
  var caja = null, odo = null;

  if (botones) {
    var css = document.createElement("style");
    css.textContent =
      ".visitas{display:inline-flex;align-items:center;gap:14px;margin-top:22px;background:rgba(251,248,243,.12);border:1px solid rgba(251,248,243,.25);border-radius:14px;padding:10px 16px;opacity:0;transition:opacity .4s}" +
      ".visitas.lista{opacity:1}" +
      ".visitas .odo{display:inline-flex;gap:5px}" +
      ".visitas .dig{width:38px;height:" + ALTO + "px;background:#2a2420;border-radius:7px;overflow:hidden;position:relative;border:1px solid #4a3f37}" +
      ".visitas .dig::after{content:'';position:absolute;left:0;right:0;top:50%;height:1px;background:rgba(0,0,0,.45)}" +
      ".visitas .col{display:flex;flex-direction:column;transition:transform .9s cubic-bezier(.2,.8,.2,1)}" +
      ".visitas .col span{height:" + ALTO + "px;line-height:" + ALTO + "px;text-align:center;color:#f7f1e7;font:600 30px/" + ALTO + "px Georgia,serif}" +
      ".visitas .txt{font:italic 15px/1.3 Lora,Georgia,serif;color:#fbf8f3}" +
      "@media (max-width:520px){.visitas .dig{width:32px}.visitas .txt{font-size:14px}}";
    document.head.appendChild(css);

    caja = document.createElement("div");
    caja.className = "visitas";
    caja.innerHTML = '<div class="odo" aria-hidden="true"></div><div class="txt">vecinos han pasado<br>ya por el huerto</div>';
    botones.parentNode.insertBefore(caja, botones.nextSibling);
    odo = caja.querySelector(".odo");
  }

  function rodillos(cuantos) {
    while (odo.children.length < cuantos) {
      var d = document.createElement("div");
      d.className = "dig";
      var c = document.createElement("div");
      c.className = "col";
      for (var k = 0; k < 10; k++) {
        var s = document.createElement("span");
        s.textContent = k;
        c.appendChild(s);
      }
      d.appendChild(c);
      odo.insertBefore(d, odo.firstChild);
    }
  }

  function pinta(v) {
    var txt = String(v);
    while (txt.length < 4) txt = "0" + txt;
    rodillos(txt.length);
    var cols = odo.querySelectorAll(".col");
    for (var i = 0; i < cols.length; i++) {
      cols[i].style.transform = "translateY(-" + (Number(txt[i]) * ALTO) + "px)";
    }
  }

  fetch(URL_CONTADOR, { method: yaContada ? "GET" : "POST" })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (typeof d.visitas !== "number" || d.visitas < 1) return;
      try { sessionStorage.setItem("anselmo_visita", "1"); } catch (e) {}
      if (!caja) return;
      caja.setAttribute("title", d.visitas + " visitas");
      pinta(0);
      caja.classList.add("lista");
      setTimeout(function () { pinta(d.visitas); }, 450);
    })
    .catch(function () {});
})();
