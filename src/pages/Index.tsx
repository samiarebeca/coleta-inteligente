import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Login from './Login';
import Home from './Home';
import EntryForm from './EntryForm';
import SaleForm from './SaleForm';
import Routes from './Routes';
import Dashboard from './Dashboard';
import Settings from './Settings';
import { BottomNav } from '@/components/BottomNav';

const Index = () => {
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState('home');

  if (!isAuthenticated) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home onNavigate={setActiveTab} />;
      case 'entry':
        return <EntryForm onBack={() => setActiveTab('home')} />;
      case 'sale':
        return <SaleForm onBack={() => setActiveTab('home')} />;
      case 'routes':
        return <Routes onBack={() => setActiveTab('home')} />;
      case 'dashboard':
        return <Dashboard onBack={() => setActiveTab('home')} />;
      case 'settings':
        return <Settings onBack={() => setActiveTab('home')} />;
      default:
        return <Home onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderContent()}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
