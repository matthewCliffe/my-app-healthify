import { useState } from "react";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
//updates the username state 
  return (
    <div className="bg-green-500 p-6 rounded-2xl shadow-md w-full max-w-sm">
      <h1 className="text-xl font-bold mb-4">Login</h1>
      <input
        className="w-full p-2 border rounded mb-3"
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      {/* calls onLogin with current username entered */}
      <button
        className="w-full bg-blue-500 text-white p-2 rounded"
        onClick={() => onLogin(username)}
      >
        Login
      </button>
    </div>
  );
}