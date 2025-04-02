import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { store } from "./store/index.ts";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Weather from "./pages/Weather";
import Crypto from "./pages/Crypto";
import News from "./pages/News";
import CityDetail from "./pages/CityDetail";
import CryptoDetail from "./pages/CryptoDetail";
import Favorites from "./pages/Favorites";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import websocketService from "./utils/websocketServices.ts";
import LiveCryptoTicker from "./components/LiveCryptoTicker.tsx";
import WeatherAlerts from "./components/WeatherAlerts.tsx";
import { useAppSelector } from "./store/hooks.ts";

const queryClient = new QueryClient();

// WebSocket initializer component
const WebSocketInitializer = () => {
  useEffect(() => {
    // Initialize WebSocket connections
    websocketService.initializeSockets();
    
    // Clean up WebSocket connections on unmount
    return () => {
      websocketService.cleanup();
    };
  }, []);
  
  return null;
};

// App content with access to Redux store
const AppContent = () => {
  const { darkMode } = useAppSelector(state => state.userPreferences);
  
  return (
    <>
      <Toaster />
      <Sonner />
      <WebSocketInitializer />
      <LiveCryptoTicker />
      <WeatherAlerts />
      <BrowserRouter>
        <div className={`app-wrapper ${darkMode ? 'dark-mode' : ''}`}>
          <div className="content-container">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/weather" element={<Weather />} />
              <Route path="/weather/:cityId" element={<CityDetail />} />
              <Route path="/crypto" element={<Crypto />} />
              <Route path="/crypto/:cryptoId" element={<CryptoDetail />} />
              <Route path="/news" element={<News />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </>
  );
};

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
