import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAxios } from './useAxios';

export const useFuelEntries = (tripId = null) => {
    const axios = useAxios();
    const queryClient = useQueryClient();

    // 1. Get Entries
    const fuelEntriesQuery = useQuery({
        queryKey: ['fuelEntries', tripId],
        queryFn: async () => {
            try {
                const url = tripId ? `/fuel/trip/${tripId}` : '/fuel';
                const res = await axios.get(url);
                return res.data || [];
            } catch (err) {
                // If backend returns 404 (No entries found), return empty array instead of throwing error
                if (err.response && err.response.status === 404) {
                    return [];
                }
                throw err;
            }
        },
        enabled: true,
    });

    // 2. Create
    const createFuelEntry = useMutation({
        mutationFn: (formData) => axios.post('/fuel', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['fuelEntries']); // Refetch list
        },
    });

    // 3. Update
    const updateFuelEntry = useMutation({
        mutationFn: ({ id, formData }) => axios.put(`/fuel/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['fuelEntries']);
        },
    });

    // 4. Delete
    const deleteFuelEntry = useMutation({
        mutationFn: (id) => axios.delete(`/fuel/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['fuelEntries']);
        },
    });

    return {
        fuelEntriesQuery,
        createFuelEntry,
        updateFuelEntry,
        deleteFuelEntry,
    };
};