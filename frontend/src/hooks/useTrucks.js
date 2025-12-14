import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAxios } from './useAxios';

export const useTrucks = ({ page = 1, limit = 10, search = '', status = '', sort = 'createdAt', order = 'desc' } = {}) => {
  const axios = useAxios();
  const queryClient = useQueryClient();

  // get trucks
  const trucksQuery = useQuery({
    queryKey: ['trucks', page, search, status, sort, order],
    queryFn: async () => {
      const res = await axios.get('/trucks', {
        params: { page, limit, search, status, sort, order },
      });

      return {
        trucks: res.data.trucks,
        pagination: res.data.pagination,
      };
    },
    keepPreviousData: true,
  });

  // get truck by id
  const getTruckById = (id) =>
    useQuery({
      queryKey: ['trucks', id],
      queryFn: async () => {
        const res = await axios.get(`/trucks/${id}`);
        return res.data;
      },
      enabled: !!id,
    });

  // create
  const createTruck = useMutation({
    mutationFn: (data) => axios.post('/trucks', data),
    onSuccess: () => queryClient.invalidateQueries(['trucks']),
  });

  // update
  const updateTruck = useMutation({
    mutationFn: ({ id, data }) => axios.put(`/trucks/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['trucks']);
      queryClient.invalidateQueries(['trucks', variables.id]);
    },
  });

  // delete
  const deleteTruck = useMutation({
    mutationFn: (id) => axios.delete(`/trucks/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['trucks']),
  });

  // update status
  const updateTruckStatus = useMutation({
    mutationFn: ({ id, status }) =>
      axios.patch(`/trucks/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries(['trucks']),
  });

  return {
    trucksQuery,
    getTruckById,
    createTruck,
    updateTruck,
    deleteTruck,
    updateTruckStatus,
  };
};
