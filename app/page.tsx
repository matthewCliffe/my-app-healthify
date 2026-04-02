"use client";

import { useState } from "react";
import Login from "./components/login";
import Dashboard from "./components/dashboard";

export default function Page() {
  const [user, setUser] = useState(null);
  
//if user is null show login page, if user is not null show dashboard
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {!user ? (
        <Login onLogin={setUser} />
      ) : (
        <Dashboard user={user} onLogout={() => setUser(null)} />
      )}
    </div>
  );
}

