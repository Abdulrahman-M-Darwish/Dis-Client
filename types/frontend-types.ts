/* tslint:disable */

/* eslint-disable */

// Auto-generated frontend types from NestJS backend. Do not modify directly.



export enum UserStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE'
}

export interface User {
  _id: string;
  name: string;
  email: string;
  username: string;
  passwordHash: string;
  avatarUrl?: string;
  bannerUrl?: string;
  bio?: string;
  status: UserStatus;
  lastSeen?: string | Date;
  friends: string[];
}

export interface Attachment {
  url: string;
  fileType: 'image' | 'video' | 'file';
}

export interface Message {
  _id: string;
  conversationId: Conversation | string;
  senderId: string;
  text?: string;
  attachments?: Attachment[];
  readBy: User[] | string[];
  reply: Message | string;
  isEdited: boolean;
  isForwarded: boolean;
  isSystem: boolean;
  sender: User;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export enum FriendRequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED'
}

export interface FriendRequest {
  sender: string | User;
  receiver: string | User;
  status: FriendRequestStatus;
  _id: string;
}

export enum ConversationType {
  'PRIVATE' = 'PRIVATE',
  'GROUP' = 'GROUP'
}

export interface ParticipantMetadata {
  userId: string;
  lastReadMessageId: string | null;
  unreadCount: number;
  clearedMessageId: string;
}

export interface Conversation {
  _id: string;
  type: ConversationType;
  groupName?: string;
  description?: string;
  groupAvatarUrl?: string;
  participants: User[] | string[];
  admins?: string[];
  lastMessage?: Message | string;
  participantsMetadata: ParticipantMetadata[];
}

export interface CreateUserDto {
  name: string;
  email: string;
  username: string;
  passwordHash: string;
  avatarUrl?: string;
  bannerUrl?: string;
  bio?: string;
}

export interface UpdateUserDto {
  status?: string;
  lastSeen?: Date | null;
}

export interface SearchUsersDto {
  search?: string;
  beforeId?: string;
  limit: number;
}

export interface CreateMessageDto {
  conversationId: string;
  senderId: string;
  attachments?: Attachment[];
  text?: string;
  reply?: string;
  isForwarded?: boolean;
  isSystem?: boolean;
}

export interface UpdateMessageDto {
  readBy?: string[];
}

export interface GetMessagesDto {
  beforeMessageId?: string;
  conversationId: string;
  clearedMessageId?: string;
  limit?: number;
}

export interface CreateFriendDto {

}

export interface UpdateFriendDto {

}

export interface CreateConversationDto {
  type: ConversationType;
  groupName?: string;
  groupAvatarUrl?: string;
  admins?: string[];
  participants: string[];
  lastMessage?: string;
  description?: string;
}

export interface UpdateConversationDto {
  transferOwnershipTo?: string;
}

export interface VerifyForgotPasswordDto {
  email: string;
  otp: string;
  newPassword: string;
}

export interface SignupDto {
  username: string;
  name: string;
  email: string;
  passwordHash: string;
  otp?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface ForgotPasswordDto {
  email: string;
}