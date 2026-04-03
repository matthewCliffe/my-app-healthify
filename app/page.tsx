"use client";

import { useState } from "react";
import Login from "./components/login";
import Dashboard from "./components/dashboard";

export default function Page() {
  const [user, setUser] = useState(null);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {!user ? <Login onLogin={setUser} /> : <Dashboard user={user} />}
    </div>
  );
}