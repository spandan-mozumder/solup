"use client";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Wallet, CheckCircle, AlertCircle, Activity } from "lucide-react";
import { BrowserValidatorRuntime } from "@/components/BrowserValidatorRuntime";
import { toast } from "sonner";

export const dynamic = 'force-dynamic';

export default function ValidatorPage() {
  const { status } = useSession();
  const { publicKey, connected } = useWallet();
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [validatorId, setValidatorId] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (status === 'authenticated') {
      console.log("Fetching validator status");
      try {
        const res = await fetch('/api/validator');
        if (res.ok) {
          const json = await res.json();
          if (json && json.publicKey) {
            console.log("Validator found:", json);
            setRegistered(true);
            if (json.id) setValidatorId(json.id);
          }
        }
      } catch (error) {
                console.error("Error:", error);
      }
    }
  }, [status]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const register = async () => {
    if (!publicKey) return;
    setLoading(true);
    
    try {
      console.log("Registering validator with key:", publicKey.toBase58());
      const res = await fetch('/api/validator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicKey: publicKey.toBase58() }),
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to register');
      }
      
      const json = await res.json();
      console.log("Validator registered successfully:", json);
      setRegistered(true);
      if (json?.id) setValidatorId(json.id);
      toast.success("Validator registered successfully!");
        } catch (e: any) {
      console.error("Validator registration failed:", e);
      toast.error(e.message || "Failed to register validator");
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }
  
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-orange-500 mb-4" />
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to access the validator page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Become a Validator</h1>
            <p className="text-xl text-muted-foreground">
              Connect your Solana wallet to register as a validator and start monitoring the network.
            </p>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit">
                <Wallet className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Wallet Connection</CardTitle>
              <CardDescription>
                Connect your Solana wallet to get started. Your public key will be securely stored.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <WalletMultiButton className="!bg-primary !hover:bg-primary/90 !h-12 !px-8 !text-base !rounded-lg" />
              </div>

              {connected && (
                <div className="text-center space-y-4">
                  <Badge variant="secondary" className="px-4 py-2">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Wallet Connected
                  </Badge>
                  
                  {!registered ? (
                    <Button 
                      disabled={loading} 
                      onClick={register}
                      className="w-full h-12 text-base"
                    >
                      {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                      {loading ? 'Registering...' : 'Register as Validator'}
                    </Button>
                  ) : (
                    <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                      <CardContent className="pt-6">
                        <div className="text-center space-y-4">
                          <div className="mx-auto p-2 bg-green-100 dark:bg-green-900 rounded-full w-fit">
                            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-green-800 dark:text-green-200">
                              Successfully Registered as Validator
                            </h3>
                            {validatorId && (
                              <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                                Validator ID: {validatorId}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {registered && validatorId && (
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <span>Validator Runtime</span>
                </CardTitle>
                <CardDescription>
                  Your validator is now active and monitoring the network.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BrowserValidatorRuntime validatorId={validatorId} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}


