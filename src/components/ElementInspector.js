import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const ElementInspector = ({ selectedElement }) => {
  if (!selectedElement) return null;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Element Inspector</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tag</Text>
        <Text style={styles.value}>{selectedElement.tagName}</Text>
      </View>

      {selectedElement.id && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ID</Text>
          <Text style={styles.value}>{selectedElement.id}</Text>
        </View>
      )}

      {selectedElement.className && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Classes</Text>
          <Text style={styles.value}>{selectedElement.className}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>CSS Properties</Text>
        {Object.entries(selectedElement.styles).map(([prop, value]) => (
          <View key={prop} style={styles.cssProperty}>
            <Text style={styles.propName}>{prop}:</Text>
            <Text style={styles.propValue}>{value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Computed Metrics</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Width</Text>
            <Text style={styles.metricValue}>{selectedElement.metrics.width}px</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Height</Text>
            <Text style={styles.metricValue}>{selectedElement.metrics.height}px</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>X</Text>
            <Text style={styles.metricValue}>{selectedElement.metrics.x}px</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Y</Text>
            <Text style={styles.metricValue}>{selectedElement.metrics.y}px</Text>
          </View>
        </View>
      </View>
    </ScrollView>
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
    marginBottom: 10,
  },
  section: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  value: {
    fontSize: 14,
    color: '#333',
  },
  cssProperty: {
    flexDirection: 'row',
    marginVertical: 2,
  },
  propName: {
    fontSize: 12,
    color: '#666',
    marginRight: 5,
  },
  propValue: {
    fontSize: 12,
    color: '#333',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  metric: {
    width: '50%',
    paddingVertical: 5,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
  },
  metricValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
});

export default ElementInspector;
