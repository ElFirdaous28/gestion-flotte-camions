import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '../store/userSlice';
import { useAxios } from './useAxios';

export const useUsers = ({ role, page = 1, limit = 10, search = '', sort = 'createdAt', order = 'desc' } = {}) => {
    const axios = useAxios();
    const queryClient = useQueryClient();
    const dispatch = useDispatch();
    const { user: loggedUser } = useSelector(state => state.user);

    // Get users with server-side filtering/pagination
    const usersQuery = useQuery({
        queryKey: ['users', role, page, search, sort, order],
        queryFn: async () => {
            const res = await axios.get('/users', {
                params: { role, page, limit, search, sort, order },
            });
            return res.data;
        },
        keepPreviousData: true,
    });

    // get user by id
    const getUserById = (id) =>
        useQuery({
            queryKey: ['users', id],
            queryFn: async () => {
                const res = await axios.get(`/users/${id}`);
                return res.data;
            },
            enabled: !!id,
        });

    // create user
    const createUser = useMutation({
        mutationFn: (data) => axios.post('/users', data),
        onSuccess: () => queryClient.invalidateQueries(['users']),
    });

    // update user
    const updateUser = useMutation({
        mutationFn: ({ id, data }) =>
            axios.put(`/users/${id}`, data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            }),
        onSuccess: (res, variables) => {
            const updatedUser = res.data.user;
            if (loggedUser?._id === variables.id) dispatch(setUser(updatedUser));
            queryClient.invalidateQueries(['users']);
            queryClient.invalidateQueries(['users', variables.id]);
        },
    });

    // delete user
    const deleteUser = useMutation({
        mutationFn: (id) => axios.delete(`/users/${id}`),
        onSuccess: () => queryClient.invalidateQueries(['users']),
    });

    // change password
    const changePassword = useMutation({
        mutationFn: ({ id, data }) => axios.patch(`/users/change-password/${id}`, data),
    });

    return { usersQuery, getUserById, createUser, updateUser, deleteUser, changePassword };
};
