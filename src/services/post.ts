import Api from '../Api';
import { PostFormType } from '../components/Forms/PostForm';
import Post from '../models/Post.model';

export const getPosts: () => Promise<Post[]> = () =>
  Api.get<Post[]>('/posts').then(({ status, data }) =>
    status === 200 ? data : Promise.reject(data),
  );

const getFormData: (data: Partial<PostFormType>) => FormData = (data) => {
  const formData = new FormData();
  data.title && formData.append('title', data.title);
  data.description && formData.append('description', data.description);
  data.url && formData.append('url', data.url);
  data.image && formData.append('image', data.image);
  data.imageWeb && formData.append('imageWeb', data.imageWeb);
  data.priority && formData.append('priority', JSON.stringify(data.priority));

  return formData;
};

export const addPost: (data: PostFormType) => Promise<void> = async (data) => {
  const formData = getFormData(data);

  await Api.post('/posts', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const updatePost: (
  id: string,
  data: Partial<PostFormType>,
) => Promise<void> = async (id, data) => {
  const formData = getFormData(data);

  await Api.put(`/posts/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deletePost: (id: string) => Promise<void> = (id) =>
  Api.delete(`/posts/${id}`);
