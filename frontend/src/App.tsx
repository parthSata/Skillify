import { Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import {
  LandingPage,
  Login,
  Register,
  AdminLogin,
  AdminNavigation,
  TutorNavigation,
  StudentNavigation,
  ProtectedRoute,
  PageNotFound,
  Unauthorized,
} from '@/components/index';

function App() {
  const navigate = useNavigate();

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <Routes>
            <Route path="/" element={<LandingPage onAuthClick={() => navigate('/login')} />} />
            <Route path="/login" element={<Login onAuth={() => {}} onBack={() => navigate('/')} />} />
            <Route path="/register" element={<Register onAuth={() => {}} onBack={() => navigate('/')} />} />
            <Route path="/admin/login" element={<AdminLogin onAuth={() => {}} onBack={() => navigate('/')} />} />
            <Route
              path="/admin/*"
              element={<ProtectedRoute allowedRoles={['admin']} children={<AdminNavigation initialView="dashboard" />} />}
            />
            <Route
              path="/student/*"
              element={<ProtectedRoute allowedRoles={['student']} children={<StudentNavigation initialView="dashboard" />} />}
            />
            <Route
              path="/tutor/*"
              element={<ProtectedRoute allowedRoles={['tutor']} children={<TutorNavigation initialView="dashboard" />} />}
            />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;