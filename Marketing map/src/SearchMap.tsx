import { useState } from 'react';
import { MapLibreMap } from './components/Map';
import { ListingCard, LoadingSpinner } from './components/ui';
// import { Auth } from './components/Auth';
import {
  // useAuth,
  // useProfile,
  useListings,
  useUserMatches,
  useFindMatches,
  useCreateMatch,
  // useRealtimeMatches,
  // useRealtimeListings,
  // useRealtimeNotifications,
  // supabase,
} from './hooks/useSupabase';
import { Location, Listing, MapMatch } from './types';

// ============================================================================
// DEVELOPMENT MODE - Fixed test user ID (auth disabled)
// ============================================================================
const DEV_USER_ID = 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e'; // Your test user
const DEV_USER_LAT = 50.8798;
const DEV_USER_LNG = 4.7005;

// ============================================================================
// MAIN SEARCH MAP COMPONENT
// ============================================================================

export default function SearchMap() {
  // TEMPORARILY DISABLED AUTH - Using fixed DEV_USER_ID
  // const { user, loading: authLoading } = useAuth();
  // const { profile } = useProfile(user?.id);
  
  // Map state
  const [mapCenter] = useState<Location>({
    lat: DEV_USER_LAT,
    lng: DEV_USER_LNG,
  });
  const setMapBounds = useState<any>(null)[1];
  
  // Selected listing state
  const [selectedListing, setSelectedListing] = useState<Listing | MapMatch | null>(null);
  
  // Data fetching - Fetch ALL listings to show on map
  const { listings: allListings, loading: listingsLoading } = useListings();
  
  // Filter out own listings (only show listings we can match with)
  const listings = allListings.filter(listing => listing.user_id !== DEV_USER_ID);
  
  // MATCHES ENABLED - Using DEV_USER_ID
  const { matches } = useUserMatches(DEV_USER_ID, 'all');
  console.log('🎯 DEV_USER_ID:', DEV_USER_ID);
  console.log('🎯 Matches fetched from useUserMatches:', matches);
  console.log('🎯 Number of matches:', matches?.length || 0);
  
  const { findMatches } = useFindMatches(
    DEV_USER_ID,
    {
      max_distance_km: 10,
      user_lat: DEV_USER_LAT,
      user_lng: DEV_USER_LNG,
      preferred_categories: ['garden', 'tools', 'electronics', 'furniture'],
      preferred_tags: [],
    }
  );
  const { createMatch } = useCreateMatch();

  // TEMPORARILY DISABLED REALTIME
  // const { matches: realtimeMatches } = useRealtimeMatches(user?.id || '');
  // const { listings: realtimeListings } = useRealtimeListings(mapBounds);
  // const { notifications, unreadCount } = useRealtimeNotifications(user?.id || '');

  // TEMPORARILY DISABLED - Update map center when profile location changes
  // useEffect(() => {
  //   if (profile?.current_lat && profile?.current_lng) {
  //     setMapCenter({
  //       lat: profile.current_lat,
  //       lng: profile.current_lng,
  //     });
  //   }
  // }, [profile?.current_lat, profile?.current_lng]);

  // TEMPORARILY DISABLED - Auto-find matches when profile loads
  // useEffect(() => {
  //   if (profile?.current_lat && profile?.current_lng && !matchesInitialized) {
  //     findMatches();
  //     setMatchesInitialized(true);
  //   }
  // }, [profile?.current_lat, profile?.current_lng]);

  // Handle marker click
  const handleMarkerClick = (item: Listing | MapMatch) => {
    setSelectedListing(item);
  };

  // Handle map movement
  const handleMapMove = (bounds: any) => {
    setMapBounds(bounds);
  };

  // Helper: Check if listing already has a match
  const getListingMatchStatus = (listingId: string): { hasMatch: boolean; status?: string } => {
    console.log('🔍 Checking match status for listing:', listingId);
    console.log('📊 All matches:', matches);
    
    const existingMatch = matches.find(match => match.listing_id === listingId);
    
    if (existingMatch) {
      console.log('✅ Found existing match:', existingMatch);
      return { hasMatch: true, status: existingMatch.status };
    }
    
    console.log('❌ No match found for this listing');
    return { hasMatch: false };
  };

  // Handle match request - Using DEV_USER_ID
  const handleRequestMatch = async (listing: Listing) => {
    if (!listing.user_id || listing.user_id === DEV_USER_ID) {
      alert('Kan niet matchen met je eigen advertentie');
      return;
    }

    // Check if already matched
    const matchStatus = getListingMatchStatus(listing.id);
    if (matchStatus.hasMatch) {
      alert(`Je hebt al een ${matchStatus.status} match met deze advertentie!`);
      return;
    }

    try {
      // Calculate distance between user and listing
      const distance = calculateDistance(
        DEV_USER_LAT,
        DEV_USER_LNG,
        listing.lat,
        listing.lng
      );

      // Simple scoring for now
      const matchScore = Math.max(0, 100 - distance * 5);

      await createMatch(
        DEV_USER_ID,
        listing.user_id,
        listing.id,
        DEV_USER_ID,
        matchScore,
        distance,
        {
          distance_score: Math.max(0, 50 - distance * 5),
          category_match: 30,
          freshness_score: 10,
          reputation_score: 10,
        }
      );

      alert('Match aanvraag verzonden! 🎉');
      setSelectedListing(null);
      
      // Refresh matches
      findMatches();
    } catch (error) {
      console.error('Fout bij aanmaken match:', error);
      alert('Kon match aanvraag niet verzenden. Probeer het opnieuw.');
    }
  };

  // Helper: Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // TEMPORARILY DISABLED AUTH CHECK
  // if (authLoading) {
  //   return (
  //     <div className="flex items-center justify-center h-screen bg-white">
  //       <LoadingSpinner size={48} />
  //     </div>
  //   );
  // }

  // if (!user) {
  //   return <Auth />;
  // }

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ backgroundColor: '#fdfbf7' }}>
      {/* Map Layer */}
      <div className="absolute inset-0">
        <MapLibreMap
          center={mapCenter}
          zoom={13}
          listings={listings}
          matches={matches} // MATCHES RE-ENABLED with DEV_USER_ID
          userLocation={{ lat: DEV_USER_LAT, lng: DEV_USER_LNG }} // Show user location
          onMarkerClick={handleMarkerClick}
          onMapMove={handleMapMove}
          className="w-full h-full"
        />
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">

        {/* TEMPORARILY DISABLED - Notification Badge */}
        {/* {unreadCount > 0 && (
          <div className="absolute top-12 right-8 pointer-events-auto">
            <div className="bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          </div>
        )} */}

        {/* Selected Listing Card (Bottom Sheet) */}
        {selectedListing && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-md pointer-events-auto animate-slide-up">
            {'listing_title' in selectedListing ? (
              // MapMatch
              <ListingCard
                title={selectedListing.listing_title}
                distance={selectedListing.distance_km}
                score={selectedListing.match_score}
                category="Match"
                isMatch={true}
                matchStatus={selectedListing.status}
                onViewDetails={() => {
                  console.log('Bekijk match details:', selectedListing);
                }}
              />
            ) : (
              // Listing
              (() => {
                const matchInfo = getListingMatchStatus(selectedListing.id);
                console.log('🎨 Rendering ListingCard with matchInfo:', matchInfo);
                console.log('📝 ListingCard props:', {
                  title: selectedListing.title,
                  isMatch: matchInfo.hasMatch,
                  matchStatus: matchInfo.status,
                  hasRequestButton: !matchInfo.hasMatch
                });
                
                return (
                  <ListingCard
                    title={selectedListing.title}
                    distance={calculateDistance(
                      mapCenter.lat,
                      mapCenter.lng,
                      selectedListing.lat,
                      selectedListing.lng
                    )}
                    category={selectedListing.category}
                    image={selectedListing.images?.[0]}
                    description={selectedListing.description}
                    tags={selectedListing.tags}
                    isMatch={matchInfo.hasMatch}
                    matchStatus={matchInfo.status}
                    onViewDetails={() => {
                      console.log('Bekijk advertentie details:', selectedListing);
                    }}
                    onRequestMatch={matchInfo.hasMatch ? undefined : () => handleRequestMatch(selectedListing)}
                  />
                );
              })()
            )}
            
            {/* Close button */}
            <button
              onClick={() => setSelectedListing(null)}
              className="absolute -top-3 -right-3 rounded-full p-2 shadow-lg transition-colors"
              style={{ backgroundColor: '#fdfbf7' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#faf9f5'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fdfbf7'}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M15 5L5 15M5 5l10 10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Loading indicator */}
        {listingsLoading && (
          <div className="absolute top-32 left-1/2 -translate-x-1/2 pointer-events-auto">
            <div className="backdrop-blur-sm rounded-full px-6 py-3 shadow-lg flex items-center gap-3" style={{ backgroundColor: 'rgba(250, 249, 245, 0.9)' }}>
              <LoadingSpinner size={20} />
              <span className="text-sm font-medium" style={{ color: '#36392b' }}>Advertenties laden...</span>
            </div>
          </div>
        )}

        {/* Listing count */}
        {!listingsLoading && listings.length > 0 && (
          <div className="absolute top-32 left-1/2 -translate-x-1/2 pointer-events-auto">
            <div className="rounded-full px-6 py-3 shadow-lg" style={{ backgroundColor: '#576238' }}>
              <span className="text-sm font-bold" style={{ color: '#fdfbf7' }}>
                {listings.length} {listings.length === 1 ? 'advertentie' : 'advertenties'} gevonden
              </span>
            </div>
          </div>
        )}

        {/* No listings message */}
        {!listingsLoading && listings.length === 0 && (
          <div className="absolute top-32 left-1/2 -translate-x-1/2 pointer-events-auto">
            <div className="rounded-full px-6 py-3 shadow-lg" style={{ backgroundColor: '#7b845f' }}>
              <span className="text-sm font-bold" style={{ color: '#fdfbf7' }}>
                Nog geen advertenties. Maak er een aan met de + knop!
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// CSS ANIMATIONS (add to your global CSS)
// ============================================================================
/*
@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slide-up 0.3s ease-out;
}
*/
