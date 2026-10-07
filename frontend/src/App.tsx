import { Navigate, Route, Routes } from "react-router-dom";
import { RequireAuth } from "./auth";
import { AppShell, AuthFrame, RequireAdmin, SessionGate } from "./shell";
import { SCREEN001 } from "./pages/SCREEN001";
import { SCREEN002 } from "./pages/SCREEN002";
import { SCREEN003 } from "./pages/SCREEN003";
import { SCREEN019 } from "./pages/SCREEN019";
import { SCREEN004 } from "./pages/SCREEN004";
import { SCREEN006 } from "./pages/SCREEN006";
import { SCREEN005 } from "./pages/SCREEN005";
import { SCREEN007 } from "./pages/SCREEN007";
import { SCREEN008 } from "./pages/SCREEN008";
import { SCREEN009 } from "./pages/SCREEN009";
import { SCREEN010 } from "./pages/SCREEN010";
import { SCREEN011 } from "./pages/SCREEN011";
import { SCREEN012 } from "./pages/SCREEN012";
import { SCREEN013 } from "./pages/SCREEN013";
import { SCREEN014 } from "./pages/SCREEN014";
import { SCREEN015 } from "./pages/SCREEN015";
import { SCREEN016 } from "./pages/SCREEN016";
import { SCREEN018 } from "./pages/SCREEN018";
import { SCREEN020 } from "./pages/SCREEN020";
import { SCREEN017 } from "./pages/SCREEN017";
import { SCREENCHROME403 } from "./pages/SCREENCHROME403";
import { SCREENCHROME404 } from "./pages/SCREENCHROME404";
import { SCREENCHROMEOFFLINE } from "./pages/SCREENCHROMEOFFLINE";

/** Routes generated from ui-spec. Shell owns nav, account name, and admin gating. */
export function App() {
  return (
    <SessionGate>
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<AuthFrame><SCREEN001 /></AuthFrame>} />
        <Route path="/set-password" element={<AppShell><SCREEN002 /></AppShell>} />
        <Route path="/admin/people" element={<RequireAuth><RequireAdmin><AppShell><SCREEN003 /></AppShell></RequireAdmin></RequireAuth>} />
        <Route path="/admin" element={<RequireAuth><RequireAdmin><AppShell><SCREEN019 /></AppShell></RequireAdmin></RequireAuth>} />
        <Route path="/admin/rooms" element={<RequireAuth><RequireAdmin><AppShell><SCREEN004 /></AppShell></RequireAdmin></RequireAuth>} />
        <Route path="/teacher" element={<RequireAuth><AppShell><SCREEN006 /></AppShell></RequireAuth>} />
        <Route path="/rooms/{id}/roster" element={<RequireAuth><RequireAdmin><AppShell><SCREEN005 /></AppShell></RequireAdmin></RequireAuth>} />
        <Route path="/rooms/{id}/attendance" element={<RequireAuth><AppShell><SCREEN007 /></AppShell></RequireAuth>} />
        <Route path="/student/rooms/{id}/attendance" element={<RequireAuth><AppShell><SCREEN008 /></AppShell></RequireAuth>} />
        <Route path="/rooms/{id}/announcements" element={<RequireAuth><AppShell><SCREEN009 /></AppShell></RequireAuth>} />
        <Route path="/rooms/{id}/assignments" element={<RequireAuth><AppShell><SCREEN010 /></AppShell></RequireAuth>} />
        <Route path="/assignments/{id}/submit" element={<RequireAuth><AppShell><SCREEN011 /></AppShell></RequireAuth>} />
        <Route path="/assignments/{id}/submissions" element={<RequireAuth><AppShell><SCREEN012 /></AppShell></RequireAuth>} />
        <Route path="/rooms/{id}/quizzes" element={<RequireAuth><AppShell><SCREEN013 /></AppShell></RequireAuth>} />
        <Route path="/student/quizzes/{id}/attempt" element={<RequireAuth><AppShell><SCREEN014 /></AppShell></RequireAuth>} />
        <Route path="/rooms/{id}/grades" element={<RequireAuth><AppShell><SCREEN015 /></AppShell></RequireAuth>} />
        <Route path="/rooms/{id}/result" element={<RequireAuth><AppShell><SCREEN016 /></AppShell></RequireAuth>} />
        <Route path="/student" element={<RequireAuth><AppShell><SCREEN018 /></AppShell></RequireAuth>} />
        <Route path="/student/rooms/{id}/quizzes" element={<RequireAuth><AppShell><SCREEN020 /></AppShell></RequireAuth>} />
        <Route path="/notifications" element={<RequireAuth><AppShell><SCREEN017 /></AppShell></RequireAuth>} />
        <Route path="/403" element={<AppShell><SCREENCHROME403 /></AppShell>} />
        <Route path="/404" element={<AppShell><SCREENCHROME404 /></AppShell>} />
        <Route path="/offline" element={<AppShell><SCREENCHROMEOFFLINE /></AppShell>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
    </SessionGate>
  );
}
