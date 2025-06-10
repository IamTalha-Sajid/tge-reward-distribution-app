'use client';

import { useState, useEffect } from 'react';
import { useWriteContract, useReadContract, useAccount, useTransaction } from 'wagmi';
import { CONTRACTS } from '@/config/contracts';
import { parseEther, formatUnits } from 'viem';

export default function SourceTokenTab() {
  const [amount, setAmount] = useState('');
  const [unlockId, setUnlockId] = useState('');
  const [unlockBytes, setUnlockBytes] = useState('');
  const [cancelHash, setCancelHash] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'idle' | 'approving' | 'approved' | 'unlocking'>('idle');
  const { address } = useAccount();

  const { writeContract: approve, data: approveData, isPending: isPreparingApprove } = useWriteContract();
  const { writeContract: initiateUnlock, data: unlockData } = useWriteContract();
  const { writeContract: fulfillUnlock, data: fulfillData, isPending: isPreparingFulfill } = useWriteContract();
  const { writeContract: cancelUnlock, data: cancelData, isPending: isPreparingCancel } = useWriteContract();

  const { isLoading: isApproving, isSuccess: isApproveSuccess } = useTransaction({ hash: approveData });
  const { isLoading: isUnlocking } = useTransaction({ hash: unlockData });
  const { isLoading: isFulfilling } = useTransaction({ hash: fulfillData });
  const { isLoading: isCanceling } = useTransaction({ hash: cancelData });

  // --- Unlocks Section ---
  // Get unfulfilled unlocks count
  const { data: unfulfilledCount } = useReadContract({
    address: CONTRACTS.treasury.address as `0x${string}`,
    abi: CONTRACTS.treasury.abi,
    functionName: 'getUnlocksCount',
    args: [false, address],
    query: { enabled: !!address },
  });
  // Get fulfilled unlocks count
  const { data: fulfilledCount } = useReadContract({
    address: CONTRACTS.treasury.address as `0x${string}`,
    abi: CONTRACTS.treasury.abi,
    functionName: 'getUnlocksCount',
    args: [true, address],
    query: { enabled: !!address },
  });
  // Get unfulfilled unlocks
  const { data: unfulfilledUnlocks, isLoading: isLoadingUnfulfilled } = useReadContract({
    address: CONTRACTS.treasury.address as `0x${string}`,
    abi: CONTRACTS.treasury.abi,
    functionName: 'getUnlocks',
    args: [false, address, 0, unfulfilledCount ?? 0],
    query: { enabled: !!address && typeof unfulfilledCount === 'bigint' && unfulfilledCount > 0 },
  });
  // Get fulfilled unlocks
  const { data: fulfilledUnlocks, isLoading: isLoadingFulfilled } = useReadContract({
    address: CONTRACTS.treasury.address as `0x${string}`,
    abi: CONTRACTS.treasury.abi,
    functionName: 'getUnlocks',
    args: [true, address, 0, fulfilledCount ?? 0],
    query: { enabled: !!address && typeof fulfilledCount === 'bigint' && fulfilledCount > 0 },
  });

  useEffect(() => {
    if (isApproveSuccess && step === 'approving') {
      setStep('approved');
    }
  }, [isApproveSuccess, step]);

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStep('idle');
    if (!amount) {
      setError('Please enter an amount');
      return;
    }
    if (!address) {
      setError('Please connect your wallet');
      return;
    }
    try {
      setStep('approving');
      const amountInWei = parseEther(amount);
      await approve({
        address: CONTRACTS.sourceToken.address as `0x${string}`,
        abi: CONTRACTS.sourceToken.abi,
        functionName: 'approve',
        args: [CONTRACTS.treasury.address, amountInWei],
      });
    } catch (error) {
      setStep('idle');
      setError(error instanceof Error ? error.message : 'Failed to approve');
    }
  };

  const handleInitiateUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!amount) {
      setError('Please enter an amount');
      return;
    }
    if (!address) {
      setError('Please connect your wallet');
      return;
    }
    try {
      setStep('unlocking');
      const amountInWei = parseEther(amount);
      await initiateUnlock({
        address: CONTRACTS.treasury.address as `0x${string}`,
        abi: CONTRACTS.treasury.abi,
        functionName: 'unlock',
        args: [amountInWei, unlockId],
      });
      setStep('idle');
    } catch (error) {
      setStep('idle');
      setError(error instanceof Error ? error.message : 'Failed to unlock');
    }
  };

  const handleFulfillUnlock = async () => {
    setError(null);
    if (!address) {
      setError('Please connect your wallet');
      return;
    }
    try {
      await fulfillUnlock({
        address: CONTRACTS.treasury.address as `0x${string}`,
        abi: CONTRACTS.treasury.abi,
        functionName: 'fulfill',
        args: [unlockBytes]
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fulfill unlock');
    }
  };

  const handleCancelUnlock = async () => {
    setError(null);
    if (!address) {
      setError('Please connect your wallet');
      return;
    }
    if (!unlockBytes) {
      setError('Please enter the unlock hash');
      return;
    }
    try {
      await cancelUnlock({
        address: CONTRACTS.treasury.address as `0x${string}`,
        abi: CONTRACTS.treasury.abi,
        functionName: 'cancelUnlock',
        args: [unlockBytes]
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to cancel unlock');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 !text-black">Initiate Unlock</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium !text-black mb-1">
              Amount to Unlock
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 !text-black placeholder-gray-500"
              placeholder="Enter amount"
              required
              min="0"
              step="0.000000000000000001"
              disabled={step === 'approving' || isPreparingApprove || isApproving || isUnlocking || step === 'unlocking'}
            />
            <label className="block text-sm font-medium !text-black mb-1">
              Unlock ID
            </label>
            <input
              type="text"
              value={unlockId}
              onChange={(e) => setUnlockId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 !text-black placeholder-gray-500"
              placeholder="Enter Unlock ID"
              disabled={step === 'approving' || isPreparingApprove || isApproving || isUnlocking || step === 'unlocking'}
            />
          </div>
          <button
            type="button"
            onClick={handleApprove}
            disabled={step === 'approving' || isPreparingApprove || isApproving || step === 'approved' || step === 'unlocking'}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === 'approving' || isPreparingApprove || isApproving
              ? 'Approving...'
              : step === 'approved'
                ? 'Approved'
                : 'Approve'}
          </button>
          <button
            type="button"
            onClick={handleInitiateUnlock}
            disabled={step !== 'approved' && step !== 'unlocking'}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === 'unlocking' || isUnlocking
              ? 'Unlocking...'
              : 'Initiate Unlock'}
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 !text-black">Fulfill Unlock</h2>
        <label className="block text-sm font-medium !text-black mb-1">
          Unlock ID in Bytes
        </label>
        <input
          type="text"
          value={unlockBytes}
          onChange={(e) => setUnlockBytes(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 !text-black placeholder-gray-500"
          placeholder="Enter Unlock Bytes"
          disabled={isPreparingFulfill || isFulfilling}
        />
        <button
          onClick={handleFulfillUnlock}
          disabled={isPreparingFulfill || isFulfilling}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
        >
          {isPreparingFulfill ? 'Preparing...' : isFulfilling ? 'Fulfilling...' : 'Fulfill Unlock'}
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 !text-black">Cancel Unlock</h2>
        <label className="block text-sm font-medium !text-black mb-1">
          Unlock Hash
        </label>
        <input
          type="text"
          value={cancelHash}
          onChange={(e) => setCancelHash(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 !text-black placeholder-gray-500"
          placeholder="Enter Unlock Hash"
          disabled={isPreparingCancel || isCanceling}
        />
        <button
          onClick={handleCancelUnlock}
          disabled={isPreparingCancel || isCanceling}
          className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
        >
          {isPreparingCancel ? 'Preparing...' : isCanceling ? 'Canceling...' : 'Cancel Unlock'}
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 !text-black">Your Unlocks</h2>
        {(isLoadingUnfulfilled || isLoadingFulfilled) ? (
          <p className="!text-black">Loading unlocks...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-2 py-1 !text-black">ID</th>
                  <th className="px-2 py-1 !text-black">Source</th>
                  <th className="px-2 py-1 !text-black">Target</th>
                  <th className="px-2 py-1 !text-black">Lock Time</th>
                  <th className="px-2 py-1 !text-black">Unlock Time</th>
                  <th className="px-2 py-1 !text-black">Fulfilled</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ...(Array.isArray(unfulfilledUnlocks) ? unfulfilledUnlocks : []),
                  ...(Array.isArray(fulfilledUnlocks) ? fulfilledUnlocks : [])
                ].map((unlock: {
                  id: string;
                  sourceAmount: bigint;
                  targetAmount: bigint;
                  lockTime: bigint;
                  unlockTime: bigint;
                  fulfilled: boolean;
                }) => (
                  <tr key={unlock.id} className="border-b">
                    <td className="px-2 py-1 !text-black">{unlock.id}</td>
                    <td className="px-2 py-1 !text-black">{Number(formatUnits(unlock.sourceAmount, 18)).toFixed(2)}</td>
                    <td className="px-2 py-1 !text-black">{Number(formatUnits(unlock.targetAmount, 18)).toFixed(2)}</td>
                    <td className="px-2 py-1 !text-black">{new Date(Number(unlock.lockTime) * 1000).toLocaleString()}</td>
                    <td className="px-2 py-1 !text-black">{new Date(Number(unlock.unlockTime) * 1000).toLocaleString()}</td>
                    <td className="px-2 py-1 !text-black">{unlock.fulfilled ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
                {(!Array.isArray(unfulfilledUnlocks) || unfulfilledUnlocks.length === 0)
                  && (!Array.isArray(fulfilledUnlocks) || fulfilledUnlocks.length === 0) && (
                  <tr><td colSpan={6} className="px-2 py-1 !text-black">No unlocks found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 