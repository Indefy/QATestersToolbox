import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DashboardScreen = () => {
  const [dashboardMetrics, setDashboardMetrics] = useState({
    testCasesCompleted: 0,
    activeBugs: 0,
    testCasesCoverage: 0,
    environmentProfiles: 0
  });

  useEffect(() => {
    // Fetch dashboard metrics from local storage or API
    const fetchMetrics = async () => {
      try {
        // Example of retrieving metrics from AsyncStorage
        const storedMetrics = await AsyncStorage.getItem('dashboardMetrics');
        if (storedMetrics) {
          setDashboardMetrics(JSON.parse(storedMetrics));
        }
      } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
      }
    };

    fetchMetrics();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>QA Testers Dashboard</Text>
      
      <View style={styles.metricsContainer}>
        <View style={styles.metricCard}>
          <Text style={styles.metricTitle}>Test Cases Completed</Text>
          <Text style={styles.metricValue}>{dashboardMetrics.testCasesCompleted}</Text>
        </View>
        
        <View style={styles.metricCard}>
          <Text style={styles.metricTitle}>Active Bugs</Text>
          <Text style={styles.metricValue}>{dashboardMetrics.activeBugs}</Text>
        </View>
        
        <View style={styles.metricCard}>
          <Text style={styles.metricTitle}>Test Coverage</Text>
          <Text style={styles.metricValue}>{dashboardMetrics.testCasesCoverage}%</Text>
        </View>
        
        <View style={styles.metricCard}>
          <Text style={styles.metricTitle}>Environments</Text>
          <Text style={styles.metricValue}>{dashboardMetrics.environmentProfiles}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    padding: 15
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center'
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  metricCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    margin: 10,
    width: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  metricTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff'
  }
});

export default DashboardScreen;
