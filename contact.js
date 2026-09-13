document.querySelectorAll('.copy-email').forEach((button) => {
  button.addEventListener('click', async () => {
    const panel = button.closest('.email-panel');
    const address = panel.querySelector('.email-address');
    const status = panel.querySelector('.email-status');
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(address.value);
      status.textContent = '邮箱已复制';
    } catch {
      address.focus();
      address.select();
      status.textContent = '未能自动复制，已选中邮箱，请手动复制。';
    }
  });
});
