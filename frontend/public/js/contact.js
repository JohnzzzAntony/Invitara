// Fills the contact page from server settings (SUPPORT_EMAIL, SUPPORT_WHATSAPP).
fetch('/api/config').then(r => r.json()).then(c => {
  if (c.supportEmail) {
    const a = document.getElementById('contact-email');
    a.href = 'mailto:' + c.supportEmail; a.textContent = c.supportEmail;
  }
  if (c.supportWhatsapp) {
    document.getElementById('contact-whatsapp').href = 'https://wa.me/' + c.supportWhatsapp;
    document.getElementById('contact-whatsapp-block').hidden = false;
  }
}).catch(() => {});
