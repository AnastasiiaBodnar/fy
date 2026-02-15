import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  SafeAreaView,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
  Text
} from 'react-native';
import { useJobsStore } from '@workua/store';
import { WorkUaParser } from '@workua/core';
import { Fetcher } from '@workua/api';
import { StorageService } from '@workua/utils';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import JobCard from './components/JobCard';

export default function App() {
  const {
    jobs,
    isLoading,
    loadingDetails,
    searchQuery,
    setJobs,
    setLoading,
    updateJob,
    setLoadingDetails,
    setSearchQuery,
    getFilteredJobs
  } = useJobsStore();

  const parser = new WorkUaParser();
  const fetcher = new Fetcher({ strategy: 'allorigins' });

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const url = UrlBuilder.build();
      const html = await fetcher.fetchHTML(url);
      const parsedJobs = parser.parseVacancyList(html);
      setJobs(parsedJobs.slice(0, 10));
    } catch (error) {
      console.error('Помилка завантаження:', error);
      alert('Не вдалося завантажити вакансії. Перевірте з\'єднання.');
    } finally {
      setLoading(false);
    }
  };

  const fetchJobDetails = async (job, index) => {
    setLoadingDetails(index, true);
    try {
      const html = await fetcher.fetchHTML(job.link);
      const details = parser.parseVacancyDetails(html);
      updateJob(index, { details });
    } catch (error) {
      console.error('Помилка завантаження деталей:', error);
      alert('Не вдалося завантажити деталі вакансії');
    } finally {
      setLoadingDetails(index, false);
    }
  };

  const filteredJobs = getFilteredJobs();

  const renderItem = ({ item, index }) => (
    <JobCard
      job={item}
      index={index}
      onLoadDetails={fetchJobDetails}
      isLoadingDetails={loadingDetails[index]}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f7fa" />

      <Header
        onRefresh={fetchJobs}
        isLoading={isLoading}
        hasJobs={jobs.length > 0}
      />

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        totalCount={jobs.length}
        filteredCount={filteredJobs.length}
      />

      {isLoading && jobs.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#20c997" />
          <Text style={styles.loadingText}>Завантаження вакансій...</Text>
        </View>
      ) : filteredJobs.length === 0 && jobs.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📄</Text>
          <Text style={styles.emptyTitle}>Натисніть "Оновити" для початку</Text>
          <Text style={styles.emptyText}>Завантажте актуальні вакансії з Work.ua</Text>
        </View>
      ) : (
        <FlatList
          data={filteredJobs}
          keyExtractor={(item, index) => `${item.link}-${index}`}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={fetchJobs}
              colors={['#20c997']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>Вакансій не знайдено</Text>
              <Text style={styles.emptyText}>Спробуйте змінити параметри пошуку</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  list: {
    padding: 12,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b8c85',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    margin: 12,
    borderRadius: 12,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.3,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a3c34',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b8c85',
    textAlign: 'center',
  },
});