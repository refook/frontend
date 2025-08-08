// User types
import type {BaseEntity} from "./index.ts";

export interface User extends BaseEntity {
    email: string;
    name: string;
    avatar?: string;
    preferences: UserPreferences;
}

export interface UserPreferences {
    theme: 'light' | 'dark';
    language: 'ru' | 'en';
    notifications: {
        email: boolean;
        push: boolean;
    };
}