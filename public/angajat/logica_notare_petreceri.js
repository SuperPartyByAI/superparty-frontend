// =======================================================
// SuperParty - LOGICA DE NOTARE A PETRECERILOR
// =======================================================
//
// Acest modul calculează:
//  - scorul dovezilor (poze / anti-fentă)
//  - scorul general al petrecerii: dovezi + comportament + feedback
//
// Va fi folosit de dashboard.js și poate fi trimis oricând în backend.
// =======================================================

(function () {
  // ----------------------------------------------------
  // 1) SCOR DOVEZI (strict pe poze / anti-fentă)
  // ----------------------------------------------------
  function calculateProofScore(opts) {
    const expected = Math.max(1, Number(opts.expectedProofs || 0));
    const uploaded = Math.max(0, Number(opts.uploadedProofs || 0));
    const rejected = Math.max(0, Number(opts.rejectedProofs || 0));
    const aiRisk = (opts.aiRisk || "none").toLowerCase();

    const details = [];

    // 1) Punctaj de bază
    let base = (uploaded / expected) * 100;
    if (base > 100) base = 100;

    details.push(
      `Punctaj de bază: ${uploaded}/${expected} dovezi = ${base.toFixed(0)}p.`
    );

    let score = base;
    let penalties = 0;

    // 2) Lipsă dovezi
    if (uploaded < expected) {
      penalties += 15;
      details.push(
        `-15p: lipsesc dovezi (încărcate ${uploaded}, necesare ${expected}).`
      );
    }

    // 3) Poze respinse
    if (rejected > 0) {
      const remove = rejected * 10;
      penalties += remove;
      details.push(`-${remove}p: ${rejected} poze respinse de AI/Admin.`);
    }

    // 4) AI Risk
    let riskPenalty = 0;
    if (aiRisk === "low") riskPenalty = 5;
    if (aiRisk === "medium") riskPenalty = 15;
    if (aiRisk === "high") riskPenalty = 30;

    penalties += riskPenalty;

    if (riskPenalty > 0) {
      details.push(`-${riskPenalty}p: risc AI = ${aiRisk.toUpperCase()}.`);
    } else {
      details.push("0p: fără risc AI.");
    }

    // Aplicăm penalizări
    score = score - penalties;
    if (score < 0) score = 0;

    // Interpretare
    let label = "";
    let severity = "ok";

    if (score >= 80) {
      label = "OK – dovezi bune";
      severity = "ok";
    } else if (score >= 50) {
      label = "Risc mediu – verificare manuală";
      severity = "warning";
    } else {
      label = "Risc mare – dovezi insuficiente / suspecte";
      severity = "danger";
    }

    details.push(`Scor final dovezi: ${score.toFixed(0)}/100.`);

    return {
      score: Number(score.toFixed(0)),
      label,
      severity,
      details,
    };
  }

  // ----------------------------------------------------
  // 2) SCOR GENERAL PETRECERE (dovezi + comportament + feedback)
  // ----------------------------------------------------
  function calculatePartyScore(opts) {
    const details = [];

    // 1) Dovezi
    const proof = calculateProofScore({
      expectedProofs: opts.expectedProofs,
      uploadedProofs: opts.uploadedProofs,
      rejectedProofs: opts.rejectedProofs,
      aiRisk: opts.aiRisk,
    });

    details.push("[DOVEZI] " + proof.label);
    proof.details.forEach((d) => details.push(" - " + d));

    // 2) Feedback client (1–5 stele)
    const clientRaw = Number(opts.clientRating || 0);
    let clientScore = 0;

    if (clientRaw > 0) {
      clientScore = (clientRaw / 5) * 100;
      details.push(
        `[CLIENT] Rating client: ${clientRaw}/5 => ${clientScore.toFixed(
          0
        )}/100.`
      );
    } else {
      clientScore = 60;
      details.push("[CLIENT] Lipsă feedback => scor neutru (60/100).");
    }

    // 3) Comportament (întârziere + incidente)
    let behaviorScore = 100;
    let bDetails = [];

    const late = Number(opts.lateMinutes || 0);
    const incidents = Number(opts.incidents || 0);

    if (late > 0 && late <= 10) {
      behaviorScore -= 10;
      bDetails.push("Întârziere ≤10 min => -10p.");
    } else if (late > 10 && late <= 30) {
      behaviorScore -= 25;
      bDetails.push("Întârziere 11–30 min => -25p.");
    } else if (late > 30) {
      behaviorScore -= 45;
      bDetails.push(">30 min întârziere => -45p.");
    }

    if (incidents > 0) {
      const pen = Math.min(incidents * 20, 60);
      behaviorScore -= pen;
      bDetails.push(`Incidente raportate: ${incidents} => -${pen}p.`);
    }

    if (behaviorScore < 0) behaviorScore = 0;

    if (bDetails.length === 0)
      bDetails.push("Fără incidente / fără întârzieri.");

    details.push(`[COMPORTAMENT] Scor: ${behaviorScore}/100.`);
    bDetails.forEach((d) => details.push(" - " + d));

    // 4) Combinare scoruri
    const finalScore =
      proof.score * 0.5 + clientScore * 0.3 + behaviorScore * 0.2;

    let grade = "A";
    let label = "";
    let severity = "ok";

    if (finalScore >= 85) {
      grade = "A";
      label = "Petrecere excelentă – standard SuperParty.";
      severity = "ok";
    } else if (finalScore >= 70) {
      grade = "B";
      label = "Petrecere bună – mici probleme.";
      severity = "ok";
    } else if (finalScore >= 50) {
      grade = "C";
      label = "Petrecere cu probleme – necesită analiză.";
      severity = "warning";
    } else {
      grade = "D";
      label = "Petrecere slabă – risc mare / dovezi insuficiente.";
      severity = "danger";
    }

    details.push(
      `Scor general petrecere: ${finalScore.toFixed(0)}/100 (nota ${grade}).`
    );

    return {
      score: Number(finalScore.toFixed(0)),
      grade,
      label,
      severity,
      details,
      components: {
        proofScore: proof.score,
        clientScore: Number(clientScore.toFixed(0)),
        behaviorScore,
      },
    };
  }

  // ----------------------------------------------------
  // EXPORT GLOBAL (pentru dashboard.js)
  // ----------------------------------------------------
  window.SuperPartyNotarePetreceri = {
    calculateProofScore,
    calculatePartyScore,
  };
})();
