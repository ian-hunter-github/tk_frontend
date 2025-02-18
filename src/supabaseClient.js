import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bqumdvfrgjcwcnbdbrps.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxdW1kdmZyZ2pjd2NuYmRicnBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk4ODQ3NDIsImV4cCI6MjA1NTQ2MDc0Mn0.1u8pE3cLH6YjQIW1aiYUbyGiZ8__tb-ybChNf961fuE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
