'use client';

import { useState, useEffect } from 'react';
import { useWriteContract, useAccount, useTransaction, useReadContract } from 'wagmi';
import { CONTRACTS } from '@/config/contracts';
import { parseEther, formatUnits } from 'viem';

export default function TreasuryTab() {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [mintAmount, setMintAmount] = useState('');
  const [unlockOptionId, setUnlockOptionId] = useState('1');
  const [unlockOptionName, setUnlockOptionName] = useState('90 Day Lock');
  const [unlockOptionDescription, setUnlockOptionDescription] = useState('90 day lock period with 100% conversion');
  const [unlockOptionCliff, setUnlockOptionCliff] = useState('90');
  const [unlockOptionRate, setUnlockOptionRate] = useState('100');
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();

  const { writeContract: sendSourceTokens, data: sendData, isPending: isPreparing } = useWriteContract();
  const { writeContract: mintTokens, data: mintData, isPending: isPreparingMint } = useWriteContract();
  const { writeContract: setUnlockOption, data: unlockOptionData, isPending: isPreparingUnlockOption } = useWriteContract();

  const { isLoading: isSending, isError: isSendError } = useTransaction({
    hash: sendData,
  });

  const { isLoading: isMinting, isError: isMintError } = useTransaction({
    hash: mintData,
  });

  const { isLoading: isSettingUnlockOption, isError: isUnlockOptionError } = useTransaction({
    hash: unlockOptionData,
  });

  // Read treasury source token balance
  const { data: treasuryBalance, isLoading: isLoadingTreasuryBalance } = useReadContract({
    address: CONTRACTS.sourceToken.address as `0x${string}`,
    abi: CONTRACTS.sourceToken.abi,
    functionName: 'balanceOf',
    args: [CONTRACTS.treasury.address as `0x${string}`],
  });

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleSendTokens = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!amount || !recipient) {
      setError('Please fill in all fields');
      return;
    }

    if (!address) {
      setError('Please connect your wallet');
      return;
    }

    try {
      const amountInWei = parseEther(amount);
      await sendSourceTokens({
        address: CONTRACTS.treasury.address as `0x${string}`,
        abi: CONTRACTS.treasury.abi,
        functionName: 'transferSourceTokensTo',
        args: [recipient, amountInWei],
      });
    } catch (error) {
      console.error('Error sending tokens:', error);
      setError(error instanceof Error ? error.message : 'Failed to send tokens');
    }
  };

  const handleMintTokens = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!mintAmount) {
      setError('Please enter an amount');
      return;
    }

    if (!address) {
      setError('Please connect your wallet');
      return;
    }

    try {
      const amountInWei = parseEther(mintAmount);
      await mintTokens({
        address: CONTRACTS.sourceToken.address as `0x${string}`,
        abi: CONTRACTS.sourceToken.abi,
        functionName: 'mint',
        args: [CONTRACTS.treasury.address, amountInWei],
      });
    } catch (error) {
      console.error('Error minting tokens:', error);
      setError(error instanceof Error ? error.message : 'Failed to mint tokens');
    }
  };

  const handleSetUnlockOption = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!unlockOptionId || !unlockOptionName || !unlockOptionDescription || !unlockOptionCliff || !unlockOptionRate) {
      setError('Please fill in all fields');
      return;
    }

    if (!address) {
      setError('Please connect your wallet');
      return;
    }

    try {
      const cliffSeconds = BigInt(parseInt(unlockOptionCliff) * 24 * 60 * 60); // Convert days to seconds
      const conversionRate = BigInt(unlockOptionRate);
      const id = BigInt(unlockOptionId);

      await setUnlockOption({
        address: CONTRACTS.treasury.address as `0x${string}`,
        abi: CONTRACTS.treasury.abi,
        functionName: 'setUnlockOption',
        args: [id, unlockOptionName, unlockOptionDescription, cliffSeconds, conversionRate, true],
      });
    } catch (error) {
      console.error('Error setting unlock option:', error);
      setError(error instanceof Error ? error.message : 'Failed to set unlock option');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 !text-black">Treasury Source Token Balance</h2>
        <p className="mb-4 text-lg !text-black">
          {!mounted || isLoadingTreasuryBalance
            ? 'Loading...'
            : `${typeof treasuryBalance === 'bigint'
                ? Number(formatUnits(treasuryBalance, 18)).toFixed(2)
                : '0'} tokens`}
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 !text-black">Send Source Tokens</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSendTokens} className="space-y-4">
          <div>
            <label className="block text-sm font-medium !text-black mb-1">
              Recipient Address
            </label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 !text-black placeholder-gray-500"
              placeholder="0x..."
              required
              disabled={!sendSourceTokens || isPreparing || isSending}
            />
          </div>
          <div>
            <label className="block text-sm font-medium !text-black mb-1">
              Amount
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
              disabled={!sendSourceTokens || isPreparing || isSending}
            />
          </div>
          <button
            type="submit"
            disabled={!sendSourceTokens || isPreparing || isSending}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed"
          >
            {!sendSourceTokens
              ? 'Loading...'
              : (isPreparing || isSending)
                ? (isPreparing ? 'Preparing...' : 'Sending...')
                : 'Send Tokens'}
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 !text-black">Mint Source Tokens</h2>
        <form onSubmit={handleMintTokens} className="space-y-4">
          <div>
            <label className="block text-sm font-medium !text-black mb-1">
              Amount to Mint
            </label>
            <input
              type="number"
              value={mintAmount}
              onChange={(e) => setMintAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 !text-black placeholder-gray-500"
              placeholder="Enter amount"
              required
              min="0"
              step="0.000000000000000001"
              disabled={!mintTokens || isPreparingMint || isMinting}
            />
          </div>
          <button
            type="submit"
            disabled={!mintTokens || isPreparingMint || isMinting}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed"
          >
            {!mintTokens
              ? 'Loading...'
              : (isPreparingMint || isMinting)
                ? (isPreparingMint ? 'Preparing...' : 'Minting...')
                : 'Mint Tokens'}
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 !text-black">Set Unlock Option</h2>
        <form onSubmit={handleSetUnlockOption} className="space-y-4">
          <div>
            <label className="block text-sm font-medium !text-black mb-1">
              Option ID
            </label>
            <input
              type="number"
              value={unlockOptionId}
              onChange={(e) => setUnlockOptionId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 !text-black placeholder-gray-500"
              placeholder="Enter option ID"
              required
              min="1"
              disabled={!setUnlockOption || isPreparingUnlockOption || isSettingUnlockOption}
            />
          </div>
          <div>
            <label className="block text-sm font-medium !text-black mb-1">
              Name
            </label>
            <input
              type="text"
              value={unlockOptionName}
              onChange={(e) => setUnlockOptionName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 !text-black placeholder-gray-500"
              placeholder="Enter option name"
              required
              disabled={!setUnlockOption || isPreparingUnlockOption || isSettingUnlockOption}
            />
          </div>
          <div>
            <label className="block text-sm font-medium !text-black mb-1">
              Description
            </label>
            <input
              type="text"
              value={unlockOptionDescription}
              onChange={(e) => setUnlockOptionDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 !text-black placeholder-gray-500"
              placeholder="Enter option description"
              required
              disabled={!setUnlockOption || isPreparingUnlockOption || isSettingUnlockOption}
            />
          </div>
          <div>
            <label className="block text-sm font-medium !text-black mb-1">
              Cliff Period (days)
            </label>
            <input
              type="number"
              value={unlockOptionCliff}
              onChange={(e) => setUnlockOptionCliff(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 !text-black placeholder-gray-500"
              placeholder="Enter cliff period in days"
              required
              min="0"
              disabled={!setUnlockOption || isPreparingUnlockOption || isSettingUnlockOption}
            />
          </div>
          <div>
            <label className="block text-sm font-medium !text-black mb-1">
              Conversion Rate (%)
            </label>
            <input
              type="number"
              value={unlockOptionRate}
              onChange={(e) => setUnlockOptionRate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 !text-black placeholder-gray-500"
              placeholder="Enter conversion rate percentage"
              required
              min="0"
              max="100"
              disabled={!setUnlockOption || isPreparingUnlockOption || isSettingUnlockOption}
            />
          </div>
          <button
            type="submit"
            disabled={!setUnlockOption || isPreparingUnlockOption || isSettingUnlockOption}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed"
          >
            {!setUnlockOption
              ? 'Loading...'
              : (isPreparingUnlockOption || isSettingUnlockOption)
                ? (isPreparingUnlockOption ? 'Preparing...' : 'Setting...')
                : 'Set Unlock Option'}
          </button>
        </form>
      </div>
    </div>
  );
} 