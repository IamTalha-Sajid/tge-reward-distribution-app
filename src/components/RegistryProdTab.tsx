import React, { useState } from 'react';
import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACTS } from '@/config/contracts';
import { parseEther } from 'viem';

export default function RegistryProdTab() {
  const [heartbeatPeriod, setHeartbeatPeriod] = useState('');
  const [heartbeatReward, setHeartbeatReward] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Read current heartbeat period
  const { data: currentHeartbeatPeriod, isLoading: isLoadingHeartbeatPeriod } = useReadContract({
    address: CONTRACTS.registryProd.address as `0x${string}`,
    abi: CONTRACTS.registryProd.abi,
    functionName: 'heartbeatPeriodSeconds',
  });

  // Read current heartbeat reward
  const { data: currentHeartbeatReward, isLoading: isLoadingHeartbeatReward } = useReadContract({
    address: CONTRACTS.registryProd.address as `0x${string}`,
    abi: CONTRACTS.registryProd.abi,
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

  // Read current authority address
  const { data: authorityAddress, isLoading: isLoadingAuthority } = useReadContract({
    address: CONTRACTS.registryProd.address as `0x${string}`,
    abi: CONTRACTS.registryProd.abi,
    functionName: 'authority',
  });

  // State for new authority input
  const [newAuthority, setNewAuthority] = useState('');
  const { writeContract: setAuthority, data: setAuthorityData, isPending: isSettingAuthority } = useWriteContract();
  const { isLoading: isSettingAuthorityTx } = useWaitForTransactionReceipt({ hash: setAuthorityData });

  // hasRole checker state
  const [roleToCheck, setRoleToCheck] = useState('');
  const [addressToCheck, setAddressToCheck] = useState('');
  const [shouldCheckRole, setShouldCheckRole] = useState(false);

  const { data: hasRoleResult, isLoading: isCheckingRole } = useReadContract({
    address: CONTRACTS.registryProd.address as `0x${string}`,
    abi: CONTRACTS.registryProd.abi,
    functionName: 'hasRole',
    args: [roleToCheck, addressToCheck],
    query: { enabled: shouldCheckRole && !!roleToCheck && !!addressToCheck },
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
        address: CONTRACTS.registryProd.address as `0x${string}`,
        abi: CONTRACTS.registryProd.abi,
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
        address: CONTRACTS.registryProd.address as `0x${string}`,
        abi: CONTRACTS.registryProd.abi,
        functionName: 'setHeartbeatReward',
        args: [parseEther(heartbeatReward)],
      });
    } catch (error: unknown) {
      console.error('Error setting heartbeat reward:', error);
      setError(error instanceof Error ? error.message : 'Failed to set heartbeat reward');
    }
  };

  const handleSetAuthority = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!newAuthority) {
      setError('Please enter a new authority address.');
      return;
    }
    try {
      await setAuthority({
        address: CONTRACTS.registryProd.address as `0x${string}`,
        abi: CONTRACTS.registryProd.abi,
        functionName: 'setAuthority',
        args: [newAuthority],
      });
    } catch (error) {
      console.error('Error setting authority:', error);
      setError(error instanceof Error ? error.message : 'Failed to set authority');
    }
  };

  const handleCheckRole = (e: React.FormEvent) => {
    e.preventDefault();
    setShouldCheckRole(false);
    setTimeout(() => setShouldCheckRole(true), 0);
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

      {/* Authority Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 !text-black">Registry Authority</h2>
        <div className="mb-4">
          <span className="font-medium !text-black">Current Authority: </span>
          {isLoadingAuthority ? (
            <span className="!text-black">Loading...</span>
          ) : (
            <span className="!text-black">{authorityAddress as string}</span>
          )}
        </div>
        <form onSubmit={handleSetAuthority} className="space-y-4">
          <div>
            <label className="block text-sm font-medium !text-black mb-1">Set New Authority Address</label>
            <input
              type="text"
              value={newAuthority}
              onChange={(e) => setNewAuthority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 !text-black placeholder-gray-500"
              placeholder="0x..."
              required
              disabled={isSettingAuthority || isSettingAuthorityTx}
            />
          </div>
          <button
            type="submit"
            disabled={isSettingAuthority || isSettingAuthorityTx}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed"
          >
            {isSettingAuthority || isSettingAuthorityTx ? 'Setting...' : 'Set Authority'}
          </button>
        </form>
      </div>

      {/* hasRole Checker Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 !text-black">Check Role (hasRole)</h2>
        <form onSubmit={handleCheckRole} className="space-y-4">
          <div>
            <label className="block text-sm font-medium !text-black mb-1">Role (bytes32 hex)</label>
            <input
              type="text"
              value={roleToCheck}
              onChange={(e) => setRoleToCheck(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 !text-black placeholder-gray-500"
              placeholder="0x..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium !text-black mb-1">Address to Check</label>
            <input
              type="text"
              value={addressToCheck}
              onChange={(e) => setAddressToCheck(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 !text-black placeholder-gray-500"
              placeholder="0x..."
              required
            />
          </div>
          <button
            type="submit"
            disabled={isCheckingRole}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed"
          >
            {isCheckingRole ? 'Checking...' : 'Check Role'}
          </button>
        </form>
        {shouldCheckRole && !isCheckingRole && hasRoleResult !== undefined && (
          <div className="mt-4 font-medium !text-black">
            Result: {hasRoleResult ? 'Has Role' : 'Does NOT have Role'}
          </div>
        )}
      </div>
    </div>
  );
}