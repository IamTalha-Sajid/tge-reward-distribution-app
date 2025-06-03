import React, { useState } from 'react';
import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS } from '@/config/contracts';
import { parseEther } from 'viem';

export default function RegistryTab() {
  const [heartbeatPeriod, setHeartbeatPeriod] = useState('');
  const [heartbeatReward, setHeartbeatReward] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Read current heartbeat period
  const { data: currentHeartbeatPeriod, isLoading: isLoadingHeartbeatPeriod } = useReadContract({
    address: CONTRACTS.registry.address as `0x${string}`,
    abi: CONTRACTS.registry.abi,
    functionName: 'heartbeatPeriodSeconds',
  });

  // Read current heartbeat reward
  const { data: currentHeartbeatReward, isLoading: isLoadingHeartbeatReward } = useReadContract({
    address: CONTRACTS.registry.address as `0x${string}`,
    abi: CONTRACTS.registry.abi,
    functionName: 'heartbeatReward',
  });

  // Set heartbeat period
  const { writeContract: setHeartbeatPeriodWrite, data: setHeartbeatPeriodData } = useWriteContract();
  const { isLoading: isSettingHeartbeat, isSuccess: isSetHeartbeatSuccess } = useWaitForTransactionReceipt({ 
    hash: setHeartbeatPeriodData,
  });

  // Set heartbeat reward
  const { writeContract: setHeartbeatRewardWrite, data: setHeartbeatRewardData } = useWriteContract();
  const { isLoading: isSettingReward, isSuccess: isSetRewardSuccess } = useWaitForTransactionReceipt({ 
    hash: setHeartbeatRewardData,
  });

  React.useEffect(() => {
    if (isSetHeartbeatSuccess) {
      setHeartbeatPeriod('');
      setError(null);
    }
  }, [isSetHeartbeatSuccess]);

  React.useEffect(() => {
    if (isSetRewardSuccess) {
      setHeartbeatReward('');
      setError(null);
    }
  }, [isSetRewardSuccess]);

  const handleSetHeartbeatPeriod = async () => {
    if (!heartbeatPeriod) return;
    setError(null);
    
    try {
      await setHeartbeatPeriodWrite({
        address: CONTRACTS.registry.address as `0x${string}`,
        abi: CONTRACTS.registry.abi,
        functionName: 'setHeartbeatPeriodSeconds',
        args: [BigInt(heartbeatPeriod)],
      });
    } catch (error: unknown) {
      console.error('Error setting heartbeat period:', error);
      setError(error instanceof Error ? error.message : 'Failed to set heartbeat period');
    }
  };

  const handleSetHeartbeatReward = async () => {
    if (!heartbeatReward) return;
    setError(null);
    
    try {
      await setHeartbeatRewardWrite({
        address: CONTRACTS.registry.address as `0x${string}`,
        abi: CONTRACTS.registry.abi,
        functionName: 'setHeartbeatReward',
        args: [parseEther(heartbeatReward)],
      });
    } catch (error: unknown) {
      console.error('Error setting heartbeat reward:', error);
      setError(error instanceof Error ? error.message : 'Failed to set heartbeat reward');
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Heartbeat Period Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 !text-black">Current Heartbeat Period</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="!text-black">Current Period:</span>
            <span className="font-medium !text-black">
              {isLoadingHeartbeatPeriod ? 'Loading...' : 
               currentHeartbeatPeriod ? `${Number(currentHeartbeatPeriod)} seconds` : 'Not set'}
            </span>
          </div>
        </div>
      </div>

      {/* Current Heartbeat Reward Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 !text-black">Current Heartbeat Reward</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="!text-black">Current Reward:</span>
            <span className="font-medium !text-black">
              {isLoadingHeartbeatReward ? 'Loading...' : 
               currentHeartbeatReward ? `${Number(currentHeartbeatReward) / 1e18} ETH` : 'Not set'}
            </span>
          </div>
        </div>
      </div>

      {/* Set Heartbeat Period Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 !text-black">Set Heartbeat Period</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="heartbeatPeriod" className="block text-sm font-medium !text-black mb-1">
              New Heartbeat Period (seconds)
            </label>
            <input
              type="number"
              id="heartbeatPeriod"
              value={heartbeatPeriod}
              onChange={(e) => setHeartbeatPeriod(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md !text-black bg-white"
              placeholder="Enter new heartbeat period"
              disabled={isSettingHeartbeat}
            />
          </div>
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          {isSetHeartbeatSuccess && (
            <div className="text-green-500 text-sm">Heartbeat period updated successfully!</div>
          )}
          <button
            onClick={handleSetHeartbeatPeriod}
            disabled={isSettingHeartbeat || !heartbeatPeriod}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSettingHeartbeat ? 'Setting...' : 'Set Heartbeat Period'}
          </button>
        </div>
      </div>

      {/* Set Heartbeat Reward Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 !text-black">Set Heartbeat Reward</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="heartbeatReward" className="block text-sm font-medium !text-black mb-1">
              New Heartbeat Reward (ETH)
            </label>
            <input
              type="number"
              id="heartbeatReward"
              value={heartbeatReward}
              onChange={(e) => setHeartbeatReward(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md !text-black bg-white"
              placeholder="Enter new heartbeat reward"
              disabled={isSettingReward}
              step="any"
              min="0"
            />
          </div>
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          {isSetRewardSuccess && (
            <div className="text-green-500 text-sm">Heartbeat reward updated successfully!</div>
          )}
          <button
            onClick={handleSetHeartbeatReward}
            disabled={isSettingReward || !heartbeatReward}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSettingReward ? 'Setting...' : 'Set Heartbeat Reward'}
          </button>
        </div>
      </div>
    </div>
  );
} 