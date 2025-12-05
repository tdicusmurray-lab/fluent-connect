import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useLearningStore } from '@/stores/learningStore';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionStatus {
  subscribed: boolean;
  productId: string | null;
  priceId: string | null;
  subscriptionEnd: string | null;
}

export function useSubscription() {
  const { user, isSignedIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<SubscriptionStatus>({
    subscribed: false,
    productId: null,
    priceId: null,
    subscriptionEnd: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const upgradeToPremium = useLearningStore(state => state.upgradeToPremium);

  const checkSubscription = useCallback(async () => {
    if (!user?.email) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('check-subscription', {
        body: { email: user.email }
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setStatus({
        subscribed: data.subscribed,
        productId: data.product_id,
        priceId: data.price_id,
        subscriptionEnd: data.subscription_end,
      });

      // Update local store if subscribed
      if (data.subscribed) {
        upgradeToPremium();
      }
    } catch (err: any) {
      console.error('Failed to check subscription:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [user, upgradeToPremium]);

  // Check on mount and when user changes
  useEffect(() => {
    if (isSignedIn && user) {
      checkSubscription();
    }
  }, [isSignedIn, user, checkSubscription]);

  // Check on URL params (after payment redirect)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      // Delay to allow Stripe webhook to process
      setTimeout(() => {
        checkSubscription();
      }, 2000);
    }
  }, [checkSubscription]);

  const createCheckout = async () => {
    if (!isSignedIn || !user?.email) {
      toast({
        title: "Sign in required",
        description: "Please sign in to subscribe.",
      });
      navigate('/auth');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('create-checkout', {
        body: { 
          email: user.email,
          userId: user.id 
        }
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (err: any) {
      console.error('Failed to create checkout:', err);
      setError(err.message);
      toast({
        title: "Checkout failed",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    ...status,
    isLoading,
    error,
    checkSubscription,
    createCheckout,
  };
}
