// ============================================================================
// APPLICATION CONFIGURATION
// Centralized config for the matching system
// ============================================================================

export const config = {
  // Map Configuration
  map: {
    defaultCenter: {
      lat: 50.8798,
      lng: 4.7005,
    },
    defaultZoom: 13,
    defaultCity: 'Leuven',
    defaultCountry: 'BE',
    // OpenStreetMap tile servers (free, no API key needed)
    tileServers: [
      'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
      'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
      'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
    ],
  },

  // Matching Algorithm Configuration
  matching: {
    // Score thresholds
    minMatchScore: 50, // Minimum score to create match (0-100)
    goodMatchScore: 70, // "Good match" badge threshold
    greatMatchScore: 85, // "Great match" badge threshold

    // Distance settings
    defaultMaxDistance: 10, // km
    maxAllowedDistance: 50, // km (hard limit)

    // Score weights (must sum to 100)
    scoreWeights: {
      distance: 50, // 50% of total score
      tagOverlap: 30, // 30% of total score
      recency: 10, // 10% of total score
      reputation: 10, // 10% of total score
    },

    // Auto-matching limits
    maxAutoMatches: 10, // Max matches created per trigger
    minAutoMatchScore: 60, // Minimum score for auto-match

    // Match expiration
    matchExpireDays: 7, // Days until pending match expires
    matchExpireHours: 168, // Hours (7 days * 24)
  },

  // UI Configuration
  ui: {
    // Colors (Tailwind classes)
    colors: {
      primary: '#36392b', // Text color from Figma
      markerListing: '#8B5CF6', // Purple
      markerMatch: '#EC4899', // Pink
      markerUser: '#10B981', // Green
      glassBackground: 'rgba(255, 255, 255, 0.4)',
      glassBorder: 'rgba(217, 217, 217, 0.4)',
    },

    // Animation durations (ms)
    animations: {
      cardSlideUp: 300,
      markerHover: 150,
      notificationFade: 200,
    },

    // Map marker sizes
    markerSizes: {
      default: 31,
      hover: 35,
      selected: 40,
    },

    // Component visibility
    showSearchByDefault: false,
    showFilterByDefault: false,
  },

  // Categories (customize for your use case)
  categories: [
    { id: 'garden', label: 'Garden Space', icon: '🌱' },
    { id: 'tools', label: 'Tools', icon: '🔧' },
    { id: 'knowledge', label: 'Knowledge', icon: '📚' },
    { id: 'seeds', label: 'Seeds/Plants', icon: '🌿' },
    { id: 'compost', label: 'Compost', icon: '♻️' },
    { id: 'water', label: 'Water Access', icon: '💧' },
  ],

  // Common tags (for autocomplete)
  commonTags: [
    'organic',
    'beginner-friendly',
    'experienced',
    'community',
    'private',
    'shared',
    'sunny',
    'shaded',
    'large',
    'small',
    'raised-beds',
    'ground-level',
    'vegetables',
    'flowers',
    'herbs',
    'fruit-trees',
  ],

  // Notification settings
  notifications: {
    maxDisplayed: 50, // Max notifications to fetch
    autoMarkReadDelay: 5000, // ms to wait before auto-marking as read
    enableInApp: true,
    enablePush: false, // Set to true when push notifications implemented
  },

  // Realtime subscriptions
  realtime: {
    enableMatches: true,
    enableListings: true,
    enableNotifications: true,
    enableMessages: true,
    reconnectDelay: 5000, // ms
    maxReconnectAttempts: 5,
  },

  // Performance
  performance: {
    // Map rendering
    maxVisibleMarkers: 100, // Switch to clustering above this
    clusterRadius: 50, // pixels
    clusterMaxZoom: 14,

    // Data fetching
    listingsPageSize: 50,
    matchesPageSize: 50,
    messagesPageSize: 50,

    // Debounce/throttle (ms)
    searchDebounce: 300,
    mapMoveThrottle: 500,
    filterDebounce: 300,
  },

  // Feature flags (enable/disable features)
  features: {
    enableChat: true,
    enableRatings: true,
    enableReports: true,
    enableBlocks: true,
    enableAutoMatch: true,
    enablePushNotifications: false,
    enableEmailNotifications: false,
    enableImageUpload: true,
    enableVideoCall: false,
  },

  // Development
  dev: {
    enableDebugLogs: import.meta.env.DEV,
    showScoreBreakdown: import.meta.env.DEV,
    enableMockData: false,
  },

  // API endpoints
  api: {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    autoMatchFunction: '/functions/v1/auto-match',
  },

  // Validation rules
  validation: {
    listing: {
      minTitleLength: 5,
      maxTitleLength: 100,
      minDescriptionLength: 20,
      maxDescriptionLength: 1000,
      maxImages: 5,
      requiredFields: ['title', 'category', 'lat', 'lng'],
    },
    profile: {
      minUsernameLength: 3,
      maxUsernameLength: 30,
      minBioLength: 10,
      maxBioLength: 500,
    },
    message: {
      minLength: 1,
      maxLength: 1000,
    },
  },

  // Error messages
  errors: {
    network: 'Network error. Please check your connection.',
    auth: 'Authentication required. Please sign in.',
    permissionDenied: 'You do not have permission to perform this action.',
    notFound: 'The requested resource was not found.',
    serverError: 'Server error. Please try again later.',
    validationError: 'Please check your input and try again.',
  },
};

// Helper functions
export const getDistanceDisplay = (km: number): string => {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
};

export const getScoreLabel = (score: number): string => {
  if (score >= config.matching.greatMatchScore) return 'Great Match';
  if (score >= config.matching.goodMatchScore) return 'Good Match';
  if (score >= config.matching.minMatchScore) return 'Match';
  return 'Low Match';
};

export const getScoreColor = (score: number): string => {
  if (score >= config.matching.greatMatchScore) return 'text-green-600';
  if (score >= config.matching.goodMatchScore) return 'text-blue-600';
  if (score >= config.matching.minMatchScore) return 'text-purple-600';
  return 'text-gray-600';
};

export const getCategoryLabel = (categoryId: string): string => {
  return config.categories.find((c) => c.id === categoryId)?.label || categoryId;
};

export const getCategoryIcon = (categoryId: string): string => {
  return config.categories.find((c) => c.id === categoryId)?.icon || '📍';
};

export default config;
