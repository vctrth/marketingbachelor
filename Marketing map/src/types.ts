// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Location {
  lat: number;
  lng: number;
}

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  phone?: string;
  current_lat?: number;
  current_lng?: number;
  address?: string;
  city?: string;
  country?: string;
  max_distance_km: number;
  preferred_categories: string[];
  preferred_tags: string[];
  availability?: any;
  rating: number;
  total_matches: number;
  successful_matches: number;
  is_verified: boolean;
  is_active: boolean;
  last_active_at: string;
  created_at: string;
  updated_at: string;
}

export interface Listing {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  type: 'offer' | 'request' | 'rental' | 'service';
  category: string;
  tags: string[];
  lat: number;
  lng: number;
  address?: string;
  city?: string;
  available_from?: string;
  available_until?: string;
  availability_schedule?: any;
  price?: number;
  price_unit?: 'hour' | 'day' | 'week' | 'month' | 'once';
  images: string[];
  is_active: boolean;
  is_archived: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
}

export type MatchStatus = 'pending' | 'accepted' | 'rejected' | 'expired' | 'cancelled' | 'completed';
export type UserMatchStatus = 'pending' | 'accepted' | 'rejected';

export interface Match {
  id: string;
  user_a_id: string;
  user_b_id: string;
  listing_id?: string;
  initiator_id: string;
  match_score: number;
  distance_km: number;
  score_breakdown: {
    distance_score: number;
    tag_overlap_score: number;
    recency_score: number;
    reputation_score: number;
  };
  status: MatchStatus;
  user_a_status?: UserMatchStatus;
  user_b_status?: UserMatchStatus;
  matched_at: string;
  responded_at?: string;
  expires_at: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  match_id: string;
  participant_a_id: string;
  participant_b_id: string;
  last_message_at: string;
  last_message_preview?: string;
  unread_count_a: number;
  unread_count_b: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'system';
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export type NotificationType = 
  | 'new_match'
  | 'match_accepted'
  | 'match_rejected'
  | 'new_message'
  | 'listing_expired'
  | 'match_expiring_soon';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message?: string;
  match_id?: string;
  listing_id?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface MatchCandidate {
  listing_id: string;
  owner_id: string;
  title: string;
  category: string;
  tags: string[];
  distance_km: number;
  match_score: number;
  score_breakdown: {
    distance_score: number;
    tag_overlap_score: number;
    recency_score: number;
    reputation_score: number;
  };
  lat: number;
  lng: number;
}

export interface MapMatch {
  match_id: string;
  listing_id: string;
  other_user_id: string;
  other_user_name?: string;
  listing_title: string;
  listing_lat: number;
  listing_lng: number;
  distance_km: number;
  match_score: number;
  status: MatchStatus;
  created_at: string;
}

export interface MatchingInput {
  user_id: string;
  user_location: Location;
  preferences: {
    max_distance_km: number;
    categories: string[];
    tags: string[];
    availability?: any;
  };
  listing_id?: string;
  event: 'listing_created' | 'listing_updated' | 'user_preferences_updated';
}

// MapLibre specific types
export interface MapMarker {
  id: string;
  position: Location;
  type: 'listing' | 'match' | 'user';
  data: Listing | MapMatch | Profile;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// Filter state
export interface MapFilters {
  radius: number;
  categories: string[];
  tags: string[];
  minScore?: number;
  status?: MatchStatus[];
}
