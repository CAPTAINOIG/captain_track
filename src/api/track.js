import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../utils/AxiosInstance";

export const useCreateUser = () => {
  return useMutation({
    mutationKey: ['user'],
    mutationFn: async (data) => {
      const res = await axiosInstance.post('/api/register', data)
      return res.data
    },
  });
};

export const useLoginUser = () => {
  return useMutation({
    mutationKey: ["user"],
    mutationFn: async (data) => {
      const res = await axiosInstance.post('/api/login', data)
      return res.data;
    },
  });
};

export const useCreateActivity = () => {
  return useMutation({
    mutationKey: ['activity'],
    mutationFn: async (data) => {
      const res = await axiosInstance.post('/api/activities', data)
      return res.data
    },
  });
}

export const useGetActivities = () => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["activities"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/activities");
      return res.data;
    },
  });
};

export const useGetActivitiesDetails = (id) => {
  return useQuery({
    queryKey: ["activity", id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/api/activities/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export const useGetUser = () => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await axiosInstance.get("/user");
      return res.data;
    },
  });
};

export const useUploadProfilePicture = () => {
  return useMutation({
    mutationKey: ['user', 'profile-picture'],
    mutationFn: async (imageData) => {
      const payload = { profilePicture: imageData };
      const res = await axiosInstance.post(`/api/profilePicture`, payload);
      return res.data;
    },
  });
}

export const useGetProfilePicture = () => {
  return useQuery({
    queryKey: ['user', 'profile-picture'],
    queryFn: async () => {
      const res = await axiosInstance.get(`/api/getProfilePicture`);
      return res.data;
    },
  });
}
