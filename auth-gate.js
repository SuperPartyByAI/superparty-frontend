// auth-gate.js
// Include pe paginile protejate: waiting / kyc / dashboard
(function () {
  "use strict";
  if (!window.auth) return console.error("[auth-gate] auth.js lipsă");
  auth.enforceFlow();
})();
