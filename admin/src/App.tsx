import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './components/AdminLayout';
import { LoginPage } from './pages/LoginPage';
import { EventsListPage } from './pages/EventsListPage';
import { EventFormPage } from './pages/EventFormPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/events" element={<AdminLayout />}>
        <Route index element={<EventsListPage />} />
        <Route path="new" element={<EventFormPage />} />
        <Route path=":id" element={<EventFormPage />} />
      </Route>
      <Route path="/" element={<Navigate to="/events" replace />} />
      <Route path="*" element={<Navigate to="/events" replace />} />
    </Routes>
  );
}
