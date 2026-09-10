/* ============================================================
   DATAΛAYER + ECOMMERCE GA4 · Site Prima Psicóloga
   GTM Container: GTM-XXXXXXX  |  GA4: G-XXXXXXXXXX
============================================================ */

window.dataLayer = window.dataLayer || [];

const PRODUTO = {
  item_id:       'consulta-prima-psicologa',
  item_name:     'Consulta Psicológica – Prima',
  item_category: 'Psicologia',
  item_category2:'Saúde Mental',
  item_brand:    'Prima Psicóloga',
  currency:      'BRL',
  price:         0,
  quantity:      1
};

/* ---------- helpers ---------- */
function dlPush(payload) {
  window.dataLayer.push({ ecommerce: null }); // limpa contexto anterior
  window.dataLayer.push(payload);
}

function uid() {
  return 'lead-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
}

/* ============================================================
   1. PAGE_VIEW + VIEW_ITEM (carregamento da página)
============================================================ */
window.addEventListener('DOMContentLoaded', function () {

  dlPush({
    event: 'view_item',
    ecommerce: {
      items: [PRODUTO]
    }
  });

  /* -------- scroll Nav -------- */
  var header = document.getElementById('header');
  window.addEventListener('scroll', function () {
    header.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  /* -------- máscara WhatsApp -------- */
  var tel = document.getElementById('whatsapp');
  if (tel) {
    tel.addEventListener('input', function () {
      var v = this.value.replace(/\D/g, '').slice(0, 11);
      if (v.length > 6) {
        v = '(' + v.slice(0,2) + ') ' + v.slice(2,7) + '-' + v.slice(7);
      } else if (v.length > 2) {
        v = '(' + v.slice(0,2) + ') ' + v.slice(2);
      } else if (v.length > 0) {
        v = '(' + v;
      }
      this.value = v;
    });
  }

  /* -------- CTA buttons (todos) -------- */
  document.querySelectorAll('.track-cta').forEach(function (el) {
    el.addEventListener('click', function () {
      dlPush({
        event: 'add_to_cart',
        ecommerce: {
          items: [Object.assign({}, PRODUTO, {
            item_list_name: 'CTA · ' + (el.dataset.ctaPosition || 'desconhecido')
          })]
        }
      });
    });
  });

  /* -------- WhatsApp -------- */
  document.querySelectorAll('.track-whatsapp').forEach(function (el) {
    el.addEventListener('click', function () {
      dlPush({
        event: 'whatsapp_click',
        click_position: el.dataset.ctaPosition || 'desconhecido'
      });
      /* geração de lead via WhatsApp */
      dlPush({
        event: 'generate_lead',
        lead_source: 'whatsapp',
        lead_position: el.dataset.ctaPosition || 'desconhecido',
        currency: 'BRL',
        value: 0
      });
    });
  });

  /* -------- Modalidade cards -------- */
  document.querySelectorAll('.track-select-content').forEach(function (el) {
    el.addEventListener('click', function () {
      dlPush({
        event: 'select_item',
        ecommerce: {
          item_list_name: 'Modalidades',
          items: [Object.assign({}, PRODUTO, {
            item_variant: el.dataset.modalidade || 'desconhecido'
          })]
        }
      });
    });
  });

  /* -------- Diferenciais (view) -------- */
  if ('IntersectionObserver' in window) {
    var difObs = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        dlPush({ event: 'view_item_list', ecommerce: { item_list_name: 'Diferenciais', items: [PRODUTO] } });
        obs.disconnect();
      });
    }, { threshold: .3 });
    var secDif = document.getElementById('diferenciais');
    if (secDif) difObs.observe(secDif);
  }

  /* -------- FAQ -------- */
  document.querySelectorAll('.track-faq').forEach(function (el) {
    el.addEventListener('toggle', function () {
      if (!el.open) return;
      dlPush({
        event: 'faq_open',
        faq_id: el.dataset.faq || 'desconhecido'
      });
    });
  });

  /* ============================================================
     FORMULÁRIO
  ============================================================ */
  var form       = document.getElementById('form-contato');
  var btnSubmit  = document.getElementById('btn-submit');
  var successEl  = document.getElementById('form-success');
  var errorEl    = document.getElementById('form-error');
  var checkoutFired = false;

  /* begin_checkout → primeiro foco em qualquer campo */
  form.querySelectorAll('input, select, textarea').forEach(function (el) {
    el.addEventListener('focus', function () {
      if (checkoutFired) return;
      checkoutFired = true;
      dlPush({
        event: 'begin_checkout',
        ecommerce: {
          items: [PRODUTO]
        }
      });
    }, { once: false });
  });

  /* validação */
  function validate() {
    var ok = true;

    var nome = document.getElementById('nome');
    var nomeErr = document.getElementById('nome-error');
    if (!nome.value.trim() || nome.value.trim().length < 2) {
      nomeErr.textContent = 'Informe seu nome completo.';
      nome.classList.add('is-invalid');
      ok = false;
    } else {
      nomeErr.textContent = '';
      nome.classList.remove('is-invalid');
    }

    var email = document.getElementById('email');
    var emailErr = document.getElementById('email-error');
    var emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRx.test(email.value.trim())) {
      emailErr.textContent = 'Informe um e-mail válido.';
      email.classList.add('is-invalid');
      ok = false;
    } else {
      emailErr.textContent = '';
      email.classList.remove('is-invalid');
    }

    var wpp = document.getElementById('whatsapp');
    var wppErr = document.getElementById('whatsapp-error');
    var digits = wpp.value.replace(/\D/g, '');
    if (digits.length < 10) {
      wppErr.textContent = 'Informe um WhatsApp válido com DDD.';
      wpp.classList.add('is-invalid');
      ok = false;
    } else {
      wppErr.textContent = '';
      wpp.classList.remove('is-invalid');
    }

    return ok;
  }

  /* add_payment_info → campos de contato preenchidos */
  var payFired = false;
  ['email', 'whatsapp'].forEach(function (id) {
    document.getElementById(id).addEventListener('blur', function () {
      if (payFired) return;
      var email = document.getElementById('email');
      var wpp   = document.getElementById('whatsapp');
      if (email.value.trim() && wpp.value.replace(/\D/g, '').length >= 10) {
        payFired = true;
        dlPush({ event: 'add_payment_info', ecommerce: { payment_type: 'contato', items: [PRODUTO] } });
      }
    });
  });

  /* submit */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) return;

    var btnText    = btnSubmit.querySelector('.btn__text');
    var btnLoading = btnSubmit.querySelector('.btn__loading');
    btnSubmit.disabled = true;
    btnText.hidden = true;
    btnLoading.hidden = false;
    successEl.hidden = true;
    errorEl.hidden   = true;

    var transactionId = uid();
    var payload = {
      nome:       document.getElementById('nome').value.trim(),
      email:      document.getElementById('email').value.trim(),
      whatsapp:   document.getElementById('whatsapp').value.trim(),
      modalidade: document.getElementById('modalidade').value,
      mensagem:   document.getElementById('mensagem').value.trim(),
      origem:     document.referrer || 'direto',
      timestamp:  new Date().toISOString()
    };

    /* Envio para Google Sheets via Apps Script */
    fetch('APPS_SCRIPT_URL_AQUI', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      if (data.success) {
        onSuccess(transactionId, payload);
      } else {
        onError(data.error);
      }
    })
    .catch(function (err) {
      onError(err);
    });
  });

  function onSuccess(transactionId, payload) {
    successEl.hidden = false;
    form.reset();
    checkoutFired = false;
    payFired = false;
    resetBtn();

    /* GA4 Ecommerce: purchase (= lead convertido) */
    dlPush({
      event: 'purchase',
      ecommerce: {
        transaction_id: transactionId,
        value: 0,
        currency: 'BRL',
        items: [Object.assign({}, PRODUTO, {
          item_variant: payload.modalidade || 'nao_informado'
        })]
      }
    });

    /* generate_lead (evento padrão GA4) */
    dlPush({
      event: 'generate_lead',
      lead_source:    'formulario',
      lead_modalidade: payload.modalidade || 'nao_informado',
      currency: 'BRL',
      value: 0
    });
  }

  function onError(err) {
    console.error('[Prima Site] Erro no envio:', err);
    errorEl.hidden = false;
    resetBtn();
  }

  function resetBtn() {
    btnSubmit.disabled = false;
    btnSubmit.querySelector('.btn__text').hidden = false;
    btnSubmit.querySelector('.btn__loading').hidden = true;
  }

});
