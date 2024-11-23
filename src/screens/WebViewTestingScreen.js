import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { WebView } from 'react-native-webview';
import CustomButton from '../components/CustomButton';
import ElementInspector from '../components/ElementInspector';
import PerformanceMetrics from '../components/PerformanceMetrics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WebViewTestingScreen = () => {
  const [url, setUrl] = useState('');
  const [currentLoadedUrl, setCurrentLoadedUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [currentRecording, setCurrentRecording] = useState([]);
  const [showDevTools, setShowDevTools] = useState(false);
  const [consoleMessages, setConsoleMessages] = useState([]);
  const [networkRequests, setNetworkRequests] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    fps: [],
    memory: [],
    pageLoadTime: 0,
    domNodes: 0,
    jsHeapSize: 0,
  });
  const [activeTab, setActiveTab] = useState('console');
  const [isInspectorMode, setIsInspectorMode] = useState(false);
  const [webViewReady, setWebViewReady] = useState(false);
  
  const webViewRef = useRef(null);
  const urlInputRef = useRef(null);
  const urlLoadTimeoutRef = useRef(null);

  // Create a blank HTML page with a basic structure
  const blankHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            padding: 20px;
            margin: 0;
            background-color: #f8f9fa;
          }
          .container {
            text-align: center;
            margin-top: 50px;
          }
          h2 {
            color: #6c757d;
          }
          p {
            color: #495057;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>QA Testers Toolbox</h2>
          <p>Enter a URL above to start testing</p>
        </div>
      </body>
    </html>
  `;

  // Enhanced injected JavaScript with all functionality restored
  const injectedJavaScript = `
    (function() {
      // Console logging
      const originalConsole = window.console;
      window.console = {
        log: function(...args) {
          originalConsole.log.apply(this, args);
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'console',
            level: 'log',
            message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '),
            timestamp: new Date().toISOString()
          }));
        },
        error: function(...args) {
          originalConsole.error.apply(this, args);
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'console',
            level: 'error',
            message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '),
            timestamp: new Date().toISOString()
          }));
        },
        warn: function(...args) {
          originalConsole.warn.apply(this, args);
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'console',
            level: 'warn',
            message: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '),
            timestamp: new Date().toISOString()
          }));
        }
      };

      // Network monitoring
      const originalFetch = window.fetch;
      window.fetch = function(...args) {
        const startTime = performance.now();
        const requestUrl = typeof args[0] === 'string' ? args[0] : args[0].url;
        
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'network',
          status: 'start',
          url: requestUrl,
          timestamp: new Date().toISOString()
        }));

        return originalFetch.apply(this, args)
          .then(response => {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'network',
              status: 'complete',
              url: requestUrl,
              duration: performance.now() - startTime,
              timestamp: new Date().toISOString()
            }));
            return response;
          })
          .catch(error => {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'network',
              status: 'error',
              url: requestUrl,
              error: error.message,
              timestamp: new Date().toISOString()
            }));
            throw error;
          });
      };

      // Element inspector
      window.toggleInspector = function(enabled) {
        if (enabled) {
          document.body.addEventListener('mouseover', highlightElement);
          document.body.addEventListener('click', inspectElement, true);
          document.body.style.cursor = 'crosshair';
        } else {
          document.body.removeEventListener('mouseover', highlightElement);
          document.body.removeEventListener('click', inspectElement, true);
          document.body.style.cursor = 'default';
          removeHighlight();
        }
      };

      let highlightedElement = null;
      let highlightOverlay = null;

      function createHighlightOverlay() {
        if (!highlightOverlay) {
          highlightOverlay = document.createElement('div');
          highlightOverlay.style.position = 'absolute';
          highlightOverlay.style.border = '2px solid #007AFF';
          highlightOverlay.style.backgroundColor = 'rgba(0, 122, 255, 0.1)';
          highlightOverlay.style.pointerEvents = 'none';
          highlightOverlay.style.zIndex = '10000';
          document.body.appendChild(highlightOverlay);
        }
      }

      function removeHighlight() {
        if (highlightOverlay) {
          highlightOverlay.remove();
          highlightOverlay = null;
        }
      }

      function highlightElement(event) {
        createHighlightOverlay();
        const rect = event.target.getBoundingClientRect();
        highlightOverlay.style.top = rect.top + window.scrollY + 'px';
        highlightOverlay.style.left = rect.left + window.scrollX + 'px';
        highlightOverlay.style.width = rect.width + 'px';
        highlightOverlay.style.height = rect.height + 'px';
        highlightedElement = event.target;
        event.stopPropagation();
      }

      function inspectElement(event) {
        if (!highlightedElement) return;
        
        const element = highlightedElement;
        const elementInfo = {
          tagName: element.tagName.toLowerCase(),
          id: element.id,
          className: element.className,
          textContent: element.textContent.trim().substring(0, 100),
          attributes: Array.from(element.attributes).map(attr => ({
            name: attr.name,
            value: attr.value
          })),
          rect: element.getBoundingClientRect()
        };

        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'inspector',
          element: elementInfo,
          timestamp: new Date().toISOString()
        }));

        event.preventDefault();
        event.stopPropagation();
      }

      // Action recording
      window.isRecording = false;
      window.recordedActions = [];

      function recordAction(action) {
        if (!window.isRecording) return;
        
        window.recordedActions.push({
          ...action,
          timestamp: new Date().toISOString()
        });

        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'action',
          action,
          timestamp: new Date().toISOString()
        }));
      }

      document.addEventListener('click', function(event) {
        if (!window.isRecording) return;
        
        recordAction({
          type: 'click',
          target: {
            tagName: event.target.tagName,
            id: event.target.id,
            className: event.target.className,
            textContent: event.target.textContent.trim().substring(0, 100)
          },
          x: event.clientX,
          y: event.clientY
        });
      }, true);

      document.addEventListener('input', function(event) {
        if (!window.isRecording) return;
        
        recordAction({
          type: 'input',
          target: {
            tagName: event.target.tagName,
            id: event.target.id,
            className: event.target.className,
            value: event.target.value
          }
        });
      }, true);

      // Performance monitoring
      let lastFPSUpdate = performance.now();
      let frameCount = 0;

      function updatePerformanceMetrics() {
        const now = performance.now();
        frameCount++;

        if (now - lastFPSUpdate >= 1000) {
          const fps = Math.round((frameCount * 1000) / (now - lastFPSUpdate));
          
          const metrics = {
            fps,
            domNodes: document.getElementsByTagName('*').length,
            pageLoadTime: performance.timing ? 
              (performance.timing.loadEventEnd - performance.timing.navigationStart) : 0,
            resourceCount: performance.getEntriesByType('resource').length,
            memory: performance.memory ? {
              usedJSHeapSize: performance.memory.usedJSHeapSize,
              totalJSHeapSize: performance.memory.totalJSHeapSize
            } : null
          };

          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'performance',
            metrics,
            timestamp: new Date().toISOString()
          }));

          frameCount = 0;
          lastFPSUpdate = now;
        }

        requestAnimationFrame(updatePerformanceMetrics);
      }

      requestAnimationFrame(updatePerformanceMetrics);
    })();
    true;
  `;

  const handleWebViewLoad = () => {
    setWebViewReady(true);
  };

  const handleMessage = (event) => {
    try {
      if (!event?.nativeEvent?.data) {
        console.warn('Invalid event received in handleMessage');
        return;
      }
      
      const data = JSON.parse(event.nativeEvent.data);
      if (!data?.type) {
        console.warn('Invalid data format received');
        return;
      }

      switch (data.type) {
        case 'performance':
          if (!data.metrics) return;
          
          // Only keep essential metrics data to reduce payload size
          const metrics = {
            fps: data.metrics.fps,
            domNodes: data.metrics.domNodes,
            pageLoadTime: data.metrics.pageLoadTime,
            resourceCount: data.metrics.resourceCount,
            memory: data.metrics.memory ? {
              usedJSHeapSize: data.metrics.memory.usedJSHeapSize,
              totalJSHeapSize: data.metrics.memory.totalJSHeapSize
            } : null
          };

          setPerformanceMetrics(prev => ({
            ...prev,
            fps: metrics.fps ? [...(prev.fps || []).slice(-10), metrics.fps] : prev.fps,
            domNodes: metrics.domNodes || prev.domNodes,
            pageLoadTime: metrics.pageLoadTime || prev.pageLoadTime,
            resourceCount: metrics.resourceCount || prev.resourceCount,
            memory: metrics.memory || prev.memory
          }));
          break;

        case 'console':
          if (!data.message) return;
          setConsoleMessages(prev => {
            const newMessages = [...prev, {
              level: data.level || 'log',
              message: typeof data.message === 'object' ? 
                JSON.stringify(data.message) : String(data.message),
              timestamp: data.timestamp || new Date().toISOString()
            }].slice(-100); // Keep only last 100 messages
            return newMessages;
          });
          break;

        case 'network':
          if (!data.url) return;
          setNetworkRequests(prev => {
            const newRequests = [...prev, {
              url: data.url,
              status: data.status,
              duration: data.duration,
              timestamp: data.timestamp || new Date().toISOString()
            }].slice(-50); // Keep only last 50 requests
            return newRequests;
          });
          break;

        case 'inspector':
          if (!data.element) return;
          setSelectedElement(data.element);
          break;

        case 'action':
          if (!data.action) return;
          setCurrentRecording(prev => [...prev, data.action]);
          break;
      }
    } catch (error) {
      console.error('Error in handleMessage:', error);
    }
  };

  const handleError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.warn('WebView error:', nativeEvent);
    setUrlError(nativeEvent.description || 'Failed to load page');
  };

  const toggleRecording = () => {
    const newState = !isRecording;
    setIsRecording(newState);
    webViewRef.current?.injectJavaScript(`
      window.isRecording = ${newState};
      window.recordedActions = [];
      true;
    `);
  };

  const toggleInspector = () => {
    const newState = !isInspectorMode;
    setIsInspectorMode(newState);
    webViewRef.current?.injectJavaScript(`
      if (window.toggleInspector) {
        window.toggleInspector(${newState});
      }
      true;
    `);
  };

  const replayRecording = async (recording) => {
    if (!webViewRef.current) return;
    
    await webViewRef.current.injectJavaScript(`
      (async function() {
        ${recording.actions.map(action => {
          if (action.type === 'click') {
            return `
              await new Promise(resolve => setTimeout(resolve, 1000));
              document.querySelector('${action.target.selector}')?.click();
            `;
          } else if (action.type === 'input') {
            return `
              await new Promise(resolve => setTimeout(resolve, 1000));
              const element = document.querySelector('${action.target.selector}');
              if (element) {
                element.value = '${action.target.value}';
                element.dispatchEvent(new Event('input', { bubbles: true }));
              }
            `;
          }
          return '';
        }).join('\n')}
      })();
    `);
  };

  const isValidUrl = (string) => {
    try {
      // First, clean up the URL
      let urlToTest = string.trim();
      
      // If it doesn't have a protocol, add https://
      if (!urlToTest.startsWith('http://') && !urlToTest.startsWith('https://')) {
        urlToTest = 'https://' + urlToTest;
      }
      
      // Try to create a URL object
      new URL(urlToTest);
      return true;
    } catch (e) {
      return false;
    }
  };

  const loadUrl = useCallback((urlToLoad) => {
    if (!urlToLoad) {
      setUrlError('Please enter a URL');
      return;
    }

    // Clean up the URL
    let processedUrl = urlToLoad.trim();
    
    // Remove any existing protocol
    processedUrl = processedUrl.replace(/^https?:\/\//, '');
    
    // Add https:// protocol
    processedUrl = 'https://' + processedUrl;

    if (isValidUrl(processedUrl)) {
      setUrlError('');
      setCurrentLoadedUrl(processedUrl);
    } else {
      setUrlError('Invalid URL format. Please enter a valid website address.');
    }
  }, []);

  const handleUrlChange = (text) => {
    // Remove https:// prefix if user types it (since we show it separately)
    const cleanText = text.replace(/^https?:\/\//, '');
    setUrl(cleanText);

    if (urlLoadTimeoutRef.current) {
      clearTimeout(urlLoadTimeoutRef.current);
    }
  };

  const handleUrlSubmit = () => {
    if (urlLoadTimeoutRef.current) {
      clearTimeout(urlLoadTimeoutRef.current);
    }
    
    // Get the raw URL input
    let finalUrl = url.trim();
    
    // Remove https:// if user somehow included it
    finalUrl = finalUrl.replace(/^https?:\/\//, '');
    
    loadUrl(finalUrl);
  };

  const handleWebViewError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    if (nativeEvent.code === -2) { // ERR_NAME_NOT_RESOLVED
      setUrlError('Could not resolve the website address');
    } else {
      setUrlError(`Error loading page: ${nativeEvent.description}`);
    }
  };

  const renderDevToolsTabs = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'console' && styles.activeTab]}
        onPress={() => setActiveTab('console')}
      >
        <Text style={styles.tabText}>Console</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'network' && styles.activeTab]}
        onPress={() => setActiveTab('network')}
      >
        <Text style={styles.tabText}>Network</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'inspector' && styles.activeTab]}
        onPress={() => setActiveTab('inspector')}
      >
        <Text style={styles.tabText}>Inspector</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'performance' && styles.activeTab]}
        onPress={() => setActiveTab('performance')}
      >
        <Text style={styles.tabText}>Performance</Text>
      </TouchableOpacity>
    </View>
  );

  const renderConsoleTab = () => {
    try {
      if (!Array.isArray(consoleMessages)) {
        console.warn('consoleMessages is not an array:', consoleMessages);
        return null;
      }

      return (
        <ScrollView style={styles.tabContent}>
          {consoleMessages.map((msg, index) => (
            <View key={index} style={styles.logEntry}>
              <Text style={[styles.timestamp, styles.smallText]}>
                {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : 'No timestamp'}
              </Text>
              <Text style={[
                styles.logMessage,
                msg.level === 'error' && styles.errorLog,
                msg.level === 'warn' && styles.warnLog
              ]}>
                {msg.message || 'No message'}
              </Text>
            </View>
          ))}
        </ScrollView>
      );
    } catch (error) {
      console.error('Error rendering console tab:', error);
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error displaying console: {error.message}</Text>
        </View>
      );
    }
  };

  const renderNetworkTab = () => (
    <ScrollView style={styles.tabContent}>
      {networkRequests.map((request, index) => (
        <View key={index} style={styles.networkEntry}>
          <Text style={styles.smallText}>{new Date(request.timestamp).toLocaleTimeString()}</Text>
          <Text style={[
            styles.networkUrl,
            request.status === 'error' && styles.errorText
          ]}>
            {request.url}
          </Text>
          {request.duration && (
            <Text style={styles.duration}>{Math.round(request.duration)}ms</Text>
          )}
          {request.error && (
            <Text style={styles.errorText}>{request.error}</Text>
          )}
        </View>
      ))}
    </ScrollView>
  );

  const renderPerformanceTab = () => {
    if (!performanceMetrics) return null;
    
    return (
      <ScrollView style={styles.tabContent}>
        <View style={styles.metricsContainer}>
          <Text style={styles.metricLabel}>
            FPS: {performanceMetrics.fps && performanceMetrics.fps.length > 0 ? 
              performanceMetrics.fps[performanceMetrics.fps.length - 1] : '0'}
          </Text>
          <Text style={styles.metricLabel}>
            DOM Nodes: {performanceMetrics.domNodes || '0'}
          </Text>
          <Text style={styles.metricLabel}>
            Memory Usage: {performanceMetrics.memory && performanceMetrics.memory.usedJSHeapSize ? 
              `${(performanceMetrics.memory.usedJSHeapSize / (1024 * 1024)).toFixed(1)}MB / 
               ${(performanceMetrics.memory.totalJSHeapSize / (1024 * 1024)).toFixed(1)}MB` : 
              'Not available'}
          </Text>
          <Text style={styles.metricLabel}>
            Resources: {performanceMetrics.resourceCount || '0'}
          </Text>
          <Text style={styles.metricLabel}>
            Load Time: {performanceMetrics.pageLoadTime ? `${performanceMetrics.pageLoadTime}ms` : 'Not available'}
          </Text>
        </View>
      </ScrollView>
    );
  };

  const renderDevToolsContent = () => {
    try {
      switch (activeTab) {
        case 'console':
          return renderConsoleTab();
        case 'network':
          return renderNetworkTab();
        case 'inspector':
          return <ElementInspector selectedElement={selectedElement} />;
        case 'performance':
          return renderPerformanceTab();
        default:
          return null;
      }
    } catch (error) {
      console.error('Error rendering DevTools content:', error);
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error displaying content: {error.message}</Text>
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.urlContainer}>
        <View style={styles.urlInputContainer}>
          <Text style={styles.urlPrefix}>https://</Text>
          <TextInput
            ref={urlInputRef}
            style={styles.urlInput}
            value={url}
            onChangeText={handleUrlChange}
            placeholder="Enter website address"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            onSubmitEditing={handleUrlSubmit}
            returnKeyType="go"
          />
        </View>
        <View style={styles.buttonsContainer}>
          <CustomButton
            title="Go"
            onPress={handleUrlSubmit}
            style={styles.goButton}
          />
          <CustomButton
            title={isRecording ? "Stop Recording" : "Start Recording"}
            onPress={toggleRecording}
            style={[styles.button, isRecording && styles.recordingButton]}
          />
          <CustomButton
            title={isInspectorMode ? "Stop Inspect" : "Inspect"}
            onPress={toggleInspector}
            style={[styles.button, isInspectorMode && styles.inspectorButton]}
          />
          <CustomButton
            title={showDevTools ? "Hide DevTools" : "Show DevTools"}
            onPress={() => setShowDevTools(!showDevTools)}
            style={styles.button}
          />
        </View>
      </View>

      {urlError ? (
        <Text style={styles.errorText}>{urlError}</Text>
      ) : null}

      <View style={styles.webviewContainer}>
        <WebView
          ref={webViewRef}
          source={currentLoadedUrl ? { uri: currentLoadedUrl } : { html: blankHtml }}
          onLoad={handleWebViewLoad}
          onError={handleError}
          onMessage={handleMessage}
          injectedJavaScript={injectedJavaScript}
          startInLoadingState={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          style={styles.webview}
        />
      </View>

      {showDevTools && (
        <View style={styles.devTools}>
          {renderDevToolsTabs()}
          {renderDevToolsContent()}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  urlContainer: {
    padding: 10,
    flexDirection: 'column',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    gap: 10,
  },
  urlInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    height: 40,
  },
  urlPrefix: {
    color: '#666',
    fontSize: 14,
    paddingLeft: 10,
  },
  urlInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 5,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goButton: {
    width: 50,
    height: 40,
    marginHorizontal: 5,
  },
  button: {
    marginHorizontal: 5,
    paddingHorizontal: 10,
    height: 40,
  },
  recordingButton: {
    backgroundColor: '#dc3545',
  },
  inspectorButton: {
    backgroundColor: '#28a745',
  },
  webviewContainer: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  devTools: {
    height: 300,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    color: '#333',
  },
  tabContent: {
    flex: 1,
    padding: 10,
  },
  logEntry: {
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  networkEntry: {
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  timestamp: {
    color: '#666',
  },
  smallText: {
    fontSize: 12,
  },
  logMessage: {
    fontSize: 13,
    fontFamily: 'monospace',
  },
  errorLog: {
    color: '#dc3545',
  },
  warnLog: {
    color: '#ffc107',
  },
  networkUrl: {
    fontSize: 13,
    fontFamily: 'monospace',
    color: '#0066cc',
  },
  duration: {
    fontSize: 12,
    color: '#28a745',
  },
  metricsContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    elevation: 2,
  },
  metricLabel: {
    fontSize: 14,
    marginBottom: 10,
    fontFamily: 'monospace',
  },
  errorContainer: {
    padding: 15,
    margin: 10,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  errorText: {
    color: '#b71c1c',
    fontSize: 14,
  },
});

export default WebViewTestingScreen;
