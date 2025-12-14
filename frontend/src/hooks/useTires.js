import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAxios } from './useAxios';

export const useTires = ({ page = 1, limit = 10, search = '', status = '', sort = 'createdAt', order = 'desc', truck = '', trailer = '' } = {}) => {
    const axios = useAxios();
    const queryClient = useQueryClient();

    // get tires
    const tiresQuery = useQuery({
        queryKey: ['tires', page, search, status, sort, order, truck, trailer],
        queryFn: async () => {
            const res = await axios.get('/tires', {
                params: { page, limit, search, status, sort, order, truck, trailer },
            });
            return res.data.tires || [];
        },
        keepPreviousData: true,
    });

    // get available tires
    const getAvailableTires = useQuery({
        queryKey: ['tires', 'available'],
        queryFn: async () => {
            const res = await axios.get('/tires/available');
            return res.data.tires || [];
        }
    });

    // get tire by id
    const getTireById = (id) =>
        useQuery({
            queryKey: ['tires', id],
            queryFn: async () => {
                const res = await axios.get(`/tires/${id}`);
                return res.data;
            },
            enabled: !!id,
        });

    // create
    const createTire = useMutation({
        mutationFn: (data) => axios.post('/tires', data),
        onSuccess: () => queryClient.invalidateQueries(['tires']),
    });

    // update
    const updateTire = useMutation({
        mutationFn: ({ id, data }) => axios.put(`/tires/${id}`, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries(['tires']);
            queryClient.invalidateQueries(['tires', variables.id]);
        },
    });

    // delete
    const deleteTire = useMutation({
        mutationFn: (id) => axios.delete(`/tires/${id}`),
        onSuccess: () => queryClient.invalidateQueries(['tires']),
    });

    // update status
    const updateTireStatus = useMutation({
        mutationFn: ({ id, status }) =>
            axios.patch(`/tires/${id}/status`, { status }),
        onSuccess: () => queryClient.invalidateQueries(['tires']),
    });

    return {
        tiresQuery,
        getAvailableTires,
        getTireById,
        createTire,
        updateTire,
        deleteTire,
        updateTireStatus,
    };
};