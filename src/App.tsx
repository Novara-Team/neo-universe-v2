import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/useAuth';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Explore from './pages/Explore';
import ToolDetails from './pages/ToolDetails';
import TopTools from './pages/TopTools';
import SubmitTool from './pages/SubmitTool';
import Compare from './pages/Compare';
import CompareAdvanced from './pages/CompareAdvanced';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import Pricing from './pages/Pricing';
import Checkout from './pages/Checkout';
import FavoriteTools from './pages/FavoriteTools';
import Collections from './pages/Collections';
import CollectionDetail from './pages/CollectionDetail';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageTools from './pages/admin/ManageTools';
import ManageNews from './pages/admin/ManageNews';
import ManageReviews from './pages/admin/ManageReviews';
import ManageSubmissions from './pages/admin/ManageSubmissions';
import ManageSupport from './pages/admin/ManageSupport';
import ManageSettings from './pages/admin/ManageSettings';
import Settings from './pages/Settings';
import Recommendations from './pages/Recommendations';
import PersonalAnalytics from './pages/PersonalAnalytics';
import Benchmarks from './pages/Benchmarks';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import Support from './pages/Support';
import Documentation from './pages/Documentation';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfUse from './pages/TermsOfUse';
import SupportChat from './components/SupportChat';
import ProtectedRoute from './components/ProtectedRoute';
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/adminpn" element={<AdminLogin />} />

          <Route
            path="/adminpn/*"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="tools" element={<ManageTools />} />
            <Route path="news" element={<ManageNews />} />
            <Route path="reviews" element={<ManageReviews />} />
            <Route path="submissions" element={<ManageSubmissions />} />
            <Route path="support" element={<ManageSupport />} />
            <Route path="settings" element={<ManageSettings />} />
          </Route>

          <Route
            path="*"
            element={
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/explore" element={<Explore />} />
                    <Route path="/tool/:slug" element={<ToolDetails />} />
                    <Route path="/top-tools" element={<TopTools />} />
                    <Route path="/submit" element={<SubmitTool />} />
                    <Route path="/compare" element={<Compare />} />
                    <Route path="/compare/advanced" element={<CompareAdvanced />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/favorites" element={<FavoriteTools />} />
                    <Route path="/collections" element={<Collections />} />
                    <Route path="/collections/:slug" element={<CollectionDetail />} />
                    <Route path="/recommendations" element={<Recommendations />} />
                    <Route path="/analytics" element={<PersonalAnalytics />} />
                    <Route path="/benchmarks" element={<Benchmarks />} />
                    <Route path="/news" element={<News />} />
                    <Route path="/news/:id" element={<NewsDetail />} />
                    <Route path="/support" element={<Support />} />
                    <Route path="/docs" element={<Documentation />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/terms-of-use" element={<TermsOfUse />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </main>
                <Footer />
                <SupportChat />
                <Analytics /> 
              </div>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
