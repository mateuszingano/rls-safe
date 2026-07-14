/* ShipSealed — Paddle Billing checkout.
 *
 * DORMANT BY DESIGN. While PADDLE.token is empty this file does nothing: the
 * plan buttons keep their current behavior (they link to the waitlist at /#list).
 * Nothing loads, nothing changes.
 *
 * GO-LIVE (once Paddle verification is approved): fill in the three things below,
 * commit, push. The checkout turns on. No other file needs to change.
 *   1) PADDLE.token       — Paddle > Developer tools > Authentication > Client-side token
 *                           (starts with "live_"; for testing, a "test_" token + environment:'sandbox').
 *                           This is a PUBLIC token — safe to ship in the browser.
 *   2) PADDLE.priceIds    — the production price IDs, by plan and seat index (0 = 1 dev … 4 = 5–8 devs).
 *                           Produce them by running paddle/criar-catalogo.mjs against production,
 *                           then copy the ids out of paddle/paddle-ids.json.
 *   3) PADDLE.environment — flip to 'production' (leave 'sandbox' only while testing).
 */
window.PADDLE = {
  environment: 'production',
  token: 'live_d70c26e0d9ecf79a9b177a12ce9',
  // Production price IDs, seat index 0..4 (1 dev, 2, 3, 4, 5–8 devs). Order matches the seat buttons.
  priceIds: {
    base: [
      'pri_01kxgz2rphzs70p4ptv6gxreg2', // 1 dev  — $119.99
      'pri_01kxgz2rwn40gyq3nknzh5a0m2', // 2 devs — $199.99
      'pri_01kxgz2s2p095w5hwyarrrjvz9', // 3 devs — $279.99
      'pri_01kxgz2s8fev99fxbb0kgjxeqk', // 4 devs — $349.99
      'pri_01kxgz2seb7wwe1z6qxpqnm442', // 5–8 devs — $399.99
    ],
    pro: [
      'pri_01kxgz2t18dvwtgsj062mpsahs', // 1 dev  — $179.99
      'pri_01kxgz2t7enx3p4mah32feqwf4', // 2 devs — $249.99
      'pri_01kxgz2td61cq616rsn6bxrsc6', // 3 devs — $329.99
      'pri_01kxgz2tkgwafp434qzzq9ja3a', // 4 devs — $399.99
      'pri_01kxgz2ts97sfdh5jfgrsbkwj5', // 5–8 devs — $479.99
    ],
    // à-la-carte add-ons — flat price (a string, not a seat array)
    'kit-auth-rls': 'pri_01kxgz2vydz85g6h8syxj4by36', // $39.99
    'test-kit':     'pri_01kxgz2wg8v0qa7x0xg5njjseb', // $29.99
    'ui-kit':       'pri_01kxgz2vbw8rge6kvcafb2k6yy', // $4.99
  },
};

(function () {
  var P = window.PADDLE || {};

  // DORMANT: no token → leave every button exactly as it is (waitlist links).
  if (!P.token || !/\S/.test(P.token)) return;

  var s = document.createElement('script');
  s.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
  s.async = true;
  s.onload = function () {
    try {
      if (P.environment === 'sandbox' && window.Paddle) Paddle.Environment.set('sandbox');
      Paddle.Initialize({ token: P.token });
      wire();
    } catch (e) { /* if Paddle fails to init, buttons fall back to their href */ }
  };
  document.head.appendChild(s);

  // Which seat tier is selected right now (0..4). Mirrors the seat selector on the pricing page.
  function currentSeat() {
    var active = document.querySelector('.seat-btn.active');
    var i = active ? parseInt(active.getAttribute('data-i'), 10) : 0;
    return isNaN(i) ? 0 : i;
  }

  function wire() {
    var buttons = document.querySelectorAll('[data-paddle-plan]');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function (e) {
        var plan = this.getAttribute('data-paddle-plan');
        var entry = P.priceIds && P.priceIds[plan];
        // Base/Pro are seat arrays; à-la-carte add-ons are a flat string.
        var priceId = Array.isArray(entry) ? entry[currentSeat()] : entry;
        if (!priceId) return;              // no id → let the link fall through
        e.preventDefault();
        Paddle.Checkout.open({
          settings: { successUrl: 'https://boilerplate-delivery.vercel.app/' },
          items: [{ priceId: priceId, quantity: 1 }],
        });
      });
    }
  }
})();
