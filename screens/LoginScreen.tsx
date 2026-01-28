
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

import AssociationSelect from '../components/AssociationSelect';

interface LoginScreenProps {
  onLogin: (role: 'admin' | 'associate' | 'driver', name?: string, logo?: string) => void;
  onRegister: () => void;
}

type RoleOption = {
  id: 'admin' | 'associate' | 'driver';
  label: 'ADMINISTRADOR' | 'ASSOCIADO' | 'MOTORISTA';
  icon: string;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onRegister }) => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  // We still keep the selector to *show* options, but the actual login depends on the account.
  // OR, we can use the selector to guide what to show, but typically login is just email/pass.
  // The prompt implies: "inform email, password and profile".
  // If the user *must* select the profile to login, we can verify if they have that profile.
  // For now, let's keep the UI as requested, but we will fetch the REAL role from DB to verify.
  const [selectedRole, setSelectedRole] = useState<'admin' | 'associate' | 'driver'>('admin');
  const [associations, setAssociations] = useState<{ id: string, label: string, logo?: string }[]>([]);
  const [selectedAssoc, setSelectedAssoc] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    // Fetch associations
    supabase.from('associations').select('id, label, logo').then(({ data }) => {
      if (data) {
        setAssociations(data);
        if (data.length > 0) setSelectedAssoc(data[0].id);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: pass,
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Fetch the user's role SPECIFICALLY matching the selected one AND the selected Association
        const { data: roleData, error: roleError } = await supabase
          .from('profiles')
          .select('role, name, association_id')
          .eq('user_id', authData.user.id)
          .eq('role', selectedRole) // Check if they HAVE this specific role
          .maybeSingle(); // Use maybeSingle to avoid error if not found

        if (roleError) throw roleError;

        if (!roleData) {
          // If no row found, the user exists but DOES NOT have this profile.
          setError(`Este usuário ainda não possui cadastro como ${selectedRole.toUpperCase()}.`);
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        // 3. Verify Association Link
        if (roleData.association_id && roleData.association_id !== selectedAssoc) {
          setError(`Este usuário pertence a outra associação.`);
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        // 4. Fetch Association Logo
        let logo = '';
        if (roleData.association_id) {
          const { data: assocData } = await supabase
            .from('associations')
            .select('logo')
            .eq('id', roleData.association_id)
            .maybeSingle();
          if (assocData?.logo) logo = assocData.logo;
        }

        // If found, proceed
        localStorage.setItem('preferredRole', selectedRole);
        localStorage.setItem('selectedAssoc', selectedAssoc);
        onLogin(selectedRole, roleData.name, logo);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      // Translate common errors
      if (err.message === 'Invalid login credentials') {
        setError('Email ou senha incorretos.');
      } else {
        setError(err.message || 'Falha no logino.');
      }
      await supabase.auth.signOut();
    } finally {
      setLoading(false);
    }
  };

  const roles: RoleOption[] = [
    { id: 'admin', label: 'ADMINISTRADOR', icon: 'admin_panel_settings' },
    { id: 'associate', label: 'ASSOCIADO', icon: 'handshake' },
    { id: 'driver', label: 'MOTORISTA', icon: 'local_shipping' },
  ];

  return (
    <div className="flex flex-col h-full min-h-screen items-center justify-center p-8 bg-[#f6f8f7]">
      <div className="mb-10 flex flex-col items-center w-full">
        {/* Logo Container */}
        <div className="w-[100px] h-[100px] rounded-3xl bg-white flex items-center justify-center mb-5 shadow-sm border-2 border-[#10c65c]/10 p-4">
          <div className="w-full h-full bg-center bg-contain bg-no-repeat"
            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD3xgudUS6XbiMQ69I3Qic5C3zoryTDvIEKt2BzOJWb0kPL-eO6aqI39-3PkJ-A1m1RFoqQHytUkwc2jgQDnRYXn89uV0N9LUfoqtCSm2-yFrChfRoT1RBP6XmNc7LEZ19qMdpwE96czLtZ1EpJjuwkEfLmODyX16yphQarUSTWQktNCbpzRsSNLCSrpu7Aq2E2cuiI01DNink9A3i4FBPuepET22j8vpYDUqmPh3uysa1Dto_drhOiTsH1k4loBGq1IbS3aBLmkHM")' }}>
          </div>
        </div>
        <h1 className="text-[28px] font-black tracking-tighter text-center text-[#0f1a14] mb-1 uppercase">
          Coleta Inteligente
        </h1>
        <p className="text-sm font-bold text-[#10c65c]/60 text-center uppercase tracking-widest">
          SISTEMA DE GESTÃO
        </p>
      </div>

      <form className="w-full flex flex-col gap-5" onSubmit={handleSubmit}>

        {/* Association Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Entrar na Associação</label>
          <AssociationSelect
            value={selectedAssoc}
            onChange={setSelectedAssoc}
            associations={associations}
            loading={associations.length === 0}
          />
        </div>

        {/* Role Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Selecione seu Perfil</label>
          <div className="grid grid-cols-3 gap-2">
            {roles.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRole(role.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all duration-300 ${selectedRole === role.id
                  ? 'border-[#10c65c] bg-[#10c65c]/5 text-[#10c65c]'
                  : 'border-white bg-white text-gray-400 shadow-sm'
                  }`}
              >
                <span className={`material-symbols-outlined text-[24px] mb-1 ${selectedRole === role.id ? 'filled-icon' : ''}`}>
                  {role.icon}
                </span>
                <span className="text-[8px] font-black uppercase tracking-tighter text-center">
                  {role.label.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="relative group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#10c65c] transition-colors text-[24px]">
            person
          </span>
          <input
            type="text" // Changed from just 'text' input for username to support email if needed, but keeping text is fine if we parse it. Supabase expects email usually.
            className="block w-full pl-12 pr-4 py-4 h-14 bg-white border-none rounded-2xl text-base font-bold shadow-sm focus:ring-2 focus:ring-[#10c65c] transition-all"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="relative group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#10c65c] transition-colors text-[24px]">
            lock
          </span>
          <input
            type="password"
            className="block w-full pl-12 pr-12 py-4 h-14 bg-white border-none rounded-2xl text-base font-bold shadow-sm focus:ring-2 focus:ring-[#10c65c] transition-all"
            placeholder="Senha"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            required
          />
          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 cursor-pointer hover:text-gray-500">
            visibility
          </span>
        </div>

        {error && (
          <div className="text-red-500 text-sm font-bold text-center bg-red-50 p-2 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex justify-end mt-[-10px]">
          <button type="button" className="text-xs font-bold text-[#10c65c] hover:underline" onClick={onRegister}>
            Registrar
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-16 bg-[#10c65c] hover:bg-[#0da54b] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-lg font-black rounded-2xl shadow-lg shadow-[#10c65c]/20 flex items-center justify-center gap-3 uppercase tracking-wider transition-all active:scale-95"
        >
          {loading ? (
            <span>Entrando...</span>
          ) : (
            <>
              <span>Acessar Painel</span>
              <span className="material-symbols-outlined font-bold text-[24px]">arrow_forward</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-auto py-6 flex items-center gap-2 text-xs font-bold text-gray-300 uppercase tracking-widest">
        <span>Coleta Inteligente © 2024</span>
        <span className="text-gray-200">•</span>
        <span className="flex items-center gap-1 text-[#10c65c]/50">
          <span className="size-1.5 bg-[#10c65c] rounded-full animate-pulse"></span>
          Sistema Ativo
        </span>
      </div>
    </div>
  );
};

export default LoginScreen;

