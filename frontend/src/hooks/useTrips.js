import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAxios } from './useAxios';
import { useAuth } from './useAuth';

export const useTrips = ({ page = 1, limit = 10, search = '', status = '', type = '' } = {}) => {
    const axios = useAxios();
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const tripsPath = user?.role === 'admin' ? '/trips' : `/trips/driver/${user?._id}`;

    const tripsQuery = useQuery({
        queryKey: ['trips', user?._id, page, search, status, type], // include user._id
        queryFn: async () => {
            if (!user) return [];
            const res = await axios.get(tripsPath, {
                params: { page, limit, search, status, type },
            });
            return res.data;
        },
        keepPreviousData: true,
        enabled: !!user,
    });

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

    const downloadTripReport = useMutation({
        mutationFn: async (id) => {
            const res = await axios.get(`/trips/${id}/report`, {
                responseType: 'blob', // important to handle PDF
            });

            // Create a download link
            const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Trip-${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        },
    });

    return {
        tripsQuery,
        createTrip,
        updateTrip,
        deleteTrip,
        startTrip,
        completeTrip,
        downloadTripReport
    };
};
