import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAxios } from './useAxios';

export const useTrips = ({ page = 1, limit = 10, search = '', status = '', type = '' } = {}) => {
    const axios = useAxios();
    const queryClient = useQueryClient();

    const tripsQuery = useQuery({
        queryKey: ['trips', page, search, status, type],
        queryFn: async () => {
            const res = await axios.get('/trips', {
                params: { page, limit, search, status, type },
            });
            return res.data; 
        },
        keepPreviousData: true,
    });

    // ... rest of your mutations (createTrip, etc) remain the same ...
    // (copy existing create/update/delete/start/complete mutations here)

    const createTrip = useMutation({
        mutationFn: (data) => axios.post('/trips', data),
        onSuccess: () => queryClient.invalidateQueries(['trips']),
    });

    const updateTrip = useMutation({
        mutationFn: ({ id, data }) => axios.put(`/trips/${id}`, data),
        onSuccess: () => queryClient.invalidateQueries(['trips']),
    });

    const deleteTrip = useMutation({
        mutationFn: (id) => axios.delete(`/trips/${id}`),
        onSuccess: () => queryClient.invalidateQueries(['trips']),
    });

    const startTrip = useMutation({
        mutationFn: ({ id, fuelStart }) => axios.patch(`/trips/${id}/start`, { fuelStart }),
        onSuccess: () => queryClient.invalidateQueries(['trips']),
    });

    const completeTrip = useMutation({
        mutationFn: ({ id, data }) => axios.patch(`/trips/${id}/complete`, data),
        onSuccess: () => queryClient.invalidateQueries(['trips']),
    });

    return {
        tripsQuery,
        createTrip,
        updateTrip,
        deleteTrip,
        startTrip,
        completeTrip,
    };
};