/**
 * Schema-backed types for the initial migration. Refresh these against a running
 * local Supabase instance with `npm run db:types` after changing migrations.
 */
export type AppRole = 'admin' | 'player'
export type MediaType = 'youtube' | 'link'

export type Database = {
  public: {
    Tables: {
      profiles: { Row: { id: string; login_name: string; first_name: string; last_name: string; role: AppRole; created_at: string; updated_at: string } }
      players: { Row: { id: string; profile_id: string; position: string | null; shirt_number: number | null; avatar_path: string | null; active: boolean; created_at: string; updated_at: string } }
      periods: { Row: { id: string; name: string; sort_order: number; is_current: boolean; created_at: string; updated_at: string } }
      progress_entries: { Row: { id: string; player_id: string; period_id: string; points: number; title: string; description: string | null; created_by: string; created_at: string; updated_at: string } }
      player_questions: { Row: { id: string; player_id: string; period_id: string | null; question: string; answer: string; category: string | null; sort_order: number; created_by: string; created_at: string; updated_at: string } }
      player_media: { Row: { id: string; player_id: string; period_id: string | null; title: string; description: string | null; url: string; media_type: MediaType; sort_order: number; created_by: string; created_at: string; updated_at: string } }
    }
    Views: Record<string, never>
    Functions: {
      get_my_context: { Args: Record<PropertyKey, never>; Returns: Array<{ role: AppRole; player_id: string | null; full_name: string; active: boolean }> }
      get_team_growth_summary: { Args: Record<PropertyKey, never>; Returns: Array<{ current_period_id: string | null; current_period_name: string | null; player_id: string; first_name: string; last_name: string; position: string | null; shirt_number: number | null; avatar_path: string | null; current_points: number; total_points: number }> }
      create_period_and_make_current: { Args: { period_name: string }; Returns: Database['public']['Tables']['periods']['Row'] }
      set_current_period: { Args: { target_period_id: string }; Returns: Database['public']['Tables']['periods']['Row'] }
      convert_learning_item_to_progress: {
        Args: { learning_item_id: string; target_period_id: string; progress_points: number; progress_title: string; progress_description: string | null }
        Returns: Database['public']['Tables']['progress_entries']['Row']
      }
    }
    Enums: { app_role: AppRole; media_type: MediaType }
    CompositeTypes: Record<string, never>
  }
}
