import { useEffect } from "react";

export default function App() {
  useEffect(() => {
    const token = localStorage.getItem("sp_token");
    if (token && token.length > 10) {
      window.location.replace("/dashboard");
    } else {
      window.location.replace("/login");
    }
  }, []);

  return <div style={{ padding: 20 }}>Redirect...</div>;
}
