// ═══════════════════════════════════════════════════════════
// auth.ts – API pentru autentificare cu Google Apps Script
// ═══════════════════════════════════════════════════════════

export interface LoginResponse {
  success: boolean;
  message: string;
  name: string;
  email: string;
  role: string;
  last_kyc_date: string | null;
  is_driver: boolean;
}

// URL-ul WebApp-ului tău Google Apps Script
const WEBAPP_URL =
  "https://script.google.com/macros/s/AKfycbxrDcyKQfGgfpQrNm4opWsbce_mR1a-w7EbCLYtrrMEc-gFQKQAH7TQiY_ivxf9wZCj/exec";

/**
 * Login API → trimite email + parolă la backend
 */
export async function loginUser(
  email: string,
  password: string
): Promise<LoginResponse> {
  
  const body = new URLSearchParams({
    action: "login",
    email,
    password,
  });

  const response = await fetch(WEBAPP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body,
  });

  if (!response.ok) {
    throw new Error("Eroare server: HTTP " + response.status);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Autentificare eșuată");
  }

  return data as LoginResponse;
}
