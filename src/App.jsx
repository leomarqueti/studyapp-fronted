@@ .. @@
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CardsPage from './pages/CardsPage';
import StudyPage from './pages/StudyPage';
+import SettingsPage from './pages/SettingsPage';
import './App.css';
@@ .. @@
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigate} />;
      case 'cards':
        return <CardsPage onNavigate={handleNavigate} />;
      case 'study':
        return <StudyPage onNavigate={handleNavigate} />;
      case 'quiz':
        return <StudyPage onNavigate={handleNavigate} />; // Pode ser uma página separada no futuro
+      case 'settings':
+        return <SettingsPage onNavigate={handleNavigate} />;
      default:
        return <DashboardPage onNavigate={handleNavigate} />;
    }
  };