import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyBusinessRequest {
  walletAddress: string;
}

interface VerifyBusinessResponse {
  success: boolean;
  data?: {
    totalTransactions: number;
    uniqueWallets: number;
    walletAddress: string;
  };
  error?: string;
}

// Mock Pi Network API - simulates blockchain data
function mockPiNetworkAPI(walletAddress: string): { totalTransactions: number; uniqueWallets: number } {
  console.log(`Verifying wallet: ${walletAddress}`);
  
  // Generate deterministic but varied results based on wallet address
  const hash = walletAddress.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const totalTransactions = Math.floor((hash % 500) + 50);
  const uniqueWallets = Math.floor((hash % 150) + 10);
  
  return {
    totalTransactions,
    uniqueWallets
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { walletAddress }: VerifyBusinessRequest = await req.json();
    
    console.log('Received verification request for wallet:', walletAddress);

    // Validate wallet address format (basic validation)
    if (!walletAddress || walletAddress.trim().length < 10) {
      console.error('Invalid wallet address format');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid wallet address format. Please provide a valid Pi Network wallet address.' 
        } as VerifyBusinessResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Simulate API delay for realistic feel
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Get mock data from Pi Network
    const mockData = mockPiNetworkAPI(walletAddress);
    
    console.log('Verification successful:', mockData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          ...mockData,
          walletAddress: walletAddress.trim()
        }
      } as VerifyBusinessResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in verify-business function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      } as VerifyBusinessResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
