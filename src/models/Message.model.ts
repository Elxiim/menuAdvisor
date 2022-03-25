import User from './User.model';

export default interface Message {
  _id: string;
  name: string;
  phoneNumber: string;
  email: string;
  message: string;
  read: boolean;
  target: User | null;
  createdAt: string;
  updatedAt: string;
}
