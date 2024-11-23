import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, borderRadius } from '../styles/theme';

const MetricItem = ({ label, value }) => (
  <View style={styles.metricItem}>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={styles.metricValue}>{value}</Text>
  </View>
);

const PerformanceMetrics = ({ performanceMetrics = {} }) => {
  const formatMemory = (bytes) => {
    if (typeof bytes !== 'number' || isNaN(bytes)) return 'N/A';
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatTime = (ms) => {
    if (typeof ms !== 'number' || isNaN(ms)) return 'N/A';
    return `${ms} ms`;
  };

  const formatFPS = (fps) => {
    if (typeof fps !== 'number' || isNaN(fps)) return 'N/A';
    return fps.toFixed(1);
  };

  const formatNumber = (num) => {
    if (typeof num !== 'number' || isNaN(num)) return 'N/A';
    return num.toString();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Performance Metrics</Text>
      
      <View style={styles.metricsGrid}>
        <MetricItem 
          label="FPS" 
          value={formatFPS(performanceMetrics?.fps)}
        />
        
        <MetricItem 
          label="DOM Nodes" 
          value={formatNumber(performanceMetrics?.domNodes)}
        />
        
        <MetricItem 
          label="Memory Usage" 
          value={formatMemory(performanceMetrics?.jsHeapSize)}
        />
        
        <MetricItem 
          label="Resources" 
          value={formatNumber(performanceMetrics?.resourceCount)}
        />
        
        <MetricItem 
          label="Load Time" 
          value={formatTime(performanceMetrics?.pageLoadTime)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metricItem: {
    flex: 1,
    minWidth: 140,
    backgroundColor: colors.glass,
    borderRadius: borderRadius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  metricLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  metricValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
});

export default PerformanceMetrics;
