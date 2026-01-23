
-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('administrador', 'motorista', 'operador_balanca', 'gestor_vendas');

-- Create enum for material categories
CREATE TYPE public.material_category AS ENUM ('papel', 'plastico', 'metal', 'vidro');

-- Create enum for collection point status
CREATE TYPE public.collection_status AS ENUM ('pendente', 'realizado', 'nao_coletado');

-- Create enum for origin type
CREATE TYPE public.origin_type AS ENUM ('cliente', 'catador_avulso');

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    name TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

-- Create materials table
CREATE TABLE public.materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category material_category NOT NULL,
    icon TEXT NOT NULL DEFAULT 'Package',
    color TEXT NOT NULL DEFAULT '#6B7280',
    price_per_kg DECIMAL(10,2) NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create material sub-classifications
CREATE TABLE public.material_subclassifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id UUID REFERENCES public.materials(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    price_modifier DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create routes table
CREATE TABLE public.routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create clients (collection points) table
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    route_id UUID REFERENCES public.routes(id) ON DELETE SET NULL,
    type origin_type NOT NULL DEFAULT 'cliente',
    order_in_route INTEGER DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create buyers table
CREATE TABLE public.buyers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    materials_of_interest TEXT[],
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create route collections (daily route execution) table
CREATE TABLE public.route_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID REFERENCES public.routes(id) ON DELETE CASCADE NOT NULL,
    collection_date DATE NOT NULL DEFAULT CURRENT_DATE,
    started_at TIMESTAMP WITH TIME ZONE,
    finished_at TIMESTAMP WITH TIME ZONE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create collection point status (per route execution) table
CREATE TABLE public.collection_point_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_collection_id UUID REFERENCES public.route_collections(id) ON DELETE CASCADE NOT NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
    status collection_status NOT NULL DEFAULT 'pendente',
    observation TEXT,
    collected_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (route_collection_id, client_id)
);

-- Create entries table
CREATE TABLE public.entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id UUID REFERENCES public.materials(id) ON DELETE RESTRICT NOT NULL,
    subclassification_id UUID REFERENCES public.material_subclassifications(id) ON DELETE SET NULL,
    weight DECIMAL(10,2) NOT NULL CHECK (weight > 0),
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    route_id UUID REFERENCES public.routes(id) ON DELETE SET NULL,
    origin_type origin_type NOT NULL DEFAULT 'cliente',
    observation TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sales table
CREATE TABLE public.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id UUID REFERENCES public.materials(id) ON DELETE RESTRICT NOT NULL,
    subclassification_id UUID REFERENCES public.material_subclassifications(id) ON DELETE SET NULL,
    weight DECIMAL(10,2) NOT NULL CHECK (weight > 0),
    buyer_id UUID REFERENCES public.buyers(id) ON DELETE SET NULL NOT NULL,
    price_per_kg DECIMAL(10,2) NOT NULL CHECK (price_per_kg >= 0),
    total_value DECIMAL(12,2) NOT NULL CHECK (total_value >= 0),
    observation TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_subclassifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_point_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user has any role
CREATE OR REPLACE FUNCTION public.is_authenticated_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_roles (only admins can manage)
CREATE POLICY "Authenticated users can view roles" ON public.user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'administrador'));
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'administrador'));

-- RLS Policies for materials (everyone can read, admins can modify)
CREATE POLICY "Anyone can view materials" ON public.materials FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert materials" ON public.materials FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'administrador'));
CREATE POLICY "Admins can update materials" ON public.materials FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'administrador'));
CREATE POLICY "Admins can delete materials" ON public.materials FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'administrador'));

-- RLS Policies for material_subclassifications
CREATE POLICY "Anyone can view subclassifications" ON public.material_subclassifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert subclassifications" ON public.material_subclassifications FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'administrador'));
CREATE POLICY "Admins can update subclassifications" ON public.material_subclassifications FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'administrador'));
CREATE POLICY "Admins can delete subclassifications" ON public.material_subclassifications FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'administrador'));

-- RLS Policies for routes
CREATE POLICY "Anyone can view routes" ON public.routes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert routes" ON public.routes FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'administrador'));
CREATE POLICY "Admins can update routes" ON public.routes FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'administrador'));
CREATE POLICY "Admins can delete routes" ON public.routes FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'administrador'));

-- RLS Policies for clients
CREATE POLICY "Anyone can view clients" ON public.clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert clients" ON public.clients FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'administrador'));
CREATE POLICY "Admins can update clients" ON public.clients FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'administrador'));
CREATE POLICY "Admins can delete clients" ON public.clients FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'administrador'));

-- RLS Policies for buyers
CREATE POLICY "Anyone can view buyers" ON public.buyers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert buyers" ON public.buyers FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'administrador'));
CREATE POLICY "Admins can update buyers" ON public.buyers FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'administrador'));
CREATE POLICY "Admins can delete buyers" ON public.buyers FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'administrador'));

-- RLS Policies for route_collections
CREATE POLICY "Anyone can view route_collections" ON public.route_collections FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert route_collections" ON public.route_collections FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own route_collections" ON public.route_collections FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for collection_point_status
CREATE POLICY "Anyone can view collection_point_status" ON public.collection_point_status FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert collection_point_status" ON public.collection_point_status FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update collection_point_status" ON public.collection_point_status FOR UPDATE TO authenticated USING (true);

-- RLS Policies for entries
CREATE POLICY "Anyone can view entries" ON public.entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert entries" ON public.entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own entries" ON public.entries FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for sales
CREATE POLICY "Anyone can view sales" ON public.sales FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert sales" ON public.sales FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sales" ON public.sales FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON public.materials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON public.routes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_buyers_updated_at BEFORE UPDATE ON public.buyers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_collection_point_status_updated_at BEFORE UPDATE ON public.collection_point_status FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default materials
INSERT INTO public.materials (name, category, icon, color, price_per_kg) VALUES
('Papelão', 'papel', 'Package', '#F97316', 0.50),
('Papel Branco', 'papel', 'FileText', '#F97316', 0.80),
('Jornal', 'papel', 'FileText', '#F97316', 0.30),
('PET', 'plastico', 'Wine', '#8B5CF6', 1.50),
('PEAD', 'plastico', 'Container', '#8B5CF6', 1.20),
('PP', 'plastico', 'Film', '#8B5CF6', 0.90),
('Alumínio', 'metal', 'CircleDot', '#6B7280', 5.00),
('Ferro', 'metal', 'Wrench', '#6B7280', 0.40),
('Cobre', 'metal', 'Cable', '#6B7280', 25.00),
('Vidro Transparente', 'vidro', 'GlassWater', '#10B981', 0.15),
('Vidro Colorido', 'vidro', 'Wine', '#10B981', 0.10);

-- Insert default routes
INSERT INTO public.routes (name, day_of_week) VALUES
('Rota A - Centro', 1),
('Rota B - Norte', 2),
('Rota C - Sul', 3),
('Rota D - Leste', 4);
