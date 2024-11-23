import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GlassContainer } from '../components/ui/GlassContainer';
import { AnimatedButton } from '../components/ui/AnimatedButton';
import { GlassInput } from '../components/ui/GlassInput';
import { colors, typography, borderRadius, shadows } from '../styles/theme';
import ElementInspector from '../components/ElementInspector';
import PerformanceMetrics from '../components/PerformanceMetrics';

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
      let urlToTest = string.trim();
      
      if (!urlToTest.startsWith('http://') && !urlToTest.startsWith('https://')) {
        urlToTest = 'https://' + urlToTest;
      }
      
      new URL(urlToTest);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleLoadUrl = () => {
    if (!url) {
      setUrlError('Please enter a URL');
      return;
    }

    let processedUrl = url.trim();
    if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
      processedUrl = 'https://' + processedUrl;
    }

    if (isValidUrl(processedUrl)) {
      setUrlError('');
      setCurrentLoadedUrl(processedUrl);
      setWebViewReady(true);
    } else {
      setUrlError('Invalid URL format. Please enter a valid website address.');
    }
  };

  const handleUrlChange = (text) => {
    setUrl(text);
    setUrlError('');
  };

  return (
    <LinearGradient
      colors={[colors.background, '#2A2A4A']}
      style={styles.gradient}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <GlassContainer style={styles.urlContainer}>
          <GlassInput
            label="Enter URL"
            value={url}
            onChangeText={(text) => {
              setUrl(text);
              setUrlError('');
            }}
            placeholder="https://example.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
          {urlError ? (
            <Text style={styles.errorText}>{urlError}</Text>
          ) : null}
          <View style={styles.buttonContainer}>
            <AnimatedButton
              onPress={handleLoadUrl}
              style={styles.button}
              variant="primary"
            >
              <Text style={styles.buttonText}>Load URL</Text>
            </AnimatedButton>
          </View>
        </GlassContainer>

        <GlassContainer style={styles.webviewContainer}>
          {webViewReady && currentLoadedUrl ? (
            <WebView
              ref={webViewRef}
              source={{ uri: currentLoadedUrl }}
              onLoad={handleWebViewLoad}
              onError={handleError}
              onMessage={handleMessage}
              injectedJavaScript={injectedJavaScript}
              startInLoadingState={true}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              style={styles.webview}
            />
          ) : (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderText}>
                Enter a URL above to start testing
              </Text>
            </View>
          )}
        </GlassContainer>

        <View style={styles.controlsContainer}>
          <GlassContainer style={styles.metricsContainer}>
            <PerformanceMetrics performanceMetrics={performanceMetrics} />
          </GlassContainer>

          <View style={styles.actionButtons}>
            <AnimatedButton
              onPress={toggleRecording}
              variant={isRecording ? "accent" : "secondary"}
              style={styles.actionButton}
            >
              <Text style={styles.buttonText}>
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </Text>
            </AnimatedButton>

            <AnimatedButton
              onPress={toggleInspector}
              variant="primary"
              style={styles.actionButton}
            >
              <Text style={styles.buttonText}>
                Toggle Inspector
              </Text>
            </AnimatedButton>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showDevTools}
        onRequestClose={() => setShowDevTools(false)}
      >
        <ElementInspector selectedElement={selectedElement} />
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  urlContainer: {
    marginBottom: 16,
  },
  webviewContainer: {
    height: 400,
    marginBottom: 16,
  },
  controlsContainer: {
    gap: 16,
  },
  metricsContainer: {
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  actionButton: {
    flex: 1,
  },
  buttonContainer: {
    marginTop: 16,
  },
  button: {
    width: '100%',
  },
  buttonText: {
    color: colors.text,
    ...typography.body,
    fontWeight: '600',
  },
  errorText: {
    color: colors.error,
    ...typography.caption,
    marginTop: 4,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: colors.textSecondary,
    ...typography.body,
  },
});

export default WebViewTestingScreen;
