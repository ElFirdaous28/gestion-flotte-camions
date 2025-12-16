import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAxios } from './useAxios';

export const useFuelEntries = (tripId = null) => {
    const axios = useAxios();
    const queryClient = useQueryClient();

    const fuelEntriesQuery = useQuery({
        queryKey: ['fuelEntries', tripId],
        queryFn: async () => {
            const url = tripId ? `/fuel-entries/trip/${tripId}` : '/fuel-entries';
            const res = await axios.get(url);
            return res.data || [];
        },
        enabled: true,
    });

    // get Single Entry
    const getFuelEntryById = (id) =>
        useQuery({
            queryKey: ['fuelEntries', id],
            queryFn: async () => {
                const res = await axios.get(`/fuel-entries/${id}`);
                return res.data;
            },
            enabled: !!id,
        });

    // Create
    const createFuelEntry = useMutation({
        mutationFn: (formData) => axios.post('/fuel-entries', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['fuelEntries']);
            if (tripId) queryClient.invalidateQueries(['fuelEntries', tripId]);
        },
    });

    // Update (Expects FormData)
    const updateFuelEntry = useMutation({
        mutationFn: ({ id, formData }) => axios.put(`/fuel-entries/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['fuelEntries']);
            if (tripId) queryClient.invalidateQueries(['fuelEntries', tripId]);
        },
    });

    // Delete
    const deleteFuelEntry = useMutation({
        mutationFn: (id) => axios.delete(`/fuel-entries/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['fuelEntries']);
            if (tripId) queryClient.invalidateQueries(['fuelEntries', tripId]);
        },
    });

    return {
        fuelEntriesQuery,
        getFuelEntryById,
        createFuelEntry,
        updateFuelEntry,
        deleteFuelEntry,
    };
};