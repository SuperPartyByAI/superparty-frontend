import { useEffect } from "react";

export default function App() {
  useEffect(() => {
    // Folosim rutele statice controlate de vercel.json
    window.location.replace("/login");
  }, []);

  return <div style={{ padding: 20 }}>Redirecting…</div>;
}
