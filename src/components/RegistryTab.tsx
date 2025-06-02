import React, { useState } from 'react';
import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS } from '@/config/contracts';

export default function RegistryTab() {
  const [heartbeatPeriod, setHeartbeatPeriod] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Read current heartbeat period
  const { data: currentHeartbeatPeriod, isLoading: isLoadingHeartbeatPeriod } = useReadContract({
    address: CONTRACTS.registry.address as `0x${string}`,
    abi: CONTRACTS.registry.abi,
    functionName: 'heartbeatPeriodSeconds',
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

  const handleSetRewardToZero = async () => {
    setError(null);
    
    try {
      await setHeartbeatRewardWrite({
        address: CONTRACTS.registry.address as `0x${string}`,
        abi: CONTRACTS.registry.abi,
        functionName: 'setHeartbeatReward',
        args: [BigInt(0)],
      });
    } catch (error: unknown) {
      console.error('Error setting reward to zero:', error);
      setError(error instanceof Error ? error.message : 'Failed to set reward to zero');
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

      {/* Set Rewards to Zero Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 !text-black">Set Rewards to Zero</h2>
        <div className="space-y-4">
          <p className="text-sm !text-black">
            This will set the rewards distributed by the registry to zero. This action cannot be undone.
          </p>
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          {isSetRewardSuccess && (
            <div className="text-green-500 text-sm">Rewards have been set to zero successfully!</div>
          )}
          <button
            onClick={handleSetRewardToZero}
            disabled={isSettingReward}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSettingReward ? 'Setting...' : 'Set Rewards to Zero'}
          </button>
        </div>
      </div>
    </div>
  );
} 