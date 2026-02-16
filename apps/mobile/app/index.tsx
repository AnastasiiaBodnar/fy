import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  SafeAreaView,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
  Text,
  TouchableOpacity,

  ScrollView,
  Pressable
} from 'react-native';
import { useJobsStore } from '@workua/store';
import { WorkUaParser } from '@workua/core';
import { Fetcher, UrlBuilder } from '@workua/api';

export default function Index() {
  const {
    jobs,
    isLoading,
    loadingDetails,

    setJobs,
    setLoading,
    updateJob,
    setLoadingDetails
  } = useJobsStore();

  const parser = new WorkUaParser();

  const fetcher = new Fetcher();

  const fetchJobs = async () => {
    setLoading(true);
    try {
      // Use UrlBuilder.build() to get the default URL (Khmelnytskyi, all jobs)
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

  const fetchJobDetails = async (job: any, index: number) => {
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



  // Job Card Component
  const JobCard = ({ job, index, onLoadDetails, isLoadingDetails }: any) => {
    const [expanded, setExpanded] = useState(false);

    const handleExpand = () => {
      if (!expanded && !job.details) {
        onLoadDetails(job, index);
      }
      setExpanded(!expanded);
    };

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.jobTitle}>{job.title}</Text>
            <Text style={styles.company}>{job.company}</Text>
            <Text style={styles.location}>{job.location}</Text>
          </View>
        </View>

        {expanded && job.details && (
          <View style={styles.details}>
            <ScrollView style={styles.detailsScroll}>
              <Text style={styles.detailsText}>{job.details.fullDescription}</Text>
            </ScrollView>
          </View>
        )}

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.detailsButton}
            onPress={handleExpand}
            disabled={isLoadingDetails}
          >
            {isLoadingDetails ? (
              <ActivityIndicator size="small" color="#ff4965" />
            ) : (
              <Text style={styles.detailsButtonText}>
                {expanded ? 'Згорнути' : 'Детальніше'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderItem = ({ item, index }: any) => (
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

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Work.ua Parser</Text>
        <TouchableOpacity
          style={[styles.refreshButton, isLoading && styles.buttonDisabled]}
          onPress={fetchJobs}
          disabled={isLoading}
        >
          <Text style={styles.refreshButtonText}>
            {isLoading ? 'Завантаження...' : 'Оновити'}
          </Text>
        </TouchableOpacity>
      </View>



      {isLoading && jobs.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff4965" />
          <Text style={styles.loadingText}>Завантаження вакансій...</Text>
        </View>
      ) : jobs.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}></Text>
          <Text style={styles.emptyTitle}>Натисніть "Оновити" для початку</Text>
          <Text style={styles.emptyText}>Завантажте актуальні вакансії з Work.ua</Text>
        </View>
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(item, index) => `${item.link}-${index}`}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={fetchJobs}
              colors={['#ff4965']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}></Text>
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
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ff4965',
  },
  refreshButton: {
    backgroundColor: '#ff4965',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  list: {
    padding: 12,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a3c34',
    marginBottom: 8,
  },
  company: {
    fontSize: 14,
    color: '#ff4965',
    fontWeight: '500',
    marginBottom: 4,
  },
  location: {
    fontSize: 13,
    color: '#6b8c85',
  },
  details: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e1e8ed',
    maxHeight: 200,
  },
  detailsScroll: {
    maxHeight: 180,
  },
  detailsText: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
  detailsLoading: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e1e8ed',
    alignItems: 'center',
    paddingVertical: 8,
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
  cardActions: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    alignItems: 'flex-start',
  },
  detailsButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ff4965',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsButtonText: {
    color: '#ff4965',
    fontWeight: '600',
    fontSize: 14,
  },
  cardHeader: {
    marginBottom: 8,
  },
  cardTitleContainer: {
    flex: 1,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b8c85',
    textAlign: 'center',
  },
});
