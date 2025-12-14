import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAxios } from './useAxios';

export const useTrailers = ({ page = 1, limit = 10, search = '', status = '', sort = 'createdAt', order = 'desc' } = {}) => {
    const axios = useAxios();
    const queryClient = useQueryClient();

    // get trailers
    const trailersQuery = useQuery({
        queryKey: ['trailers', page, search, status, sort, order],
        queryFn: async () => {
            const res = await axios.get('/trailers', {
                params: { page, limit, search, status, sort, order },
            });

            return {
                trailers: res.data.trailers,
                pagination: res.data.pagination,
            };
        },
        keepPreviousData: true,
    });

    // get trailer by id
    const getTrailerById = (id) =>
        useQuery({
            queryKey: ['trailers', id],
            queryFn: async () => {
                const res = await axios.get(`/trailers/${id}`);
                return res.data;
            },
            enabled: !!id,
        });

    // create
    const createTrailer = useMutation({
        mutationFn: (data) => axios.post('/trailers', data),
        onSuccess: () => queryClient.invalidateQueries(['trailers']),
    });

    // update
    const updateTrailer = useMutation({
        mutationFn: ({ id, data }) => axios.put(`/trailers/${id}`, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries(['trailers']);
            queryClient.invalidateQueries(['trailers', variables.id]);
        },
    });

    // delete
    const deleteTrailer = useMutation({
        mutationFn: (id) => axios.delete(`/trailers/${id}`),
        onSuccess: () => queryClient.invalidateQueries(['trailers']),
    });

    // update status
    const updateTrailerStatus = useMutation({
        mutationFn: ({ id, status }) =>
            axios.patch(`/trailers/${id}/status`, { status }),
        onSuccess: () => queryClient.invalidateQueries(['trailers']),
    });

    return {
        trailersQuery,
        getTrailerById,
        createTrailer,
        updateTrailer,
        deleteTrailer,
        updateTrailerStatus,
    };
};