import { create } from 'zustand';
import { createJobsSlice } from '../slices/jobsSlice.js';

export const useJobsStore = create((set, get) => ({
  ...createJobsSlice(set, get)
}));