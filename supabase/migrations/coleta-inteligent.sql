-- ATUALIZAÇÃO PARA PERFIS DISTINTOS POR ROLE

-- 1. Vamos mover tudo para uma tabela 'profiles' que inclui o role na chave primária
-- Isso permite (userA, admin) -> Nome "Adm Ricardo" e (userA, driver) -> Nome "Motorista Rick"

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
-- Apaga tabelas antigas para recomeçar limpo
DROP TABLE IF EXISTS public.collection_point_status CASCADE; -- Depende de clients
DROP TABLE IF EXISTS public.route_collections CASCADE; -- Depende de routes
DROP TABLE IF EXISTS public.sales CASCADE; -- Depende de users/buyers
DROP TABLE IF EXISTS public.entries CASCADE; -- Depende de users
DROP TABLE IF EXISTS public.clients CASCADE; 
DROP TABLE IF EXISTS public.routes CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Recriar Enum roles
DROP TYPE IF EXISTS public.app_role CASCADE;
CREATE TYPE public.app_role AS ENUM ('admin', 'associate', 'driver');

-- Nova Tabela Associations
CREATE TABLE public.associations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    cnpj TEXT NOT NULL,
    label TEXT,
    logo TEXT, -- Base64 encoded logo of the association
    owner_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.associations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read associations" ON public.associations FOR SELECT USING (true); -- Allow registration to see list

-- Seed Associations
INSERT INTO public.associations (name, cnpj, label, owner_email, logo) 
VALUES 
('Associação Recicla Mais', '12.345.678/0001-90', 'Recicla Mais', 'admin@reciclamais.com', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzEwYzY1YyI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgM2MxLjY2IDAgMyAxLjM0IDMgM3MtMS4zNCAzLTMgMy0zLTEuMzQtMy0zIDEuMzQtMyAzLTN6bTAgMTQuMmMtMi41IDAtNC43MS0xLjI4LTYtMy4yMi4wMy0xLjk5IDQtMy4wOCA2LTMuMDggMS45OSAwIDUuOTcgMS4wOSA2IDMuMDgtMS4yOSAxLjk0LTMuNSAzLjIyLTYgMy4yMnoiLz48L3N2Zz4='),
('Cooperativa Verde', '98.765.432/0001-10', 'Coop Verde', 'contato@coopverde.com', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzEwYzY1YyI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgM2MxLjY2IDAgMyAxLjM0IDMgM3MtMS4zNCAzLTMgMy0zLTEuMzQtMy0zIDEuMzQtMyAzLTN6bTAgMTQuMmMtMi41IDAtNC43MS0xLjI4LTYtMy4yMi4wMy0xLjk5IDQtMy4wOCA2LTMuMDggMS45OSAwIDUuOTcgMS4wOSA2IDMuMDgtMS4yOSAxLjk0LTMuNSAzLjIyLTYgMy4yMnoiLz48L3N2Zz4=');

-- Nova Tabela Profiles (Funde perfis e roles)
CREATE TABLE public.profiles (
    id UUID DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    name TEXT NOT NULL,
    email TEXT, 
    phone TEXT,
    avatar_url TEXT,
    association_id UUID REFERENCES public.associations(id), -- Association Link
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    
    PRIMARY KEY (user_id, role), -- Chave composta!
    UNIQUE (id) -- ID único global para referências fáceis
);

-- RLS Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can create their own profiles" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profiles" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Recriar trigger de cadastro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, role, name, email, association_id)
  VALUES (
    new.id, 
    COALESCE((new.raw_user_meta_data->>'role')::app_role, 'associate'::app_role),
    COALESCE(new.raw_user_meta_data->>'name', 'Novo Usuário'),
    new.email,
    (new.raw_user_meta_data->>'association_id')::uuid
  )
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Restaurar outras tabelas (Simplificadas para o que precisamos agora)
-- Ex: Materials
CREATE TABLE IF NOT EXISTS public.materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price_per_kg DECIMAL(10,2) DEFAULT 0,
    association_id UUID REFERENCES public.associations(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read materials" ON public.materials FOR SELECT USING (true);
INSERT INTO public.materials (name, price_per_kg) VALUES ('Papelão', 0.50),('PET', 1.50) ON CONFLICT DO NOTHING;

-- Ex: Routes (referencia profiles? Geralmente apenas user_id, mas idealmente profile_id se for específico de um driver)
-- Por enquanto manteremos simples referenciando auth.users(id) nas outras tabelas a menos que precise diferenciar qual PERFIL fez a ação.
-- Para simplificar, LOGS de ação geralmente usam user_id.
