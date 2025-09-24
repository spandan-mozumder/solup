"use client";
import { API_BACKEND_URL } from "@/config";
import { useSession } from "next-auth/react";
import axios from "axios";
import { useEffect, useState } from "react";

interface Website {
    id: string;
    url: string;
    ticks: {
        id: string;
        createdAt: string;
        status: string;
        latency: number;
    }[];
}

export function useWebsites() {
    const { data: session } = useSession();
    const [websites, setWebsites] = useState<Website[]>([]);

    async function refreshWebsites() {    
        if (!(session?.user as { id: string })?.id) return;

        try {
            const response = await axios.get(`${API_BACKEND_URL}/api/v1/websites`, {
                headers: {
                    Authorization: `Bearer ${(session?.user as { id: string })?.id}`,
                },
            });

            setWebsites(response.data.websites);
        } catch (error) {
            console.error("Failed to fetch websites:", error);
        }
    }

    useEffect(() => {
        if ((session?.user as { id: string })?.id) {
            refreshWebsites();
        }

        const interval = setInterval(() => {
            if ((session?.user as { id: string })?.id) {
                refreshWebsites();
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [session]);

    return { websites, refreshWebsites };

}