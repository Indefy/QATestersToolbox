import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Dimensions 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarChart, PieChart } from 'react-native-chart-kit';

const ReportsScreen = () => {
  const [testCaseStats, setTestCaseStats] = useState({
    total: 0,
    passed: 0,
    failed: 0,
    blocked: 0
  });

  const [bugStats, setBugStats] = useState({
    total: 0,
    low: 0,
    medium: 0,
    high: 0,
    critical: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch test case statistics
        const storedTestCases = await AsyncStorage.getItem('testCases');
        if (storedTestCases) {
          const testCases = JSON.parse(storedTestCases);
          const stats = {
            total: testCases.length,
            passed: testCases.filter(tc => tc.status === 'Passed').length,
            failed: testCases.filter(tc => tc.status === 'Failed').length,
            blocked: testCases.filter(tc => tc.status === 'Blocked').length
          };
          setTestCaseStats(stats);
        }

        // Fetch bug statistics
        const storedBugs = await AsyncStorage.getItem('bugReports');
        if (storedBugs) {
          const bugs = JSON.parse(storedBugs);
          const stats = {
            total: bugs.length,
            low: bugs.filter(b => b.priority === 'Low').length,
            medium: bugs.filter(b => b.priority === 'Medium').length,
            high: bugs.filter(b => b.priority === 'High').length,
            critical: bugs.filter(b => b.priority === 'Critical').length
          };
          setBugStats(stats);
        }
      } catch (error) {
        console.error('Error fetching statistics:', error);
      }
    };

    fetchStats();
  }, []);

  const testCaseChartData = {
    labels: ['Passed', 'Failed', 'Blocked'],
    datasets: [{
      data: [
        testCaseStats.passed, 
        testCaseStats.failed, 
        testCaseStats.blocked
      ]
    }]
  };

  const bugPriorityData = [
    {
      name: 'Low',
      population: bugStats.low,
      color: '#28a745',
      legendFontColor: '#7F7F7F',
      legendFontSize: 15
    },
    {
      name: 'Medium',
      population: bugStats.medium,
      color: '#ffc107',
      legendFontColor: '#7F7F7F',
      legendFontSize: 15
    },
    {
      name: 'High',
      population: bugStats.high,
      color: '#dc3545',
      legendFontColor: '#7F7F7F',
      legendFontSize: 15
    },
    {
      name: 'Critical',
      population: bugStats.critical,
      color: '#000000',
      legendFontColor: '#7F7F7F',
      legendFontSize: 15
    }
  ];

  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>QA Reports</Text>
      
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Test Case Execution</Text>
        <Text style={styles.sectionSubtitle}>
          Total Test Cases: {testCaseStats.total}
        </Text>
        <BarChart
          data={testCaseChartData}
          width={Dimensions.get("window").width - 30}
          height={220}
          yAxisLabel=""
          chartConfig={chartConfig}
          verticalLabelRotation={30}
        />
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Bug Priority Distribution</Text>
        <Text style={styles.sectionSubtitle}>
          Total Bugs: {bugStats.total}
        </Text>
        <PieChart
          data={bugPriorityData}
          width={Dimensions.get("window").width - 30}
          height={220}
          chartConfig={chartConfig}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
          center={[10, 50]}
          absolute
        />
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
  sectionContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10
  }
});

export default ReportsScreen;
