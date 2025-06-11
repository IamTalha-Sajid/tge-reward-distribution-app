'use client';

import React, { useState, useEffect } from 'react';
import { useWriteContract, useAccount, useTransaction, useReadContract, useWaitForTransactionReceipt, useBalance } from 'wagmi';
import { CONTRACTS } from '@/config/contracts';
import { parseEther, formatUnits } from 'viem';

interface UnlockOption {
  id: number;
  name: string;
  description: string;
  cliffSeconds: bigint;
  conversionRatePercentage: number;
}

export default function TreasuryTab() {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [mintAmount, setMintAmount] = useState('');
  const [unlockOptionId, setUnlockOptionId] = useState('1');
  const [unlockOptionName, setUnlockOptionName] = useState('90 Day Lock');
  const [unlockOptionDescription, setUnlockOptionDescription] = useState('90 day lock period with 100% conversion');
  const [unlockOptionCliff, setUnlockOptionCliff] = useState('7776000');
  const [unlockOptionRate, setUnlockOptionRate] = useState('100');
  const [wallets, setWallets] = useState('');
  const [amounts, setAmounts] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { address } = useAccount();

  const { writeContract: sendSourceTokens, data: sendData, isPending: isPreparing } = useWriteContract();
  const { writeContract: mintTokens, data: mintData, isPending: isPreparingMint } = useWriteContract();
  const { writeContract: setUnlockOption, data: unlockOptionData, isPending: isPreparingUnlockOption } = useWriteContract();

  const { isLoading: isSending } = useTransaction({
    hash: sendData,
  });

  const { isLoading: isMinting } = useTransaction({
    hash: mintData,
  });

  const { isLoading: isSettingUnlockOption } = useTransaction({
    hash: unlockOptionData,
  });

  // Read treasury source token balance
  const { data: treasuryBalance, isLoading: isLoadingTreasuryBalance } = useReadContract({
    address: CONTRACTS.sourceToken.address as `0x${string}`,
    abi: CONTRACTS.sourceToken.abi,
    functionName: 'balanceOf',
    args: [CONTRACTS.treasury.address as `0x${string}`],
  });

  // Read treasury Native token balance
  const { data: treasuryBalanceL3, isLoading: isLoadingTreasuryBalanceL3 } = useBalance({
    address: CONTRACTS.treasury.address as `0x${string}`,
  });

  // Read unlock options
  const { data: unlockOptions, isLoading: isLoadingOptions } = useReadContract({
    address: CONTRACTS.treasury.address as `0x${string}`,
    abi: CONTRACTS.treasury.abi,
    functionName: 'unlockOptions',
  }) as { data: UnlockOption[] | undefined, isLoading: boolean };

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
      // Convert days to seconds with high precision
      const cliffSeconds = BigInt(unlockOptionCliff);
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

  // Set source tokens
  const { writeContract: sendSourceTokensWrite, data: sendSourceTokensData } = useWriteContract();
  const { isLoading: isSendingTokens, isSuccess: isSendTokensSuccess } = useWaitForTransactionReceipt({ 
    hash: sendSourceTokensData,
  });

  useEffect(() => {
    if (isSendTokensSuccess) {
      setAmount('');
      setRecipient('');
      setError(null);
    }
  }, [isSendTokensSuccess]);

  const handleSendSourceTokens = async () => {
    if (!wallets || !amounts) return;
    setError(null);
    
    try {
      const walletList = wallets.split(',').map(w => w.trim());
      const amountList = amounts.split(',').map(a => parseEther(a.trim()));
      
      if (walletList.length !== amountList.length) {
        throw new Error('Number of wallets must match number of amounts');
      }

      const tokenReceivers = walletList.map((wallet, index) => ({
        receiver: wallet as `0x${string}`,
        amount: amountList[index].toString()
      }));

      console.log('Sending tokens to:', tokenReceivers);
      
      await sendSourceTokensWrite({
        address: CONTRACTS.treasury.address as `0x${string}`,
        abi: CONTRACTS.treasury.abi,
        functionName: 'sendSourceTokens',
        args: [tokenReceivers],
      });
    } catch (error: unknown) {
      console.error('Error sending source tokens:', error);
      setError(error instanceof Error ? error.message : 'Failed to send source tokens');
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
        <h2 className="text-xl font-semibold mb-4 !text-black">Treasury Native Balance (L3 Chain)</h2>
        <p className="mb-4 text-lg !text-black">
          {!mounted || isLoadingTreasuryBalanceL3
            ? 'Loading...'
            : treasuryBalanceL3
                ? `${Number(treasuryBalanceL3.formatted).toFixed(4)} ${treasuryBalanceL3.symbol}`
                : '0 ETH'}
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 !text-black">Send Source Tokens (from Treasury to a Recipient)</h2>
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

      {/* Send Source Tokens Batch Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 !text-black">Send Source Tokens Batch</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="wallets" className="block text-sm font-medium !text-black mb-1">
              Wallets (comma-separated, no spaces)
            </label>
            <input
              type="text"
              id="wallets"
              value={wallets}
              onChange={(e) => setWallets(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md !text-black bg-white"
              placeholder="0x123,0x456,0x789"
              disabled={isSendingTokens}
            />
          </div>
          <div>
            <label htmlFor="amounts" className="block text-sm font-medium !text-black mb-1">
              Amounts in ETH (comma-separated, no spaces)
            </label>
            <input
              type="text"
              id="amounts"
              value={amounts}
              onChange={(e) => setAmounts(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md !text-black bg-white"
              placeholder="1.5,2.3,0.5"
              disabled={isSendingTokens}
            />
          </div>
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          {isSendTokensSuccess && (
            <div className="text-green-500 text-sm">Tokens sent successfully!</div>
          )}
          <button
            onClick={handleSendSourceTokens}
            disabled={isSendingTokens || !wallets || !amounts}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {isSendingTokens ? 'Sending...' : 'Send Tokens'}
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 !text-black">Mint Source Tokens (to Treasury)</h2>
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
              disabled={isPreparingMint || isMinting}
            />
          </div>
          <button
            type="submit"
            disabled={isPreparingMint || isMinting || !mintAmount}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-green-400"
          >
            {isPreparingMint ? 'Preparing...' : isMinting ? 'Minting...' : 'Mint Tokens'}
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 !text-black">Set Unlock Option (for a new unlock option)</h2>
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
              disabled={isPreparingUnlockOption || isSettingUnlockOption}
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
              disabled={isPreparingUnlockOption || isSettingUnlockOption}
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
              disabled={isPreparingUnlockOption || isSettingUnlockOption}
            />
          </div>
          <div>
            <label className="block text-sm font-medium !text-black mb-1">
              Cliff Period (seconds)
            </label>
            <input
              type="number"
              value={unlockOptionCliff}
              onChange={(e) => setUnlockOptionCliff(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 !text-black placeholder-gray-500"
              placeholder="Enter cliff period in seconds"
              required
              min="0"
              step="1"
              disabled={isPreparingUnlockOption || isSettingUnlockOption}
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
              disabled={isPreparingUnlockOption || isSettingUnlockOption}
            />
          </div>
          <button
            type="submit"
            disabled={isPreparingUnlockOption || isSettingUnlockOption || !unlockOptionId || !unlockOptionName || !unlockOptionDescription || !unlockOptionCliff || !unlockOptionRate}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-purple-400"
          >
            {isPreparingUnlockOption ? 'Preparing...' : isSettingUnlockOption ? 'Setting...' : 'Set Unlock Option'}
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 !text-black">Unlock Options</h2>
        <div className="space-y-4">
          {isLoadingOptions ? (
            <div className="!text-black font-medium">Loading options...</div>
          ) : unlockOptions && unlockOptions.length > 0 ? (
            <div className="grid gap-4">
              {unlockOptions.map((option) => (
                <div key={option.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold !text-black">{option.name}</h3>
                    <span className="text-sm font-medium !text-black">ID: {option.id}</span>
                  </div>
                  <p className="!text-black font-medium mb-2">{option.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium !text-black">Cliff Period:</span>
                      <span className="ml-2 !text-black">{Number(option.cliffSeconds)} seconds</span>
                    </div>
                    <div>
                      <span className="font-medium !text-black">Conversion Rate:</span>
                      <span className="ml-2 !text-black">{option.conversionRatePercentage}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="!text-black font-medium">No unlock options available</div>
          )}
        </div>
      </div>
    </div>
  );
} 