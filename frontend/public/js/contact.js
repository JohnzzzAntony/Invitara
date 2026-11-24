// Fills the contact page from server settings (SUPPORT_EMAIL, SUPPORT_WHATSAPP).
// The page is server-rendered with the support address, so this only corrects it when the setting differs.
fetch('/api/config').then(r => r.json()).then(c => {
  if (c.supportEmail) {
    document.querySelectorAll('[data-support-email]').forEach(a => {
      const subject = a.dataset.supportSubject;
      a.href = 'mailto:' + c.supportEmail + (subject ? '?subject=' + encodeURIComponent(subject) : '');
      if (a.id === 'contact-email') a.textContent = c.supportEmail;
    });
  }
  if (c.supportWhatsapp) {
    document.getElementById('contact-whatsapp').href = 'https://wa.me/' + c.supportWhatsapp;
    document.getElementById('contact-whatsapp-block').hidden = false;
  }
}).catch(() => {});
