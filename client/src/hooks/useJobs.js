import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';

// Query keys for cache management
export const jobKeys = {
    all: ['jobs'],
    lists: () => [...jobKeys.all, 'list'],
    list: (filters) => [...jobKeys.lists(), filters],
    details: () => [...jobKeys.all, 'detail'],
    detail: (id) => [...jobKeys.details(), id],
    company: (companyName) => [...jobKeys.all, 'company', companyName],
};

// Default options for long stale times
const defaultQueryOptions = {
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000,    // 60 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
};

// Hook to fetch all jobs with filters
export function useJobs(params = {}) {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value);
        }
    });

    const queryString = queryParams.toString();

    return useQuery({
        queryKey: jobKeys.list(params),
        queryFn: async () => {
            const { data } = await api.get(`/jobs${queryString ? `?${queryString}` : ''}`);
            return data;
        },
        ...defaultQueryOptions,
    });
}

// Hook to fetch a single job by ID
export function useJobDetails(id, { view } = {}) {
    return useQuery({
        queryKey: jobKeys.detail([id, view || null]),
        queryFn: async () => {
            const suffix = view ? `?view=${view}` : '';
            const { data } = await api.get(`/jobs/${id}${suffix}`);
            return data;
        },
        enabled: !!id,
        ...defaultQueryOptions,
    });
}

// Hook to fetch jobs by company
export function useCompanyJobs(companyName) {
    return useQuery({
        queryKey: jobKeys.company(companyName),
        queryFn: async () => {
            const { data } = await api.get(`/jobs/company/${encodeURIComponent(companyName)}`);
            return data;
        },
        enabled: !!companyName,
        ...defaultQueryOptions,
    });
}

// Hook to create a new job
export function useCreateJob() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (jobData) => {
            const { data } = await api.post('/jobs', jobData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: jobKeys.all });
        },
    });
}

// Hook to update a job
export function useUpdateJob() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...jobData }) => {
            const { data } = await api.put(`/jobs/${id}`, jobData);
            return data;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: jobKeys.all });
            queryClient.invalidateQueries({ queryKey: jobKeys.detail(id) });
        },
    });
}

// Hook to delete a job
export function useDeleteJob() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id) => {
            const { data } = await api.delete(`/jobs/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: jobKeys.all });
        },
    });
}

// Hook to fetch companies (for filters)
export function useCompanies() {
    return useQuery({
        queryKey: ['companies'],
        queryFn: async () => {
            const { data } = await api.get('/companies');
            return data;
        },
        staleTime: 24 * 60 * 60 * 1000, // 24 hours (Static data)
        gcTime: 24 * 60 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false
    });
}

// Hook to fetch locations (for filters)
export function useLocations() {
    return useQuery({
        queryKey: ['locations'],
        queryFn: async () => {
            const { data } = await api.get('/jobs/locations');
            return data;
        },
        staleTime: 24 * 60 * 60 * 1000, // 24 hours (Static data)
        gcTime: 24 * 60 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false
    });
}

// Hook to fetch latest jobs for Home page
export function useLatestJobs() {
    return useQuery({
        queryKey: jobKeys.list({ latest: true }),
        queryFn: async () => {
            console.log('Fetching /jobs/latest');
            const { data } = await api.get('/jobs/latest');
            console.log('Latest jobs received:', data);
            return data;
        },
        staleTime: 10 * 1000, // 10 seconds for quick updates after publish
        gcTime: 60 * 60 * 1000,
        refetchOnWindowFocus: true
    });
}

// Hook to fetch company details
export function useCompanyDetails(companyName) {
    return useQuery({
        queryKey: ['company', companyName],
        queryFn: async () => {
            const { data } = await api.get(`/companies/${encodeURIComponent(companyName)}`);
            return data;
        },
        enabled: !!companyName,
        staleTime: 60 * 60 * 1000, // 1 hour
        gcTime: 24 * 60 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false
    });
}

// ==================== WALKIN HOOKS ====================

// Query keys for walkin cache management
export const walkinKeys = {
    all: ['walkins'],
    lists: () => [...walkinKeys.all, 'list'],
    list: (filters) => [...walkinKeys.lists(), filters],
    details: () => [...walkinKeys.all, 'detail'],
    detail: (id) => [...walkinKeys.details(), id],
};

// Hook to fetch all walkins with filters
export function useWalkins(params = {}) {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value);
        }
    });

    const queryString = queryParams.toString();

    return useQuery({
        queryKey: walkinKeys.list(params),
        queryFn: async () => {
            const { data } = await api.get(`/walkins${queryString ? `?${queryString}` : ''}`);
            return data;
        },
        ...defaultQueryOptions,
    });
}

// Hook to fetch a single walkin by ID
export function useWalkinDetails(id) {
    return useQuery({
        queryKey: walkinKeys.detail(id),
        queryFn: async () => {
            const { data } = await api.get(`/walkins/${id}`);
            return data;
        },
        enabled: !!id,
        ...defaultQueryOptions,
    });
}

// Hook to create a new walkin
export function useCreateWalkin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (walkinData) => {
            const { data } = await api.post('/walkins', walkinData);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: walkinKeys.all });
        },
    });
}

// Hook to update a walkin
export function useUpdateWalkin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...walkinData }) => {
            const { data } = await api.put(`/walkins/${id}`, walkinData);
            return data;
        },
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: walkinKeys.all });
            queryClient.invalidateQueries({ queryKey: walkinKeys.detail(id) });
        },
    });
}

// Hook to delete a walkin
export function useDeleteWalkin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id) => {
            const { data } = await api.delete(`/walkins/${id}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: walkinKeys.all });
        },
    });
}

