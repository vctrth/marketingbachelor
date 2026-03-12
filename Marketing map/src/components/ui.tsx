import React from 'react';

// ============================================================================
// BOTTOM NAVIGATION COMPONENT
// ============================================================================

interface BotnavProps {
  className?: string;
  onNavigate?: (tab: 'home' | 'favorites' | 'add' | 'messages' | 'profile') => void;
  activeTab?: 'home' | 'favorites' | 'add' | 'messages' | 'profile';
}

export function Botnav({ className, onNavigate, activeTab = 'home' }: BotnavProps) {
  const handleClick = (tab: BotnavProps['activeTab']) => {
    if (onNavigate && tab) {
      onNavigate(tab);
    }
  };

  return (
    <nav 
      className={className || "bg-white/40 backdrop-blur-md border-2 border-gray-300/40 flex h-16 items-center justify-center px-8 py-5 rounded-[32px]"}
      data-name="botnav"
    >
      <div className="flex gap-8 items-center">
        <button
          onClick={() => handleClick('home')}
          className={`h-[26px] w-[31px] transition-opacity ${activeTab === 'home' ? 'opacity-100' : 'opacity-60'}`}
          aria-label="Home"
        >
          <svg viewBox="0 0 31 26" fill="none" className="w-full h-full">
            <path
              d="M15.5 0L0 13h4v13h9v-9h5v9h9V13h4L15.5 0z"
              fill="currentColor"
            />
          </svg>
        </button>

        <button
          onClick={() => handleClick('favorites')}
          className={`h-[26px] w-[30px] transition-opacity ${activeTab === 'favorites' ? 'opacity-100' : 'opacity-60'}`}
          aria-label="Favorites"
        >
          <svg viewBox="0 0 30 26" fill="none" className="w-full h-full">
            <path
              d="M15 26L12.825 24.0417C5.1 17.0833 0 12.5 0 7.08333C0 3.125 3.15 0 7.5 0C9.9 0 12.21 1.04167 15 2.91667C17.79 1.04167 20.1 0 22.5 0C26.85 0 30 3.125 30 7.08333C30 12.5 24.9 17.0833 17.175 24.0417L15 26Z"
              fill="currentColor"
            />
          </svg>
        </button>

        <button
          onClick={() => handleClick('add')}
          className={`size-[26px] transition-opacity ${activeTab === 'add' ? 'opacity-100' : 'opacity-60'}`}
          aria-label="Add listing"
        >
          <svg viewBox="0 0 26 26" fill="none" className="w-full h-full">
            <path
              d="M13 0C5.82 0 0 5.82 0 13s5.82 13 13 13 13-5.82 13-13S20.18 0 13 0zm6.5 14.3h-5.2v5.2h-2.6v-5.2H6.5v-2.6h5.2V6.5h2.6v5.2h5.2v2.6z"
              fill="currentColor"
            />
          </svg>
        </button>

        <button
          onClick={() => handleClick('messages')}
          className={`h-[26px] w-[26px] transition-opacity ${activeTab === 'messages' ? 'opacity-100' : 'opacity-60'}`}
          aria-label="Messages"
        >
          <svg viewBox="0 0 26 26" fill="none" className="w-full h-full">
            <path
              d="M23.4 0H2.6C1.17 0 0 1.17 0 2.6v15.6c0 1.43 1.17 2.6 2.6 2.6h15.6l5.2 5.2V2.6C26 1.17 24.83 0 23.4 0zM20.8 15.6H5.2v-2.6h15.6v2.6zm0-3.9H5.2V9.1h15.6v2.6zm0-3.9H5.2V5.2h15.6v2.6z"
              fill="currentColor"
            />
          </svg>
        </button>

        <button
          onClick={() => handleClick('profile')}
          className={`size-[26px] transition-opacity ${activeTab === 'profile' ? 'opacity-100' : 'opacity-60'}`}
          aria-label="Profile"
        >
          <svg viewBox="0 0 26 26" fill="none" className="w-full h-full">
            <circle cx="13" cy="8" r="5" fill="currentColor" />
            <path
              d="M13 15c-5.33 0-11 2.67-11 8v3h22v-3c0-5.33-5.67-8-11-8z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
    </nav>
  );
}

// ============================================================================
// TOP NAVIGATION COMPONENT
// ============================================================================

interface TopnavProps {
  className?: string;
  location?: string;
  showSearch?: boolean;
  onFilterClick?: () => void;
  onLocationClick?: () => void;
  onSearchSubmit?: (query: string) => void;
}

export function Topnav({
  className,
  location = 'Leuven, BE',
  showSearch = false,
  onFilterClick,
  onLocationClick,
  onSearchSubmit,
}: TopnavProps) {
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit(searchQuery);
    }
  };

  return (
    <div
      className={
        className ||
        `bg-white/40 backdrop-blur-md border-2 border-gray-300/40 flex flex-col items-center px-4 py-5 rounded-[32px] w-[352px] ${showSearch ? 'gap-4' : ''}`
      }
    >
      {/* Location header */}
      <div className="flex items-center justify-between w-full">
        <button
          onClick={onLocationClick}
          className="flex flex-col items-start text-left"
        >
          <p className="font-bold text-base text-[#36392b] mb-1">Locatie</p>
          <div className="flex items-center gap-2">
            <svg
              width="17"
              height="17"
              viewBox="0 0 17 17"
              fill="none"
              className="shrink-0"
            >
              <path
                d="M8.5 0C5.18 0 2.5 2.68 2.5 6c0 4.5 6 11 6 11s6-6.5 6-11c0-3.32-2.68-6-6-6zm0 8.5c-1.38 0-2.5-1.12-2.5-2.5S7.12 3.5 8.5 3.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                fill="currentColor"
              />
            </svg>
            <p className="font-black text-xl text-[#36392b]">{location}</p>
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              className="-rotate-90"
            >
              <path d="M6 7.5L9 10.5L12 7.5" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
        </button>

        {/* Filter button */}
        <button
          onClick={onFilterClick}
          className="size-[50px] rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
          aria-label="Filter"
        >
          <svg width="24" height="26" viewBox="0 0 24 26" fill="none">
            <path
              d="M4 3h16M4 9h16M7 15h10M9 21h6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="6" cy="15" r="2" fill="currentColor" />
            <circle cx="18" cy="21" r="2" fill="currentColor" />
          </svg>
        </button>
      </div>

      {/* Search bar (conditional) */}
      {showSearch && (
        <form onSubmit={handleSearchSubmit} className="w-full">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                className="text-[#36392b]"
              >
                <path
                  d="M14.5 13h-.79l-.28-.27A6.471 6.471 0 0015 8.5 6.5 6.5 0 108.5 15c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L19.49 18l-4.99-5zm-6 0C6.01 13 4 10.99 4 8.5S6.01 4 8.5 4 13 6.01 13 8.5 10.99 13 8.5 13z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Zoeken naar een tuin"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[47px] pl-12 pr-4 rounded-full bg-white shadow-lg text-base text-[#36392b] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50"
            />
          </div>
        </form>
      )}
    </div>
  );
}

// ============================================================================
// MAP MARKER COMPONENT
// ============================================================================

interface MapMarkerProps {
  onClick?: () => void;
  type?: 'default' | 'active' | 'match';
  size?: number;
}

export function MapMarker({ onClick, type = 'default', size = 31 }: MapMarkerProps) {
  const colors = {
    default: '#576238',    // Brand groen
    active: '#ffd95e',     // Geel accent
    match: '#7b845f',      // Groen accent
  };

  return (
    <button
      onClick={onClick}
      className="transition-transform hover:scale-110 active:scale-95"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 31 31"
        fill="none"
        className="drop-shadow-lg"
      >
        <circle cx="15.5" cy="15.5" r="15.5" fill={colors[type]} />
        <circle cx="15.5" cy="15.5" r="7" fill="white" />
      </svg>
    </button>
  );
}

// ============================================================================
// LISTING CARD COMPONENT (for bottom sheet or sidebar)
// ============================================================================

interface ListingCardProps {
  title: string;
  distance: number;
  score?: number;
  category: string;
  image?: string;
  description?: string;
  tags?: string[];
  isMatch?: boolean;
  matchStatus?: string;
  onViewDetails?: () => void;
  onRequestMatch?: () => void;
  onAcceptMatch?: () => void;
  onRejectMatch?: () => void;
}

export function ListingCard({
  title,
  distance,
  score,
  category,
  image,
  description,
  tags,
  isMatch = false,
  matchStatus,
  onViewDetails,
  onRequestMatch,
  onAcceptMatch,
  onRejectMatch,
}: ListingCardProps) {
  return (
    <div className="w-full rounded-2xl p-4 shadow-xl" style={{ backgroundColor: '#fdfbf7', borderWidth: '2px', borderColor: '#faf9f5' }}>
      <div className="flex gap-3 mb-3">
        {/* Image */}
        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-green-100 to-blue-100 overflow-hidden flex-shrink-0">
          {image ? (
            <img src={image} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl">
              {category === 'garden' ? '🌱' : category === 'tools' ? '🔧' : '📍'}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold mb-1 truncate text-lg" style={{ color: '#36392b' }}>{title}</h3>
          <p className="text-sm mb-2 capitalize" style={{ color: '#56594d' }}>{category}</p>
          <div className="flex items-center gap-3 text-sm" style={{ color: '#7b845f' }}>
            <span className="flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path d="M7 0C4.23 0 2 2.23 2 5c0 3.75 5 9 5 9s5-5.25 5-9c0-2.77-2.23-5-5-5zm0 7c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
              </svg>
              {distance.toFixed(1)} km
            </span>
            {score !== undefined && (
              <span className="flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                  <path d="M7 10.5l-3.5 2.1.9-4L1 5.4l4.1-.4L7 1l1.9 4 4.1.4-3.4 3.2.9 4z" />
                </svg>
                {Math.round(score)}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {description && (
        <p className="text-sm mb-3 line-clamp-2" style={{ color: '#56594d' }}>{description}</p>
      )}

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.slice(0, 3).map((tag, i) => (
            <span
              key={i}
              className="px-2 py-1 text-xs rounded-full font-medium"
              style={{ backgroundColor: 'rgba(87, 98, 56, 0.1)', color: '#576238' }}
            >
              {tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="px-2 py-1 text-xs rounded-full font-medium" style={{ backgroundColor: '#faf9f5', color: '#56594d' }}>
              +{tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Match Status Badge */}
      {isMatch && matchStatus && (
        <div className="mb-3">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-bold`}
            style={{
              backgroundColor: matchStatus === 'pending' ? '#ffd95e' : matchStatus === 'accepted' ? 'rgba(87, 98, 56, 0.1)' : '#faf9f5',
              color: matchStatus === 'pending' ? '#36392b' : matchStatus === 'accepted' ? '#576238' : '#56594d'
            }}
          >
            {matchStatus === 'pending' ? '⏳ In afwachting' : matchStatus === 'accepted' ? '✅ Gematcht' : matchStatus}
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        {/* View Details (always show) */}
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="flex-1 py-2 px-4 rounded-xl font-semibold text-sm transition"
            style={{ backgroundColor: '#faf9f5', color: '#36392b' }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            Bekijk details
          </button>
        )}

        {/* Request Match (for new listings) */}
        {onRequestMatch && !isMatch && (
          <button
            onClick={onRequestMatch}
            className="flex-1 py-2 px-4 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2"
            style={{ backgroundColor: '#576238', color: '#fdfbf7' }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 4v8M4 8h8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Vraag match aan
          </button>
        )}

        {/* Accept/Reject Match (for pending matches) */}
        {isMatch && matchStatus === 'pending' && onAcceptMatch && onRejectMatch && (
          <>
            <button
              onClick={onRejectMatch}
              className="flex-1 py-2 px-4 rounded-xl font-semibold text-sm transition"
              style={{ backgroundColor: 'rgba(255, 0, 0, 0.1)', color: '#dc2626' }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              ✕ Weiger
            </button>
            <button
              onClick={onAcceptMatch}
              className="flex-1 py-2 px-4 rounded-xl font-semibold text-sm transition"
              style={{ backgroundColor: '#576238', color: '#fdfbf7' }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              ✓ Accepteer
            </button>
          </>
        )}

        {/* Chat (for accepted matches) */}
        {isMatch && matchStatus === 'accepted' && (
          <button
            onClick={onViewDetails}
            className="flex-1 py-2 px-4 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2"
            style={{ backgroundColor: '#576238', color: '#fdfbf7' }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M14 0H2C.9 0 0 .9 0 2v14l4-4h10c1.1 0 2-.9 2-2V2c0-1.1-.9-2-2-2z" />
            </svg>
            Chat
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// LOADING SPINNER
// ============================================================================

export function LoadingSpinner({ size = 24 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className="animate-spin"
        style={{ color: '#7b845f' }}
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          strokeOpacity="0.25"
        />
        <path
          d="M12 2a10 10 0 0110 10"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
