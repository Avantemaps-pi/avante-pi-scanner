import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

interface VerifyBusinessRequest {
  walletAddress: string;
  businessName: string;
  externalUserId: string;
}

interface VerifyBusinessResponse {
  success: boolean;
  data?: {
    verificationId: string;
    walletAddress: string;
    businessName: string;
    totalTransactions: number;
    uniqueWallets: number;
    meetsRequirements: boolean;
    failureReason: string | null;
    verificationStatus: string;
    verifiedAt: string;
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
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate API key
    const apiKey = req.headers.get('x-api-key');
    const validApiKey = Deno.env.get('PI_VERIFICATION_API_KEY');
    
    if (!apiKey || apiKey !== validApiKey) {
      console.error('Invalid or missing API key');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Unauthorized: Invalid or missing API key' 
        } as VerifyBusinessResponse),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { walletAddress, businessName, externalUserId }: VerifyBusinessRequest = await req.json();
    
    console.log('Received verification request:', { walletAddress, businessName, externalUserId });

    // Input validation
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

    if (!businessName || businessName.trim().length === 0) {
      console.error('Invalid business name');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Business name is required' 
        } as VerifyBusinessResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!externalUserId || externalUserId.trim().length === 0) {
      console.error('Invalid external user ID');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'External user ID is required' 
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
    const { totalTransactions, uniqueWallets } = mockData;
    
    console.log('Pi Network verification data:', mockData);

    // Business rules evaluation
    const meetsRequirements = totalTransactions >= 100 && uniqueWallets >= 10;
    let failureReason: string | null = null;
    
    if (!meetsRequirements) {
      if (totalTransactions < 100 && uniqueWallets < 10) {
        failureReason = `Insufficient transactions (${totalTransactions}/100) and unique wallets (${uniqueWallets}/10)`;
      } else if (totalTransactions < 100) {
        failureReason = `Insufficient transactions (${totalTransactions}/100)`;
      } else {
        failureReason = `Insufficient unique wallets (${uniqueWallets}/10)`;
      }
    }
    
    const verificationStatus = meetsRequirements ? 'approved' : 'rejected';

    // Upsert to database (update if exists, insert if not)
    const { data: dbData, error: dbError } = await supabase
      .from('business_verifications')
      .upsert({
        wallet_address: walletAddress.trim(),
        business_name: businessName.trim(),
        external_user_id: externalUserId.trim(),
        total_transactions: totalTransactions,
        unique_wallets: uniqueWallets,
        meets_requirements: meetsRequirements,
        failure_reason: failureReason,
        verification_status: verificationStatus,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'wallet_address'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to save verification data' 
        } as VerifyBusinessResponse),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Verification saved successfully:', dbData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          verificationId: dbData.id,
          walletAddress: dbData.wallet_address,
          businessName: dbData.business_name,
          totalTransactions: dbData.total_transactions,
          uniqueWallets: dbData.unique_wallets,
          meetsRequirements: dbData.meets_requirements,
          failureReason: dbData.failure_reason,
          verificationStatus: dbData.verification_status,
          verifiedAt: dbData.updated_at,
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
