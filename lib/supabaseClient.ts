
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase URL or Anon Key. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

export const resolveActiveAssociationId = async () => {
    const storedAssociationId = localStorage.getItem('selectedAssoc');
    if (storedAssociationId) return storedAssociationId;

    const preferredRole = localStorage.getItem('preferredRole');
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user?.id) return null;

    const { data: profiles } = await supabase
      .from('profiles')
      .select('role, association_id')
      .eq('user_id', session.user.id);

    if (!profiles || profiles.length === 0) return null;

    const activeProfile = profiles.find(profile => profile.role === preferredRole) || profiles[0];
    if (activeProfile?.association_id) {
        localStorage.setItem('selectedAssoc', activeProfile.association_id);
    }
    return activeProfile?.association_id || null;
};
