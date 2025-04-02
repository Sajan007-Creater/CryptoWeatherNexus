import { useAppSelector, useAppDispatch } from '../store/hooks';
import { dismissWeatherAlert, clearAllWeatherAlerts } from '../store/slices/weatherSlice';
import { useState, useEffect } from 'react';
import { X, AlertTriangle, CloudRain, Wind, Sun, Snowflake, AlertCircle } from 'lucide-react';

const WeatherAlerts = () => {
  const dispatch = useAppDispatch();
  const alerts = useAppSelector((state) => state.weather.alerts);
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto-collapse alerts panel if no alerts are present
  useEffect(() => {
    if (alerts.length === 0) {
      setIsExpanded(false);
    }
  }, [alerts]);

  // Get appropriate icon for alert type
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'storm':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'flood':
        return <CloudRain className="h-5 w-5 text-blue-500" />;
      case 'wind':
        return <Wind className="h-5 w-5 text-gray-500" />;
      case 'heat':
        return <Sun className="h-5 w-5 text-orange-500" />;
      case 'cold':
        return <Snowflake className="h-5 w-5 text-blue-300" />;
      default:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  // Get appropriate background color based on severity
  const getAlertBackground = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-yellow-50 border-yellow-200';
      case 'medium':
        return 'bg-orange-50 border-orange-200';
      case 'high':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  // Get appropriate text color based on severity
  const getAlertTextColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'text-yellow-800';
      case 'medium':
        return 'text-orange-800';
      case 'high':
        return 'text-red-800';
      default:
        return 'text-gray-800';
    }
  };

  // Format timestamp
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleDismiss = (id: string) => {
    dispatch(dismissWeatherAlert(id));
  };

  const handleClearAll = () => {
    dispatch(clearAllWeatherAlerts());
  };

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      {/* Alert toggle button */}
      <button
        className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-600 text-white shadow-lg hover:bg-purple-700 mb-2 ml-auto"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <AlertTriangle size={20} />
        {alerts.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {alerts.length}
          </span>
        )}
      </button>

      {/* Alerts panel */}
      {isExpanded && (
        <div className="glass-card p-4 rounded-lg shadow-lg max-h-96 overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Weather Alerts</h3>
            <button
              onClick={handleClearAll}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-md border ${getAlertBackground(alert.severity)} relative`}
              >
                <button
                  onClick={() => handleDismiss(alert.id)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
                
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getAlertIcon(alert.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className={`font-medium ${getAlertTextColor(alert.severity)}`}>
                        {alert.cityName}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {formatTime(alert.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                        alert.severity === 'medium' ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)} Severity
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherAlerts; 