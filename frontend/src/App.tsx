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
  // PageNotFound,
  // Unauthorized,
} from '@/components/index';

// // You will need to create this component
// const PendingApproval = () => (
//   <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900 text-center">
//     <div className="p-8 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg">
//       <h1 className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-4">Account Pending Approval</h1>
//       <p className="text-gray-700 dark:text-gray-300">Your tutor account is currently under review. Please wait for an administrator to approve it.</p>
//       <button
//         onClick={() => window.location.href = '/'}
//         className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//       >
//         Go to Home
//       </button>
//     </div>
//   </div>
// );

function App() {
  const navigate = useNavigate();

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login onBack={() => navigate('/')} />} />
            <Route path="/register" element={<Register onBack={() => navigate('/')} />} />
            <Route path="/admin/login" element={<AdminLogin onBack={() => navigate('/')} />} />
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
            {/* <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/pending-approval" element={<PendingApproval />} />
            <Route path="*" element={<PageNotFound />} /> */}
          </Routes>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;