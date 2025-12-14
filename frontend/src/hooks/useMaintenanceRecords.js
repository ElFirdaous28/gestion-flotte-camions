import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAxios } from './useAxios';

export const useMaintenanceRecords = ({ page = 1, limit = 10, targetType = '', targetId = '', rule = '', fromDate = '', toDate = '' } = {}) => {
  const axios = useAxios();
  const queryClient = useQueryClient();

  // get records
  const recordsQuery = useQuery({
    queryKey: ['maintenance-records', page, limit, targetType, targetId, rule, fromDate, toDate],
    queryFn: async () => {
      const res = await axios.get('/maintenance-records', {
        params: { page, limit, targetType, targetId, rule, fromDate, toDate },
      });
      return res.data;
    },
    keepPreviousData: true,
  });

  // create
  const createRecord = useMutation({
    mutationFn: (data) => axios.post('/maintenance-records', data),
    onSuccess: () => queryClient.invalidateQueries(['maintenance-records']),
  });

  // update
  const updateRecord = useMutation({
    mutationFn: ({ id, data }) => axios.put(`/maintenance-records/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries(['maintenance-records']),
  });

  // delete
  const deleteRecord = useMutation({
    mutationFn: (id) => axios.delete(`/maintenance-records/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['maintenance-records']),
  });

  return {
    recordsQuery,
    createRecord,
    updateRecord,
    deleteRecord,
  };
};