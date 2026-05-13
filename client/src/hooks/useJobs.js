import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';

export const jobKeys = {
    all: ['jobs'],
    lists: () => [...jobKeys.all, 'list'],
    list: (filters) => [...jobKeys.lists(), filters],
    details: () => [...jobKeys.all, 'detail'],
    detail: (id) => [...jobKeys.details(), id],
    company: (companyName) => [...jobKeys.all, 'company', companyName],
};

// Shared options — cache for 5 min, no aggressive refetching
const defaultQueryOptions = {
    staleTime: 5 * 60 * 1000,   // 5 minutes — don't refetch if data is fresh
    gcTime:    10 * 60 * 1000,  // keep in memory 10 minutes
    refetchOnWindowFocus: false, // don't refetch on tab switch
    refetchOnMount: false,       // use cache if available
    retry: 1,
};

// Static data — companies, locations rarely change
const staticQueryOptions = {
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime:    24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
};

export function useJobs(params = {}) {
    const queryParams = new URLSearchParams();
    let filteredParams = {};

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, value);
                filteredParams[key] = value;
            }
        });
    }

    const queryString = queryParams.toString();
    const stableKey = JSON.stringify(filteredParams);

    return useQuery({
        queryKey: [jobKeys.all, 'list', stableKey],
        queryFn: async () => {
            const { data } = await api.get(`/jobs${queryString ? `?${queryString}` : ''}`);
            return data;
        },
        enabled: params !== null,
        ...defaultQueryOptions,
    });
}

export function useJobDetails(id, { view } = {}) {
    return useQuery({
        queryKey: jobKeys.detail([id, view || null]),
        queryFn: async () => {
            const suffix = view ? `?view=${view}` : '';
            const { data } = await api.get(`/jobs/${id}${suffix}`);
            return data;
        },
        enabled: !!id,
        staleTime: 10 * 60 * 1000, // 10 min
        gcTime:    30 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: 1,
    });
}

export function useCompanyJobs(companyName) {
    return useQuery({
        queryKey: jobKeys.company(companyName),
        queryFn: async () => {
            const { data } = await api.get(`/jobs/company/${encodeURIComponent(companyName)}`);
            return Array.isArray(data) ? data : (data.jobs || []);
        },
        enabled: !!companyName,
        ...defaultQueryOptions,
    });
}

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

export function useCompanies() {
    return useQuery({
        queryKey: ['companies'],
        queryFn: async () => {
            const { data } = await api.get('/companies');
            return data;
        },
        ...staticQueryOptions,
    });
}

export function useLocations() {
    return useQuery({
        queryKey: ['locations'],
        queryFn: async () => {
            const { data } = await api.get('/jobs/locations');
            return data;
        },
        ...staticQueryOptions,
    });
}

export function useLatestJobs() {
    return useQuery({
        queryKey: ['jobs', 'latest'],
        queryFn: async () => {
            const { data } = await api.get('/jobs/latest');
            return data;
        },
        staleTime: 3 * 60 * 1000,  // 3 minutes — fresh enough, not hammering server
        gcTime:    10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: 1,
    });
}

export function useCompanyDetails(companyName) {
    return useQuery({
        queryKey: ['company', companyName],
        queryFn: async () => {
            const { data } = await api.get(`/companies/${encodeURIComponent(companyName)}`);
            return data;
        },
        enabled: !!companyName,
        ...staticQueryOptions,
    });
}

// ==================== WALKIN HOOKS ====================

export const walkinKeys = {
    all: ['walkins'],
    lists: () => [...walkinKeys.all, 'list'],
    list: (filters) => [...walkinKeys.lists(), filters],
    details: () => [...walkinKeys.all, 'detail'],
    detail: (id) => [...walkinKeys.details(), id],
};

export function useWalkins(params = {}) {
    const queryParams = new URLSearchParams();
    let filteredParams = {};

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, value);
                filteredParams[key] = value;
            }
        });
    }

    const queryString = queryParams.toString();
    const stableKey = JSON.stringify(filteredParams);

    return useQuery({
        queryKey: [walkinKeys.all, 'list', stableKey],
        queryFn: async () => {
            const { data } = await api.get(`/walkins${queryString ? `?${queryString}` : ''}`);
            return data;
        },
        enabled: params !== null,
        ...defaultQueryOptions,
    });
}

export function useWalkinDetails(id) {
    return useQuery({
        queryKey: [walkinKeys.all, 'detail', id],
        queryFn: async () => {
            const { data } = await api.get(`/walkins/${id}`);
            return data;
        },
        enabled: !!id,
        staleTime: 10 * 60 * 1000,
        gcTime:    30 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: 1,
    });
}

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
