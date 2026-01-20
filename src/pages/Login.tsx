import { useState } from 'react';
import { Recycle, Truck, Scale, ShoppingCart, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const roles: { id: UserRole; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'motorista', label: 'Motorista', icon: Truck },
  { id: 'operador', label: 'Operador', icon: Scale },
  { id: 'vendedor', label: 'Vendedor', icon: ShoppingCart },
  { id: 'administrador', label: 'Admin', icon: Shield },
];

export default function Login() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('motorista');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error('Digite seu nome');
      return;
    }
    
    if (password.length < 4) {
      toast.error('Senha deve ter pelo menos 4 caracteres');
      return;
    }

    const success = login(username, password, selectedRole);
    if (success) {
      toast.success(`Bem-vindo, ${username}!`);
    } else {
      toast.error('Erro ao fazer login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/20 to-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center mx-auto shadow-lg">
            <Recycle className="w-14 h-14 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">ReciclaPro</h1>
            <p className="text-muted-foreground">Gestão de Recicláveis</p>
          </div>
        </div>

        {/* Role Selection */}
        <div className="space-y-3">
          <Label className="text-base">Selecione seu perfil</Label>
          <div className="grid grid-cols-2 gap-3">
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;
              
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200',
                    isSelected 
                      ? 'border-primary bg-primary/10 text-primary' 
                      : 'border-border bg-card text-muted-foreground hover:border-primary/50'
                  )}
                >
                  <Icon className="w-8 h-8" />
                  <span className="font-medium text-sm">{role.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-base">Seu Nome</Label>
            <Input
              id="username"
              type="text"
              placeholder="Digite seu nome"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-14 text-lg rounded-xl"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-base">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-14 text-lg rounded-xl"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-14 text-lg font-semibold rounded-xl shadow-lg"
          >
            ENTRAR
          </Button>
        </form>
      </div>
    </div>
  );
}
