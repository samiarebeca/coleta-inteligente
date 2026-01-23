import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (isRegister) {
      const ok = await register(email, password);
      if (ok) {
        navigate('/');
      } else {
        setError('Falha ao criar conta. Verifique os dados.');
      }
    } else {
      const ok = await login(email, password);
      if (ok) {
        navigate('/');
      } else {
        setError('Credenciais inválidas.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-lg bg-card p-6 shadow-lg"
      >
        <h2 className="text-center text-2xl font-bold">
          {isRegister ? 'Criar Conta' : 'Login'}
        </h2>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium" htmlFor="password">
            Senha
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-primary px-4 py-2 font-semibold text-primary-foreground hover:bg-primary/90"
        >
          {loading ? 'Aguarde...' : isRegister ? 'Cadastrar' : 'Entrar'}
        </button>
        <p className="text-center text-sm">
          {isRegister ? (
            <span>
              Já tem conta?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="text-primary underline"
              >
                Faça login
              </button>
            </span>
          ) : (
            <span>
              Não tem conta?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className="text-primary underline"
              >
                Cadastre‑se
              </button>
            </span>
          )}
        </p>
      </form>
    </div>
  );
}
