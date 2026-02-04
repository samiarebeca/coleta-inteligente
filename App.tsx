
import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import LoginScreen from './screens/LoginScreen';
import RegistrationScreen from './screens/RegistrationScreen';
import AdminDashboard from './screens/AdminDashboard';
import AssociateDashboard from './screens/AssociateDashboard';
import DriverDashboard from './screens/DriverDashboard';
import CollectionRegistration from './screens/CollectionRegistration';
import EntryRegistration from './screens/EntryRegistration';
import SaleRegistration from './screens/SaleRegistration';
import ReportsScreen from './screens/ReportsScreen';
import BuyerRegistration from './screens/BuyerRegistration';
import HistoryScreen from './screens/HistoryScreen';
import MaterialRegistration from './screens/MaterialRegistration';
import RoutesScreen from './screens/RoutesScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import SalesHistoryScreen from './screens/SalesHistoryScreen';
import MaterialsListScreen from './screens/MaterialsListScreen';
import EntriesHistoryScreen from './screens/EntriesHistoryScreen';
import BuyersListScreen from './screens/BuyersListScreen';

export type Screen =
  | 'LOGIN'
  | 'REGISTER'
  | 'ADMIN_DASHBOARD'
  | 'ASSOCIATE_DASHBOARD'
  | 'DRIVER_DASHBOARD'
  | 'COLLECTION_REG'
  | 'ENTRY_REG'
  | 'SALE_REG'
  | 'REPORTS'
  | 'BUYER_REG'
  | 'HISTORY'
  | 'MATERIAL_REG'
  | 'ROUTES_MAP'
  | 'PROFILE'
  | 'SETTINGS'
  | 'NOTIFICATIONS'
  | 'NOTIFICATIONS'
  | 'SALES_HISTORY'
  | 'MATERIALS_LIST'
  | 'ENTRIES_HISTORY'
  | 'BUYERS_LIST'
  | 'SUCCESS_SPLASH';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('LOGIN');
  const [userRole, setUserRole] = useState<'admin' | 'associate' | 'driver' | undefined>(undefined);
  const [userName, setUserName] = useState<string>('');
  const [userLogo, setUserLogo] = useState<string>('');
  const [prevScreen, setPrevScreen] = useState<Screen>('LOGIN');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Fetch user roles
        supabase
          .from('profiles')
          .select('role, name, association_id')
          .eq('user_id', session.user.id)
          .then(async ({ data, error }) => {
            if (data && data.length > 0) {
              const preferredRole = localStorage.getItem('preferredRole');
              // Try to find the preferred role in the user's profiles
              const match = data.find(p => p.role === preferredRole) || data[0];

              // Fetch Logo if we have an association_id
              let logo = '';
              if (match.association_id) {
                const { data: assocData } = await supabase
                  .from('associations')
                  .select('logo')
                  .eq('id', match.association_id)
                  .maybeSingle();
                if (assocData?.logo) logo = assocData.logo;
              }

              handleLogin(match.role as 'admin' | 'associate' | 'driver', match.name, logo);
            }
            // Even if no data, we stop loading
            setLoading(false);
          }, () => {
            // Handle rejection
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    }).catch(() => {
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setCurrentScreen('LOGIN');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = (role: 'admin' | 'associate' | 'driver', name?: string, logo?: string) => {
    setUserRole(role);
    if (name) setUserName(name);
    if (logo) setUserLogo(logo);
    if (role === 'admin') setCurrentScreen('ADMIN_DASHBOARD');
    else if (role === 'associate') setCurrentScreen('ASSOCIATE_DASHBOARD');
    else setCurrentScreen('DRIVER_DASHBOARD');
  };

  const navigateTo = (screen: Screen) => {
    setPrevScreen(currentScreen);
    setCurrentScreen(screen);
  };

  const goHome = () => {
    if (userRole === 'admin') setCurrentScreen('ADMIN_DASHBOARD');
    else if (userRole === 'associate') setCurrentScreen('ASSOCIATE_DASHBOARD');
    else setCurrentScreen('DRIVER_DASHBOARD');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('preferredRole');
    localStorage.removeItem('selectedAssoc');
    setCurrentScreen('LOGIN');
  };

  const renderScreen = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-screen bg-background-light">
          <div className="w-16 h-16 border-4 border-[#10c65c]/20 border-t-[#10c65c] rounded-full animate-spin mb-4"></div>
          <p className="text-[#10c65c] font-bold animate-pulse">Carregando...</p>
        </div>
      );
    }

    switch (currentScreen) {
      case 'REGISTER': return <RegistrationScreen navigate={navigateTo} onSuccess={() => navigateTo('LOGIN')} />;
      case 'LOGIN': return <LoginScreen onLogin={handleLogin} onRegister={() => navigateTo('REGISTER')} />;
      case 'ADMIN_DASHBOARD': return <AdminDashboard navigate={navigateTo} userName={userName} userLogo={userLogo} />;
      case 'ASSOCIATE_DASHBOARD': return <AssociateDashboard navigate={navigateTo} userName={userName} userLogo={userLogo} />;
      case 'DRIVER_DASHBOARD': return <DriverDashboard navigate={navigateTo} userName={userName} userLogo={userLogo} />;
      case 'COLLECTION_REG': return <CollectionRegistration navigate={navigateTo} onFinish={goHome} />;
      case 'ENTRY_REG': return <EntryRegistration navigate={navigateTo} onSuccess={goHome} userRole={userRole} />;
      case 'SALE_REG': return <SaleRegistration navigate={navigateTo} onSuccess={goHome} />;
      case 'REPORTS': return <ReportsScreen navigate={navigateTo} />;
      case 'BUYER_REG': return <BuyerRegistration navigate={navigateTo} />;
      case 'HISTORY': return <HistoryScreen navigate={navigateTo} userRole={userRole || undefined} />;
      case 'MATERIAL_REG': return <MaterialRegistration navigate={navigateTo} />;
      case 'ROUTES_MAP': return <RoutesScreen navigate={navigateTo} userRole={userRole || undefined} />;
      case 'PROFILE': return <ProfileScreen navigate={navigateTo} onLogout={handleLogout} userRole={userRole || 'associate'} userName={userName} />;
      case 'SETTINGS': return <SettingsScreen navigate={navigateTo} onBack={() => navigateTo(prevScreen)} />;
      case 'NOTIFICATIONS': return <NotificationsScreen navigate={navigateTo} onBack={() => navigateTo(prevScreen)} />;
      case 'SALES_HISTORY': return <SalesHistoryScreen navigate={navigateTo} />;
      case 'MATERIALS_LIST': return <MaterialsListScreen navigate={navigateTo} />;
      case 'ENTRIES_HISTORY': return <EntriesHistoryScreen navigate={navigateTo} />;
      case 'BUYERS_LIST': return <BuyersListScreen navigate={navigateTo} />;
      default: return <LoginScreen onLogin={handleLogin} />;
    }
  };

  return (
    <div className="h-screen w-screen bg-background-light flex justify-center overflow-hidden">
      <div className="w-full bg-white h-full relative overflow-hidden animate-page">
        {renderScreen()}
      </div>
    </div>
  );
};

export default App;
