import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import SkeletonLoader from './components/SkeletonLoader';

// Lazy load feature components
const Landing = lazy(() => import('./pages/Landing'));
const Auth = lazy(() => import('./pages/Auth'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ColorAssist = lazy(() => import('./pages/ColorAssist'));
const GamesMenu = lazy(() => import('./pages/GamesMenu'));
const ColorMatch = lazy(() => import('./games/ColorMatch'));
const OddOneOut = lazy(() => import('./games/OddOneOut'));
const Test = lazy(() => import('./pages/Test'));
const ImageAnalysis = lazy(() => import('./pages/ImageAnalysis'));
const Camera = lazy(() => import('./pages/Camera'));
const Profile = lazy(() => import('./pages/Profile'));

const FallbackLoader = () => (
  <div className="p-8 w-full max-w-6xl mx-auto space-y-6">
     <SkeletonLoader type="text" />
     <SkeletonLoader type="card" />
     <div className="grid grid-cols-2 gap-6">
        <SkeletonLoader type="stat" />
        <SkeletonLoader type="stat" />
     </div>
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<FallbackLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />

          {/* Protected Routes enclosed in Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/color-assist" element={<ColorAssist />} />
              <Route path="/test" element={<Test />} />
              <Route path="/camera" element={
                 <div className="bg-dark-900"><ImageAnalysis /></div> // Use ImageAnalysis as wrapper or separate route later, wait, Camera has its own page
              } />
              {/* Actual route for camera live tool */}
              <Route path="/camera" element={<Camera />} />
              {/* We need route for Image Analysis too, we'll put it under /image-analysis or perhaps it was merged. Our Layout doesn't have Image Analysis link, but let's add it */}
              <Route path="/image-analysis" element={<ImageAnalysis />} />
              <Route path="/games" element={<GamesMenu />} />
              <Route path="/games/match" element={<ColorMatch />} />
              <Route path="/games/odd" element={<OddOneOut />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
