import { useEffect, useState, useCallback } from 'react';
import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import {
  Profile,
  Listing,
  Match,
  MapMatch,
  MatchCandidate,
  Notification,
  Location,
} from '../types';

// ============================================================================
// SUPABASE CLIENT SETUP
// ============================================================================

// Initialize Supabase client
// Replace with your actual Supabase URL and anon key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================================
// AUTH HOOKS
// ============================================================================

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}

export function useProfile(userId?: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          // If profile doesn't exist, create one
          if (error.code === 'PGRST116') {
            console.log('Profile not found, creating one...');
            const newProfile = await createProfileForUser(userId);
            setProfile(newProfile);
          } else {
            throw error;
          }
        } else {
          setProfile(data);
        }
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching/creating profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  return { profile, loading, error };
}

// Helper function to create a profile for a user
async function createProfileForUser(userId: string): Promise<Profile> {
  // Get user email from auth
  const { data: { user } } = await supabase.auth.getUser();
  const email = user?.email || '';
  const fullName = email ? email.split('@')[0] : 'User';

  const newProfile = {
    id: userId,
    email: email,
    full_name: fullName,
    current_lat: 50.8798, // Default to Leuven, Belgium
    current_lng: 4.7005,
    city: 'Leuven',
    country: 'Belgium',
    max_distance_km: 10,
    preferred_categories: ['garden', 'tools', 'electronics', 'furniture'],
    preferred_tags: [],
  };

  const { data, error } = await supabase
    .from('profiles')
    .insert(newProfile)
    .select()
    .single();

  if (error) {
    console.error('Error creating profile:', error);
    throw error;
  }

  return data;
}

// ============================================================================
// LISTINGS HOOKS
// ============================================================================

export function useListings(filters?: {
  category?: string[];
  maxDistance?: number;
  userLocation?: Location;
}) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        let query = supabase
          .from('listings')
          .select('*')
          .eq('is_active', true)
          .eq('is_archived', false)
          .order('created_at', { ascending: false });

        // Apply category filter
        if (filters?.category && filters.category.length > 0) {
          query = query.in('category', filters.category);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Client-side distance filtering if needed
        let filteredData = data || [];
        if (filters?.userLocation && filters?.maxDistance) {
          filteredData = filteredData.filter((listing) => {
            const distance = calculateDistance(
              filters.userLocation!,
              { lat: listing.lat, lng: listing.lng }
            );
            return distance <= filters.maxDistance!;
          });
        }

        setListings(filteredData);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [filters?.category, filters?.maxDistance, filters?.userLocation?.lat, filters?.userLocation?.lng]);

  return { listings, loading, error };
}

export function useCreateListing() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createListing = useCallback(async (listing: Partial<Listing>) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('listings')
        .insert([listing])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createListing, loading, error };
}

// ============================================================================
// MATCHING HOOKS
// ============================================================================

export function useFindMatches(userId: string, preferences: {
  max_distance_km: number;
  user_lat?: number;
  user_lng?: number;
  preferred_categories?: string[];
  preferred_tags?: string[];
}) {
  const [candidates, setCandidates] = useState<MatchCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const findMatches = useCallback(async () => {
    if (!preferences.user_lat || !preferences.user_lng) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc('find_candidate_matches', {
        p_user_id: userId,
        p_max_distance_km: preferences.max_distance_km,
        p_user_lat: preferences.user_lat,
        p_user_lng: preferences.user_lng,
        p_preferred_categories: preferences.preferred_categories || [],
        p_preferred_tags: preferences.preferred_tags || [],
      });

      if (error) throw error;
      setCandidates(data || []);
      return data;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [
    userId,
    preferences.max_distance_km,
    preferences.user_lat,
    preferences.user_lng,
    preferences.preferred_categories,
    preferences.preferred_tags,
  ]);

  return { candidates, findMatches, loading, error };
}

export function useCreateMatch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createMatch = useCallback(async (
    userAId: string,
    userBId: string,
    listingId: string,
    initiatorId: string,
    matchScore: number,
    distanceKm: number,
    scoreBreakdown: any
  ) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc('create_match', {
        p_user_a_id: userAId,
        p_user_b_id: userBId,
        p_listing_id: listingId,
        p_initiator_id: initiatorId,
        p_match_score: matchScore,
        p_distance_km: distanceKm,
        p_score_breakdown: scoreBreakdown,
      });

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createMatch, loading, error };
}

export function useRespondToMatch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const respondToMatch = useCallback(async (
    matchId: string,
    userId: string,
    response: 'accept' | 'reject'
  ) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc('respond_to_match', {
        p_match_id: matchId,
        p_user_id: userId,
        p_response: response,
      });

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { respondToMatch, loading, error };
}

export function useUserMatches(userId: string, status: string = 'all') {
  const [matches, setMatches] = useState<MapMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchMatches = async () => {
      try {
        console.log('🔄 Fetching matches for user:', userId, 'with status:', status);
        
        const { data, error } = await supabase.rpc('get_user_matches_for_map', {
          p_user_id: userId,
          p_status: status,
        });

        console.log('📥 RPC response - data:', data);
        console.log('📥 RPC response - error:', error);

        if (error) throw error;
        setMatches(data || []);
        console.log('✅ Matches set to state:', data || []);
      } catch (err) {
        console.error('❌ Error fetching matches:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [userId, status]);

  return { matches, loading, error };
}

// ============================================================================
// REALTIME SUBSCRIPTIONS
// ============================================================================

export function useRealtimeMatches(userId: string) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!userId) return;

    // Subscribe to matches where user is a participant
    const matchesChannel = supabase
      .channel('matches-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `user_a_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Match change (user_a):', payload);
          handleMatchChange(payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `user_b_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Match change (user_b):', payload);
          handleMatchChange(payload);
        }
      )
      .subscribe();

    setChannel(matchesChannel);

    function handleMatchChange(payload: any) {
      if (payload.eventType === 'INSERT') {
        setMatches((prev) => [...prev, payload.new as Match]);
      } else if (payload.eventType === 'UPDATE') {
        setMatches((prev) =>
          prev.map((m) => (m.id === payload.new.id ? payload.new as Match : m))
        );
      } else if (payload.eventType === 'DELETE') {
        setMatches((prev) => prev.filter((m) => m.id !== payload.old.id));
      }
    }

    return () => {
      matchesChannel.unsubscribe();
    };
  }, [userId]);

  return { matches, channel };
}

export function useRealtimeListings(bounds?: {
  north: number;
  south: number;
  east: number;
  west: number;
}) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    // Subscribe to all active listings
    const listingsChannel = supabase
      .channel('listings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'listings',
          filter: 'is_active=eq.true',
        },
        (payload) => {
          console.log('Listing change:', payload);
          handleListingChange(payload);
        }
      )
      .subscribe();

    setChannel(listingsChannel);

    function handleListingChange(payload: any) {
      if (payload.eventType === 'INSERT') {
        const newListing = payload.new as Listing;
        // Check if within bounds
        if (bounds && !isWithinBounds(newListing, bounds)) return;
        setListings((prev) => [...prev, newListing]);
      } else if (payload.eventType === 'UPDATE') {
        setListings((prev) =>
          prev.map((l) => (l.id === payload.new.id ? payload.new as Listing : l))
        );
      } else if (payload.eventType === 'DELETE') {
        setListings((prev) => prev.filter((l) => l.id !== payload.old.id));
      }
    }

    return () => {
      listingsChannel.unsubscribe();
    };
  }, [bounds]);

  return { listings, channel };
}

export function useRealtimeNotifications(userId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    // Fetch initial notifications
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.is_read).length);
      }
    };

    fetchNotifications();

    // Subscribe to new notifications
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updated = payload.new as Notification;
          setNotifications((prev) =>
            prev.map((n) => (n.id === updated.id ? updated : n))
          );
          // Recalculate unread count
          setUnreadCount((prev) => {
            const wasRead = payload.old.is_read;
            const isRead = updated.is_read;
            if (!wasRead && isRead) return prev - 1;
            if (wasRead && !isRead) return prev + 1;
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId]);

  const markAsRead = useCallback(async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (error) console.error('Error marking notification as read:', error);
  }, []);

  return { notifications, unreadCount, markAsRead };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Calculate distance between two points (Haversine formula)
function calculateDistance(point1: Location, point2: Location): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(point2.lat - point1.lat);
  const dLng = toRad(point2.lng - point1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) *
      Math.cos(toRad(point2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function isWithinBounds(
  listing: Listing,
  bounds: { north: number; south: number; east: number; west: number }
): boolean {
  return (
    listing.lat >= bounds.south &&
    listing.lat <= bounds.north &&
    listing.lng >= bounds.west &&
    listing.lng <= bounds.east
  );
}
