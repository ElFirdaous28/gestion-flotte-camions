import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAxios } from './useAxios';

export const useMaintenanceRules = () => {
  const axios = useAxios();
  const queryClient = useQueryClient();

  // get rules
  const rulesQuery = useQuery({
    queryKey: ['maintenance-rules'],
    queryFn: async () => {
      const res = await axios.get('/maintenance-rules');
      return res.data.rules || [];
    },
  });

  // create
  const createRule = useMutation({
    mutationFn: (data) => axios.post('/maintenance-rules', data),
    onSuccess: () => queryClient.invalidateQueries(['maintenance-rules']),
  });

  // update
  const updateRule = useMutation({
    mutationFn: ({ id, data }) => axios.put(`/maintenance-rules/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries(['maintenance-rules']),
  });

  // delete
  const deleteRule = useMutation({
    mutationFn: (id) => axios.delete(`/maintenance-rules/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['maintenance-rules']),
  });

  return {
    rulesQuery,
    createRule,
    updateRule,
    deleteRule,
  };
};