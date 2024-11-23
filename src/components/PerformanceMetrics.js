import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const PerformanceMetrics = ({ metrics }) => {
  const formatData = (data, label) => ({
    labels: data.map((_, i) => `${i * 5}s`),
    datasets: [{
      data: data,
      color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
    }],
    legend: [label],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Performance Metrics</Text>

      <View style={styles.metricContainer}>
        <Text style={styles.metricTitle}>FPS</Text>
        <LineChart
          data={formatData(metrics.fps, 'FPS')}
          width={300}
          height={150}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={styles.metricContainer}>
        <Text style={styles.metricTitle}>Memory Usage (MB)</Text>
        <LineChart
          data={formatData(metrics.memory, 'Memory')}
          width={300}
          height={150}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Page Load Time</Text>
          <Text style={styles.statValue}>{metrics.pageLoadTime}ms</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>DOM Nodes</Text>
          <Text style={styles.statValue}>{metrics.domNodes}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>JS Heap Size</Text>
          <Text style={styles.statValue}>{Math.round(metrics.jsHeapSize / 1024 / 1024)}MB</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  metricContainer: {
    marginBottom: 20,
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginHorizontal: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default PerformanceMetrics;
