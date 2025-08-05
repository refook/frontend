import React, { useState, useEffect } from 'react';
import { apiLogger } from '../../utils/apiLogger';
import styles from './DevTools.module.css';

interface ApiLogData {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
  timestamp: string;
}

const ApiLogger: React.FC = () => {
  const [logs, setLogs] = useState<ApiLogData[]>([]);
  const [selectedLog, setSelectedLog] = useState<ApiLogData | null>(null);
  const [filterUrl, setFilterUrl] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    const updateLogs = () => {
      setLogs(apiLogger.getLogs());
    };

    updateLogs();

    if (autoRefresh) {
      const interval = setInterval(updateLogs, 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const filteredLogs = logs.filter(log => 
    !filterUrl || log.url.includes(filterUrl)
  );

  const handleClearLogs = () => {
    apiLogger.clearLogs();
    setLogs([]);
    setSelectedLog(null);
  };

  const handleExportLogs = () => {
    const dataStr = apiLogger.exportLogs();
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `api-logs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStats = () => {
    return apiLogger.getStats();
  };

  return (
    <div className={styles.apiLogger}>
      <div className={styles.header}>
        <h3>API Logger</h3>
        <div className={styles.controls}>
          <label>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh
          </label>
          <button onClick={() => setLogs(apiLogger.getLogs())}>
            Refresh
          </button>
          <button onClick={handleClearLogs}>
            Clear
          </button>
          <button onClick={handleExportLogs}>
            Export
          </button>
        </div>
      </div>

      <div className={styles.stats}>
        <span>Total: {getStats().total}</span>
        <span>Methods: {Object.keys(getStats().byMethod).join(', ')}</span>
      </div>

      <div className={styles.filter}>
        <input
          type="text"
          placeholder="Filter by URL..."
          value={filterUrl}
          onChange={(e) => setFilterUrl(e.target.value)}
        />
      </div>

      <div className={styles.content}>
        <div className={styles.logList}>
          {filteredLogs.length === 0 ? (
            <div className={styles.empty}>No API requests logged</div>
          ) : (
            filteredLogs.map((log, index) => (
              <div
                key={index}
                className={`${styles.logItem} ${selectedLog === log ? styles.selected : ''}`}
                onClick={() => setSelectedLog(log)}
              >
                <div className={styles.logMethod}>{log.method}</div>
                <div className={styles.logUrl}>{log.url}</div>
                <div className={styles.logTime}>
                  {new Date(log.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
        </div>

        {selectedLog && (
          <div className={styles.logDetails}>
            <h4>Request Details</h4>
            <div className={styles.detailSection}>
              <strong>URL:</strong> {selectedLog.url}
            </div>
            <div className={styles.detailSection}>
              <strong>Method:</strong> {selectedLog.method}
            </div>
            <div className={styles.detailSection}>
              <strong>Timestamp:</strong> {new Date(selectedLog.timestamp).toLocaleString()}
            </div>
            
            <div className={styles.detailSection}>
              <strong>Headers:</strong>
              <pre>{JSON.stringify(selectedLog.headers, null, 2)}</pre>
            </div>
            
            {selectedLog.body && (
              <div className={styles.detailSection}>
                <strong>Body:</strong>
                <pre>{JSON.stringify(selectedLog.body, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiLogger; 