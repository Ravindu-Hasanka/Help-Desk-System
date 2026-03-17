import { BrowserRouter, Route, Routes } from "react-router-dom";

import "./App.css";
import LandingPage from "./pages/landingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

function PlaceholderPage({ title }: { title: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-50">
      <section className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">
          HelpDeskSystem
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-tight">{title}</h1>
        <p className="mt-4 text-base leading-7 text-slate-300">
          This screen is not built yet, but the route is now wired correctly so the
          navigation flow does not break while we keep building.
        </p>
      </section>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
