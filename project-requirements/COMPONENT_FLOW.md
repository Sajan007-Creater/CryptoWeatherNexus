# Component Flow Diagrams

This document provides visual representations of the component relationships and data flow within the Weather-Verse-Visuals application.

## Application Structure Overview

```
App
├── NavBar
│   ├── NavLinks
│   ├── ThemeToggle
│   └── NotificationCenter
├── <Routes>
│   ├── Index (/)
│   │   └── FeaturedContent
│   ├── Weather (/weather)
│   │   ├── WeatherSearch
│   │   ├── WeatherCardList
│   │   │   └── WeatherCard (multiple)
│   │   └── WeatherFilters
│   ├── CityDetail (/weather/:city)
│   │   ├── WeatherDetail
│   │   ├── ForecastList
│   │   │   └── ForecastItem (multiple)
│   │   └── WeatherMap
│   ├── Crypto (/crypto)
│   │   ├── CryptoSearch
│   │   ├── CryptoCardList
│   │   │   └── CryptoCard (multiple)
│   │   ├── CryptoFilters
│   │   └── TrendingCryptos
│   ├── CryptoDetail (/crypto/:id)
│   │   ├── CryptoDetail
│   │   ├── PriceChart
│   │   └── RelatedCryptos
│   ├── News (/news)
│   │   ├── NewsSearch
│   │   ├── NewsCardList
│   │   │   └── NewsCard (multiple)
│   │   └── NewsFilters
│   └── NotFound (*) 
└── Footer
```

## Data Flow Diagrams

### Weather Feature Data Flow

```
                                            ┌───────────────────┐
                                            │                   │
                                            │   Weather API     │
                                            │                   │
                                            └─────────┬─────────┘
                                                      │
                                                      ▼
┌───────────────────┐                         ┌───────────────────┐
│                   │                         │                   │
│  useWeather Hook  │◄────────────────────────┤  Weather Slice    │
│                   │                         │   (Redux Store)   │
└─────────┬─────────┘                         └───────────────────┘
          │                                             ▲
          │                                             │
          │                                             │
          ▼                                             │
┌───────────────────┐                         ┌───────────────────┐
│                   │                         │                   │
│   Weather UI      │────────────────────────►│   User Actions    │
│   Components      │                         │                   │
└───────────────────┘                         └───────────────────┘
```

### Crypto Feature Data Flow

```
                                            ┌───────────────────┐
                                            │                   │
                                            │    Crypto API     │
                                            │                   │
                                            └─────────┬─────────┘
                                                      │
                                                      ▼
┌───────────────────┐                         ┌───────────────────┐
│                   │                         │                   │
│    useCrypto      │◄────────────────────────┤   Crypto Slice    │
│      Hook         │                         │  (Redux Store)    │
└─────────┬─────────┘                         └───────────────────┘
          │                                             ▲
          │                                             │
          │                                             │
          ▼                                             │
┌───────────────────┐                         ┌───────────────────┐
│                   │                         │                   │
│    Crypto UI      │────────────────────────►│   User Actions    │
│    Components     │                         │                   │
└───────────────────┘                         └───────────────────┘
```

### News Feature Data Flow

```
                                            ┌───────────────────┐
                                            │                   │
                                            │     News API      │
                                            │                   │
                                            └─────────┬─────────┘
                                                      │
                                                      ▼
┌───────────────────┐                         ┌───────────────────┐
│                   │                         │                   │
│    useNews        │◄────────────────────────┤    News Slice     │
│      Hook         │                         │   (Redux Store)   │
└─────────┬─────────┘                         └───────────────────┘
          │                                             ▲
          │                                             │
          │                                             │
          ▼                                             │
┌───────────────────┐                         ┌───────────────────┐
│                   │                         │                   │
│     News UI       │────────────────────────►│   User Actions    │
│    Components     │                         │                   │
└───────────────────┘                         └───────────────────┘
```

## Real-Time Notification Component Flow

```
┌────────────────┐         ┌───────────────────┐         ┌─────────────────┐
│                │         │                   │         │                 │
│   WebSocket    │────────►│ Notification      │────────►│ Notification    │
│   Service      │         │ Service           │         │ Slice (Redux)   │
│                │         │                   │         │                 │
└────────────────┘         └───────────────────┘         └────────┬────────┘
                                                                  │
                                                                  │
                                                                  ▼
                           ┌───────────────────┐         ┌─────────────────┐
                           │                   │         │                 │
                           │  Toast Component  │◄────────┤ NotificationCenter
                           │                   │         │ Component       │
                           └───────────────────┘         │                 │
                                                         └─────────────────┘
```

## Component Interaction Patterns

### Common Interaction Patterns

1. **Data Fetching**:
   - Component mounts → Hook triggers data fetch → Redux thunk action dispatched → API call made → Redux store updated → Component re-renders with data

2. **User Input**:
   - User interacts with UI → Component captures event → Action dispatched → Redux store updated → Connected components re-render

3. **Filtering & Sorting**:
   - User selects filter/sort option → Filter component dispatches action → Redux selector filters/sorts data → Component re-renders with filtered data

4. **Detail View Navigation**:
   - User clicks detail link → React Router navigates to detail route → Detail component mounts → ID extracted from URL → Detailed data fetched if needed

5. **Theme Toggling**:
   - User clicks theme toggle → ThemeToggle component dispatches action → Theme stored in localStorage → CSS variables updated → UI theme changes

6. **Notifications**:
   - WebSocket receives data → Notification service processes event → Notification action dispatched → Both NotificationCenter and Toast components updated

### Mobile Responsiveness Pattern

```
┌───────────────────┐                         ┌───────────────────┐
│                   │                         │                   │
│   use-mobile      │────────────────────────►│  Layout Components│
│      Hook         │                         │                   │
└───────────────────┘                         └───────────────────┘
          ▲
          │
          │
┌───────────────────┐
│                   │
│  Window Resize    │
│    Event          │
│                   │
└───────────────────┘
```

## State Management Hierarchy

```
Redux Store
├── Weather State
│   ├── currentWeather
│   ├── forecastData
│   ├── searchHistory
│   ├── loading
│   └── error
├── Crypto State
│   ├── cryptoList
│   ├── detailData
│   ├── favorites
│   ├── loading
│   └── error
├── News State
│   ├── newsList
│   ├── categories
│   ├── loading
│   └── error
├── UI State
│   ├── theme
│   ├── isMobile
│   └── filters
└── Notification State
    ├── notifications
    ├── unreadCount
    └── lastNotificationTime
``` 