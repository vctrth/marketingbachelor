// ============================================================================
// SUPABASE EDGE FUNCTION: Auto Matching
// deploy with: supabase functions deploy auto-match
// ============================================================================


const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MatchingInput {
  user_id: string;
  user_location: {
    lat: number;
    lng: number;
  };
  preferences: {
    max_distance_km: number;
    categories: string[];
    tags: string[];
    availability?: any;
  };
  listing_id?: string;
  event: 'listing_created' | 'listing_updated' | 'user_preferences_updated';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role (bypasses RLS)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Parse request body
    const input: MatchingInput = await req.json();
    console.log('Matching input:', input);

    // Validate input
    if (!input.user_id || !input.user_location) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Find candidate matches using our SQL function
    const { data: candidates, error: candidatesError } = await supabaseClient.rpc(
      'find_candidate_matches',
      {
        p_user_id: input.user_id,
        p_listing_id: input.listing_id || null,
        p_max_distance_km: input.preferences.max_distance_km || 10,
        p_user_lat: input.user_location.lat,
        p_user_lng: input.user_location.lng,
        p_preferred_categories: input.preferences.categories || [],
        p_preferred_tags: input.preferences.tags || [],
      }
    );

    if (candidatesError) {
      console.error('Error finding candidates:', candidatesError);
      throw candidatesError;
    }

    console.log(`Found ${candidates?.length || 0} candidates`);

    // Create matches for top candidates (score > threshold)
    const MATCH_THRESHOLD = 50;
    const MAX_MATCHES = 10;

    const topCandidates = (candidates || [])
      .filter((c: any) => c.match_score >= MATCH_THRESHOLD)
      .slice(0, MAX_MATCHES);

    const createdMatches = [];

    for (const candidate of topCandidates) {
      // Check if match already exists
      const { data: existingMatch } = await supabaseClient
        .from('matches')
        .select('id')
        .or(
          `and(user_a_id.eq.${input.user_id},user_b_id.eq.${candidate.owner_id}),and(user_a_id.eq.${candidate.owner_id},user_b_id.eq.${input.user_id})`
        )
        .eq('listing_id', candidate.listing_id)
        .in('status', ['pending', 'accepted'])
        .single();

      if (existingMatch) {
        console.log(`Match already exists: ${existingMatch.id}`);
        continue;
      }

      // Create new match
      const { data: newMatch, error: matchError } = await supabaseClient.rpc(
        'create_match',
        {
          p_user_a_id: input.user_id,
          p_user_b_id: candidate.owner_id,
          p_listing_id: candidate.listing_id,
          p_initiator_id: input.user_id,
          p_match_score: candidate.match_score,
          p_distance_km: candidate.distance_km,
          p_score_breakdown: candidate.score_breakdown,
        }
      );

      if (matchError) {
        console.error('Error creating match:', matchError);
        continue;
      }

      createdMatches.push(newMatch);
      console.log(`Created match: ${newMatch}`);
    }

    // Return results
    return new Response(
      JSON.stringify({
        success: true,
        candidates_found: candidates?.length || 0,
        matches_created: createdMatches.length,
        top_candidates: topCandidates.map((c: any) => ({
          listing_id: c.listing_id,
          title: c.title,
          score: c.match_score,
          distance_km: c.distance_km,
        })),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in auto-match function:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

// ============================================================================
// WEBHOOK HANDLER (Database Trigger Alternative)
// ============================================================================

/*
You can also trigger this from a Database Webhook:
1. Create a Database Webhook in Supabase Dashboard
2. Set trigger: listings table, INSERT event
3. Set URL: https://your-project.supabase.co/functions/v1/auto-match
4. Set payload:
   {
     "user_id": "record.user_id",
     "listing_id": "record.id",
     "user_location": {
       "lat": "record.lat",
       "lng": "record.lng"
     },
     "preferences": {
       "max_distance_km": 10,
       "categories": [],
       "tags": []
     },
     "event": "listing_created"
   }
*/
