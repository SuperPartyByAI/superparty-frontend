export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Lipsesc emailul sau parola.' });
      return;
    }

    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxs819m4gt-tpTkAIIS91EnxhwYx-5wdbnh6Zi5_GcY14zs5XYqS9ykFuYCCcokhQ/exec';
    const callbackName = 'loginCB';

    const url =
      APPS_SCRIPT_URL +
      '?action=login' +
      '&email=' + encodeURIComponent(email) +
      '&password=' + encodeURIComponent(password) +
      '&callback=' + encodeURIComponent(callbackName);

    const response = await fetch(url);
    const text = await response.text();

    const prefix = callbackName + '(';
    const start = text.indexOf(prefix);
    const end = text.lastIndexOf(')');

    if (start === -1 || end === -1) {
      console.error('Răspuns neașteptat de la Apps Script:', text);
      res.status(500).json({ success: false, error: 'Răspuns neașteptat de la backend.' });
      return;
    }

    const jsonPart = text.substring(start + prefix.length, end);
    const data = JSON.parse(jsonPart);

    res.status(200).json(data);
  } catch (err) {
    console.error('Eroare la handler /api/login:', err);
    res.status(500).json({ success: false, error: 'Eroare internă la login.' });
  }
}
