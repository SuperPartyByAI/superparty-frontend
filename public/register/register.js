const BACKEND_URL = "https://script.google.com/macros/s/AKfycbxs819m4gt-tpTkAIIS91EnxhwYx-5wdbnh6Zi5_GcY14zs5XYqS9ykFuYCCcokhQ/exec";

function showError(msg) {
  const el = document.getElementById("error");
  el.style.display = "block";
  el.textContent = msg;
}

function hideError() {
  document.getElementById("error").style.display = "none";
}

function register() {
  hideError();

  const fullname = document.getElementById("fullname").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  const idPhoto = document.getElementById("idPhoto").files[0];
  const selfiePhoto = document.getElementById("selfiePhoto").files[0];

  if (!fullname || !email || !phone || !password || !confirmPassword) {
    return showError("Completează toate câmpurile.");
  }

  if (password !== confirmPassword) {
    return showError("Parolele nu coincid.");
  }

  if (!idPhoto || !selfiePhoto) {
    return showError("Încarcă poza buletin și selfie!");
  }

  const reader1 = new FileReader();
  const reader2 = new FileReader();

  reader1.onload = function(e1) {
    const idBase64 = e1.target.result;

    reader2.onload = function(e2) {
      const selfieBase64 = e2.target.result;

      const url = BACKEND_URL +
        `?action=register` +
        `&fullname=${encodeURIComponent(fullname)}` +
        `&email=${encodeURIComponent(email)}` +
        `&phone=${encodeURIComponent(phone)}` +
        `&password=${encodeURIComponent(password)}` +
        `&idPhoto=${encodeURIComponent(idBase64)}` +
        `&selfie=${encodeURIComponent(selfieBase64)}` +
        `&callback=handleResponse`;

      const script = document.createElement("script");
      script.src = url;
      document.body.appendChild(script);
    };

    reader2.readAsDataURL(selfiePhoto);
  };

  reader1.readAsDataURL(idPhoto);
}

function handleResponse(res) {
  if (res && res.success) {
    document.getElementById("success").style.display = "block";
  } else {
    showError(res && res.message ? res.message : "Eroare la înregistrare.");
  }
}
