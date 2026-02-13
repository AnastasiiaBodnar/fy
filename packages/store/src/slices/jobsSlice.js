export const createJobsSlice = (set, get) => ({
  jobs: [],
  isLoading: false,
  loadingDetails: {},
  searchQuery: '',

  setJobs: (jobs) => set({ jobs }),
  
  updateJob: (index, updates) => set((state) => {
    const newJobs = [...state.jobs];
    newJobs[index] = { ...newJobs[index], ...updates };
    return { jobs: newJobs };
  }),

  setLoading: (isLoading) => set({ isLoading }),

  setLoadingDetails: (index, loading) => set((state) => ({
    loadingDetails: { ...state.loadingDetails, [index]: loading }
  })),

  setSearchQuery: (query) => set({ searchQuery: query }),

  getFilteredJobs: () => {
    const { jobs, searchQuery } = get();
    if (!searchQuery) return jobs;

    return jobs.filter(job =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  },

  clearJobs: () => set({ jobs: [], searchQuery: '' })
});