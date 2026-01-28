
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import AssociationSelect from '../components/AssociationSelect';

interface RegistrationScreenProps {
    navigate: (screen: any) => void;
    onSuccess: () => void;
}

type RoleOption = {
    id: 'admin' | 'associate' | 'driver';
    label: 'ADMINISTRADOR' | 'ASSOCIADO' | 'MOTORISTA';
    icon: string;
    disabled?: boolean;
};

const RegistrationScreen: React.FC<RegistrationScreenProps> = ({ navigate, onSuccess }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedRole, setSelectedRole] = useState<'admin' | 'associate' | 'driver'>('associate');
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

    const roles: RoleOption[] = [
        { id: 'admin', label: 'ADMINISTRADOR', icon: 'admin_panel_settings' },
        { id: 'associate', label: 'ASSOCIADO', icon: 'handshake' },
        { id: 'driver', label: 'MOTORISTA', icon: 'local_shipping', disabled: true },
    ];

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Attempt to sign up
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name,
                        role: selectedRole,
                        association_id: selectedAssoc
                    },
                },
            });

            if (error) {
                // If user already exists, try to log in and add the role
                if (error.status === 400 || error.message.includes('already registered')) {
                    // Try to sign in to verify ownership
                    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                        email,
                        password
                    });

                    if (loginError) {
                        throw new Error('Este email já está cadastrado, mas a senha está incorreta. Não foi possível adicionar o novo perfil.');
                    }

                    if (loginData.user) {
                        // User owns the account. Insert the new PROFILE for this role.
                        const { error: profileError } = await supabase.from('profiles').insert({
                            user_id: loginData.user.id,
                            role: selectedRole,
                            email: email,
                            name: name,
                            association_id: selectedAssoc
                        });

                        if (profileError) {
                            if (profileError.code === '23505') { // Unique violation
                                throw new Error(`Este usuário já possui o perfil de ${selectedRole}.`);
                            }
                            throw profileError;
                        }

                        alert(`Perfil de ${selectedRole} adicionado com sucesso à sua conta existente! Faça login.`);
                        navigate('LOGIN');
                        return; // Done
                    }
                }
                throw error;
            }

            if (data.user) {
                alert('Cadastro realizado com sucesso! Faça login.');
                navigate('LOGIN');
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao registrar.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full min-h-screen items-center justify-center p-8 bg-[#f6f8f7]">
            <div className="mb-6 flex flex-col items-center w-full">
                <h1 className="text-[24px] font-black tracking-tighter text-center text-[#0f1a14] mb-1 uppercase">
                    Nova Conta
                </h1>
                <p className="text-xs font-bold text-[#10c65c]/60 text-center uppercase tracking-widest">
                    Preencha seus dados
                </p>
            </div>

            <form className="w-full flex flex-col gap-4" onSubmit={handleRegister}>

                {/* Association Selector */}
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Associação</label>
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
                                disabled={role.disabled}
                                onClick={() => !role.disabled && setSelectedRole(role.id)}
                                className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all duration-300 ${role.disabled
                                    ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed opacity-50'
                                    : selectedRole === role.id
                                        ? 'border-[#10c65c] bg-[#10c65c]/5 text-[#10c65c]'
                                        : 'border-white bg-white text-gray-400 shadow-sm'
                                    }`}
                            >
                                <span className={`material-symbols-outlined text-[20px] mb-1 ${selectedRole === role.id ? 'filled-icon' : ''}`}>
                                    {role.icon}
                                </span>
                                <span className="text-[7px] font-black uppercase tracking-tighter text-center">
                                    {role.label.split(' ')[0]}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Name */}
                <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#10c65c] transition-colors text-[20px]">
                        badge
                    </span>
                    <input
                        type="text"
                        className="block w-full pl-12 pr-4 py-3 h-12 bg-white border-none rounded-xl text-sm font-bold shadow-sm focus:ring-2 focus:ring-[#10c65c] transition-all"
                        placeholder="Nome Completo"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                {/* Email */}
                <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#10c65c] transition-colors text-[20px]">
                        mail
                    </span>
                    <input
                        type="email"
                        className="block w-full pl-12 pr-4 py-3 h-12 bg-white border-none rounded-xl text-sm font-bold shadow-sm focus:ring-2 focus:ring-[#10c65c] transition-all"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                {/* Password */}
                <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#10c65c] transition-colors text-[20px]">
                        lock
                    </span>
                    <input
                        type="password"
                        className="block w-full pl-12 pr-4 py-3 h-12 bg-white border-none rounded-xl text-sm font-bold shadow-sm focus:ring-2 focus:ring-[#10c65c] transition-all"
                        placeholder="Senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 bg-[#10c65c] hover:bg-[#0da54b] text-white text-base font-black rounded-xl shadow-lg shadow-[#10c65c]/20 flex items-center justify-center gap-3 uppercase tracking-wider transition-all active:scale-95 mt-2"
                >
                    {loading ? 'Criando...' : 'Criar Conta'}
                </button>

                <button
                    type="button"
                    onClick={() => navigate('LOGIN')}
                    className="text-xs font-bold text-gray-400 hover:text-[#10c65c] mt-4 uppercase tracking-wide"
                >
                    Voltar para Login
                </button>
            </form>
        </div>
    );
};

export default RegistrationScreen;
