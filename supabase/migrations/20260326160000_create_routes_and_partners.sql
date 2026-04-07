-- Create Routes Table
CREATE TABLE IF NOT EXISTS public.routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    association_id UUID REFERENCES public.associations(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    vehicle_plate TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create Partners Table
CREATE TABLE IF NOT EXISTS public.partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    association_id UUID REFERENCES public.associations(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Pessoa Física', 'Empresa')),
    phone TEXT,
    street TEXT,
    number TEXT,
    neighborhood TEXT,
    city TEXT,
    route_id UUID REFERENCES public.routes(id) ON DELETE SET NULL,
    collection_days TEXT[] NOT NULL, -- Array of days (e.g., ['Segunda', 'Quarta'])
    frequency TEXT NOT NULL CHECK (frequency IN ('Semanal', 'Quinzenal', 'Mensal')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create Partner Materials Relationship Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.partner_materials (
    partner_id UUID REFERENCES public.partners(id) ON DELETE CASCADE NOT NULL,
    material_id UUID REFERENCES public.materials(id) ON DELETE CASCADE NOT NULL,
    PRIMARY KEY (partner_id, material_id)
);

-- Enable RLS for Routes
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read routes from their association" 
ON public.routes FOR SELECT 
USING ( association_id = (SELECT association_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1) );

CREATE POLICY "Users can insert routes into their association" 
ON public.routes FOR INSERT 
WITH CHECK ( association_id = (SELECT association_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1) );

CREATE POLICY "Users can update routes in their association" 
ON public.routes FOR UPDATE 
USING ( association_id = (SELECT association_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1) );

CREATE POLICY "Users can delete routes from their association" 
ON public.routes FOR DELETE 
USING ( association_id = (SELECT association_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1) );

-- Enable RLS for Partners
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read partners from their association" 
ON public.partners FOR SELECT 
USING ( association_id = (SELECT association_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1) );

CREATE POLICY "Users can insert partners into their association" 
ON public.partners FOR INSERT 
WITH CHECK ( association_id = (SELECT association_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1) );

CREATE POLICY "Users can update partners in their association" 
ON public.partners FOR UPDATE 
USING ( association_id = (SELECT association_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1) );

CREATE POLICY "Users can delete partners from their association" 
ON public.partners FOR DELETE 
USING ( association_id = (SELECT association_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1) );

-- Enable RLS for Partner Materials (Inherit from partner access)
ALTER TABLE public.partner_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage partner materials for their association" 
ON public.partner_materials FOR ALL
USING ( partner_id IN (SELECT id FROM public.partners WHERE association_id = (SELECT association_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1) ) );

-- Create Indexes
CREATE INDEX IF NOT EXISTS routes_association_id_idx ON public.routes (association_id);
CREATE INDEX IF NOT EXISTS partners_association_id_idx ON public.partners (association_id);
CREATE INDEX IF NOT EXISTS partners_route_id_idx ON public.partners (route_id);
