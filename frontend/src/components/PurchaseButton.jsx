import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext.jsx';
import { queryKeys } from '../lib/queryKeys.js';
import paymentsService from '../services/payments.js';

function PurchaseButton({ courseId, price, onSuccess }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const purchaseMutation = useMutation({
    mutationFn: () => paymentsService.mockPurchase(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseStatus(courseId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });

      if (onSuccess) {
        onSuccess();
      }
    }
  });

  function handleClick() {
    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }

    purchaseMutation.mutate();
  }

  const label = purchaseMutation.isPending
    ? 'Processing…'
    : price === 0
      ? 'Enroll for Free'
      : `Enroll — ?${(price / 100).toLocaleString('en-IN')}`;

  return (
    <div>
      <button
        type="button"
        className="btn-primary w-full py-3 text-base font-semibold"
        onClick={handleClick}
        disabled={purchaseMutation.isPending}
      >
        {label}
      </button>
      {purchaseMutation.error && (
        <p className="form-error text-center">
          {purchaseMutation.error.response?.data?.message || 'Unable to process enrollment.'}
        </p>
      )}
    </div>
  );
}

export default PurchaseButton;