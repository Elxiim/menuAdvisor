import Restaurant from "./Restaurant.model";

export default interface AdminMessage {
    _id: string;
    message: string;
    read: string[];
    target: Restaurant[];
    createdAt: string;
    updatedAt: string;
}