import React from "react";
import { useAuth } from "../context/AuthContext";

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h1 className="text-3xl font-bold mb-4">🎉 Dashboard - LOGIN SUCCES!</h1>
          <div className="bg-green-900 border border-green-500 rounded-lg p-4 mb-4">
            <p className="text-xl">✅ TE-AI LOGAT CU SUCCES!</p>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4 space-y-2">
            <p><strong>👤 Nume:</strong> {user?.nume} {user?.prenume}</p>
            <p><strong>📧 Email:</strong> {user?.email}</p>
            <p><strong>👔 Rol:</strong> {user?.rol}</p>
          </div>

          <button
            onClick={logout}
            className="mt-6 bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold"
          >
            🚪 Logout
          </button>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Evenimentele Tale</h2>
          <p className="text-gray-400">Lista cu evenimente va apărea aici...</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;