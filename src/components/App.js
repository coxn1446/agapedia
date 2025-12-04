import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Loading from './Loading/Loading';
import Nav from './Nav/Nav';

// Lazy load route components
const Home = lazy(() => import('../routes/Home'));
const Login = lazy(() => import('../routes/Login'));
const Register = lazy(() => import('../routes/Register'));
const Articles = lazy(() => import('../routes/Articles'));
const Article = lazy(() => import('../routes/Article'));
const ArticleEdit = lazy(() => import('../routes/ArticleEdit'));
const ArticleCreate = lazy(() => import('../routes/ArticleCreate'));
const ArticleHistory = lazy(() => import('../routes/ArticleHistory'));
const UserManagement = lazy(() => import('../routes/UserManagement'));

// Private Route component
const PrivateRoute = ({ children }) => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  return (
    <div className="min-h-screen bg-gray-50">
      {isAuthenticated && <Nav />}
      <main className={isAuthenticated ? 'pt-16' : ''}>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Home />
                </PrivateRoute>
              }
            />
            <Route
              path="/articles"
              element={
                <PrivateRoute>
                  <Articles />
                </PrivateRoute>
              }
            />
            <Route
              path="/article/create"
              element={
                <PrivateRoute>
                  <ArticleCreate />
                </PrivateRoute>
              }
            />
            <Route
              path="/article/:title"
              element={
                <PrivateRoute>
                  <Article />
                </PrivateRoute>
              }
            />
            <Route
              path="/article/:title/edit"
              element={
                <PrivateRoute>
                  <ArticleEdit />
                </PrivateRoute>
              }
            />
            <Route
              path="/article/:title/history"
              element={
                <PrivateRoute>
                  <ArticleHistory />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <PrivateRoute>
                  <UserManagement />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default App;

