"use client";
import axios, { AxiosRequestConfig } from "axios";
import { useSession } from "next-auth/react";
import { useCallback } from "react";
import { API_BACKEND_URL } from "@/config";

export function useAuthenticatedAPI() {
    const { data: session } = useSession();

    const makeAuthenticatedRequest = useCallback(async (
        method: 'GET' | 'POST' | 'PUT' | 'DELETE',
        endpoint: string,
        data?: any
    ) => {
        if (!session) {
            throw new Error('No active session');
        }


        const token = await fetch('/api/auth/session').then(res => res.json());
        
        const config: AxiosRequestConfig = {
            method,
            url: `${API_BACKEND_URL}${endpoint}`,
            headers: {
                'Authorization': `Bearer ${(session?.user as { id: string })?.id}`,
                'Content-Type': 'application/json',
            },
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            config.data = data;
        }

        return axios(config);
    }, [session]);

    return { makeAuthenticatedRequest, isAuthenticated: !!session };
}