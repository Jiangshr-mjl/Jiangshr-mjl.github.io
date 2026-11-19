(function () {
  'use strict';
  var address = document.getElementById('feed-address');
  var button = document.getElementById('copy-feed');
  var status = document.getElementById('copy-status');

  if (!navigator.clipboard || !navigator.clipboard.writeText) return;
  button.hidden = false;
  button.addEventListener('click', async function () {
    try {
      await navigator.clipboard.writeText(address.value);
      status.textContent = '已复制订阅地址。';
    } catch (_) {
      address.focus();
      address.select();
      status.textContent = '已选中订阅地址，请手动复制。';
    }
  });
}());
