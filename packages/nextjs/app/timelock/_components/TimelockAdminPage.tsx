"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Address, AddressInput } from "@scaffold-ui/components";
import { Abi, encodeFunctionData, isAddress, keccak256, stringToHex, zeroHash } from "viem";
import { useAccount } from "wagmi";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import {
  useDeployedContractInfo,
  useScaffoldEventHistory,
  useScaffoldReadContract,
  useScaffoldWriteContract,
  useTargetNetwork,
} from "~~/hooks/scaffold-eth";
import { getParsedError, notification } from "~~/utils/scaffold-eth";

type ActionType = "setTreasury" | "setFeeBps" | "setFeatureEnabled";

const actionDescriptions: Record<ActionType, string> = {
  setTreasury: "Move treasury control to a new address through the timelock.",
  setFeeBps: "Change the managed protocol fee in basis points.",
  setFeatureEnabled: "Turn the protected feature flag on or off.",
};

const operationStateLabels = ["Unset", "Waiting", "Ready", "Done"];

const toBytes32Salt = (value: string) => {
  if (!value.trim()) {
    return zeroHash;
  }

  return keccak256(stringToHex(value));
};

const isBytes32 = (value: string) => /^0x[a-fA-F0-9]{64}$/.test(value);

const renderOperationState = (state?: bigint | number) => {
  if (state === undefined) {
    return "Unknown";
  }

  return operationStateLabels[Number(state)] ?? "Unknown";
};

export const TimelockAdminPage = () => {
  const { address: connectedAddress } = useAccount();
  const { targetNetwork } = useTargetNetwork();
  const { data: timelockContract } = useDeployedContractInfo({ contractName: "TimelockController" });
  const { data: adminTargetContract } = useDeployedContractInfo({ contractName: "TimelockedAdminTarget" });

  const [actionType, setActionType] = useState<ActionType>("setTreasury");
  const [treasuryInput, setTreasuryInput] = useState("");
  const [feeBpsInput, setFeeBpsInput] = useState("250");
  const [featureEnabledInput, setFeatureEnabledInput] = useState("false");
  const [delayInput, setDelayInput] = useState("");
  const [saltLabel, setSaltLabel] = useState("");
  const [predecessorInput, setPredecessorInput] = useState<string>(zeroHash);

  const { data: minDelay } = useScaffoldReadContract({
    contractName: "TimelockController",
    functionName: "getMinDelay",
  });
  const { data: proposerRole } = useScaffoldReadContract({
    contractName: "TimelockController",
    functionName: "PROPOSER_ROLE",
  });
  const { data: executorRole } = useScaffoldReadContract({
    contractName: "TimelockController",
    functionName: "EXECUTOR_ROLE",
  });
  const { data: cancellerRole } = useScaffoldReadContract({
    contractName: "TimelockController",
    functionName: "CANCELLER_ROLE",
  });

  const { data: treasury } = useScaffoldReadContract({
    contractName: "TimelockedAdminTarget",
    functionName: "treasury",
  });
  const { data: feeBps } = useScaffoldReadContract({
    contractName: "TimelockedAdminTarget",
    functionName: "feeBps",
  });
  const { data: featureEnabled } = useScaffoldReadContract({
    contractName: "TimelockedAdminTarget",
    functionName: "featureEnabled",
  });
  const { data: owner } = useScaffoldReadContract({
    contractName: "TimelockedAdminTarget",
    functionName: "owner",
  });

  const { data: isProposer } = useScaffoldReadContract({
    contractName: "TimelockController",
    functionName: "hasRole",
    args: [proposerRole, connectedAddress],
  });
  const { data: isExecutor } = useScaffoldReadContract({
    contractName: "TimelockController",
    functionName: "hasRole",
    args: [executorRole, connectedAddress],
  });
  const { data: isCanceller } = useScaffoldReadContract({
    contractName: "TimelockController",
    functionName: "hasRole",
    args: [cancellerRole, connectedAddress],
  });

  useEffect(() => {
    if (minDelay !== undefined && delayInput === "") {
      setDelayInput(minDelay.toString());
    }
  }, [delayInput, minDelay]);

  const actionData = (() => {
    if (!adminTargetContract?.address || !adminTargetContract.abi) {
      return { calldata: undefined, validationError: "Deploy the contracts with `yarn deploy` first." };
    }

    try {
      if (actionType === "setTreasury") {
        if (!isAddress(treasuryInput)) {
          return { calldata: undefined, validationError: "Enter a valid treasury address." };
        }

        return {
          calldata: encodeFunctionData({
            abi: adminTargetContract.abi as Abi,
            functionName: "setTreasury",
            args: [treasuryInput],
          }),
          validationError: undefined,
        };
      }

      if (actionType === "setFeeBps") {
        if (!feeBpsInput.trim()) {
          return { calldata: undefined, validationError: "Enter a fee in basis points." };
        }

        const feeValue = BigInt(feeBpsInput);
        return {
          calldata: encodeFunctionData({
            abi: adminTargetContract.abi as Abi,
            functionName: "setFeeBps",
            args: [feeValue],
          }),
          validationError: undefined,
        };
      }

      return {
        calldata: encodeFunctionData({
          abi: adminTargetContract.abi as Abi,
          functionName: "setFeatureEnabled",
          args: [featureEnabledInput === "true"],
        }),
        validationError: undefined,
      };
    } catch (error) {
      return { calldata: undefined, validationError: getParsedError(error) };
    }
  })();

  const salt = toBytes32Salt(saltLabel);
  const predecessor = predecessorInput.trim() === "" ? zeroHash : predecessorInput;
  const delay = (() => {
    if (!delayInput.trim()) {
      return undefined;
    }

    try {
      return BigInt(delayInput);
    } catch {
      return undefined;
    }
  })();

  const { data: operationId } = useScaffoldReadContract({
    contractName: "TimelockController",
    functionName: "hashOperation",
    args: [adminTargetContract?.address, 0n, actionData.calldata, predecessor as `0x${string}`, salt],
  });
  const { data: operationState } = useScaffoldReadContract({
    contractName: "TimelockController",
    functionName: "getOperationState",
    args: [operationId],
  });
  const { data: readyTimestamp } = useScaffoldReadContract({
    contractName: "TimelockController",
    functionName: "getTimestamp",
    args: [operationId],
  });

  const { writeContractAsync: scheduleOperation, isMining: isScheduling } = useScaffoldWriteContract({
    contractName: "TimelockController",
  });
  const { writeContractAsync: cancelOperation, isMining: isCancelling } = useScaffoldWriteContract({
    contractName: "TimelockController",
  });
  const { writeContractAsync: executeOperation, isMining: isExecuting } = useScaffoldWriteContract({
    contractName: "TimelockController",
  });

  const { data: scheduledEvents } = useScaffoldEventHistory({
    contractName: "TimelockController",
    eventName: "CallScheduled",
    watch: true,
  });
  const { data: cancelledEvents } = useScaffoldEventHistory({
    contractName: "TimelockController",
    eventName: "Cancelled",
    watch: true,
  });
  const { data: executedEvents } = useScaffoldEventHistory({
    contractName: "TimelockController",
    eventName: "CallExecuted",
    watch: true,
  });

  const roleBadges = [
    { label: "Proposer", active: Boolean(isProposer) },
    { label: "Executor", active: Boolean(isExecutor) },
    { label: "Canceller", active: Boolean(isCanceller) },
  ];

  const validateOperation = () => {
    if (!timelockContract?.address || !adminTargetContract?.address) {
      notification.error("Deploy the timelock contracts first with `yarn deploy`.");
      return false;
    }

    if (actionData.validationError) {
      notification.error(actionData.validationError);
      return false;
    }

    if (!delayInput.trim() || delay === undefined) {
      notification.error("Enter a valid delay in seconds.");
      return false;
    }

    if (!isBytes32(predecessor)) {
      notification.error("Predecessor must be a 32-byte hex string.");
      return false;
    }

    return true;
  };

  const handleSchedule = async () => {
    if (!validateOperation() || !actionData.calldata || delay === undefined || !adminTargetContract?.address) {
      return;
    }

    try {
      await scheduleOperation({
        functionName: "schedule",
        args: [adminTargetContract.address, 0n, actionData.calldata, predecessor as `0x${string}`, salt, delay],
      });
    } catch (error) {
      notification.error(getParsedError(error));
    }
  };

  const handleCancel = async () => {
    if (!operationId) {
      notification.error("No operation hash is available for cancellation.");
      return;
    }

    try {
      await cancelOperation({
        functionName: "cancel",
        args: [operationId],
      });
    } catch (error) {
      notification.error(getParsedError(error));
    }
  };

  const handleExecute = async () => {
    if (!validateOperation() || !actionData.calldata || !adminTargetContract?.address) {
      return;
    }

    try {
      await executeOperation({
        functionName: "execute",
        args: [adminTargetContract.address, 0n, actionData.calldata, predecessor as `0x${string}`, salt],
      });
    } catch (error) {
      notification.error(getParsedError(error));
    }
  };

  return (
    <div className="px-4 py-10 md:px-8 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="rounded-[2rem] bg-gradient-to-br from-base-200 via-base-100 to-base-300 p-8 shadow-xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-base-100 px-4 py-2 text-sm shadow">
                <ShieldCheckIcon className="h-5 w-5 text-secondary" />
                <span>Role-based timelock governance example</span>
              </div>
              <h1 className="text-4xl font-black tracking-tight">Timelock Admin Workflow</h1>
              <p className="mt-3 text-base-content/70">
                Schedule sensitive admin actions, wait through the configured delay, then execute or cancel them with
                OpenZeppelin timelock roles. The generic{" "}
                <Link href="/debug" className="link">
                  Debug Contracts
                </Link>{" "}
                page remains available as a fallback.
              </p>
            </div>
            <div className="rounded-3xl bg-base-100/80 p-5 shadow-md">
              <p className="text-sm uppercase tracking-[0.25em] text-base-content/50">Target network</p>
              <p className="mt-2 text-2xl font-semibold">{targetNetwork.name}</p>
              <p className="mt-2 text-sm text-base-content/60">
                Import the deployer account if you want local proposer and executor access.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">Timelock Controller</h2>
                  <Address address={timelockContract?.address} chain={targetNetwork} />
                  <p className="text-sm text-base-content/60">Minimum delay: {minDelay?.toString() ?? "..."} seconds</p>
                </div>
              </div>
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">Managed Target</h2>
                  <Address address={adminTargetContract?.address} chain={targetNetwork} />
                  <p className="text-sm text-base-content/60">Owner should be the timelock after deployment.</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <p className="text-sm uppercase tracking-[0.2em] text-base-content/50">Treasury</p>
                  <Address address={treasury} chain={targetNetwork} />
                </div>
              </div>
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <p className="text-sm uppercase tracking-[0.2em] text-base-content/50">Fee Bps</p>
                  <p className="text-3xl font-bold">{feeBps?.toString() ?? "..."}</p>
                </div>
              </div>
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <p className="text-sm uppercase tracking-[0.2em] text-base-content/50">Feature Flag</p>
                  <p className="text-3xl font-bold">
                    {featureEnabled === undefined ? "..." : featureEnabled ? "On" : "Off"}
                  </p>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body gap-5">
                <div>
                  <h2 className="card-title">Build an Operation</h2>
                  <p className="text-sm text-base-content/60">{actionDescriptions[actionType]}</p>
                </div>

                <label className="form-control w-full">
                  <span className="label-text mb-2 font-medium">Action</span>
                  <select
                    className="select select-bordered w-full"
                    value={actionType}
                    onChange={event => setActionType(event.target.value as ActionType)}
                  >
                    <option value="setTreasury">setTreasury(address)</option>
                    <option value="setFeeBps">setFeeBps(uint256)</option>
                    <option value="setFeatureEnabled">setFeatureEnabled(bool)</option>
                  </select>
                </label>

                {actionType === "setTreasury" ? (
                  <label className="form-control w-full">
                    <span className="label-text mb-2 font-medium">New treasury</span>
                    <AddressInput
                      value={treasuryInput}
                      onChange={value => setTreasuryInput(value)}
                      placeholder="0x..."
                    />
                  </label>
                ) : null}

                {actionType === "setFeeBps" ? (
                  <label className="form-control w-full">
                    <span className="label-text mb-2 font-medium">Fee basis points</span>
                    <input
                      className="input input-bordered w-full"
                      inputMode="numeric"
                      placeholder="250"
                      value={feeBpsInput}
                      onChange={event => setFeeBpsInput(event.target.value)}
                    />
                  </label>
                ) : null}

                {actionType === "setFeatureEnabled" ? (
                  <label className="form-control w-full">
                    <span className="label-text mb-2 font-medium">Feature enabled</span>
                    <select
                      className="select select-bordered w-full"
                      value={featureEnabledInput}
                      onChange={event => setFeatureEnabledInput(event.target.value)}
                    >
                      <option value="false">false</option>
                      <option value="true">true</option>
                    </select>
                  </label>
                ) : null}

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="form-control w-full">
                    <span className="label-text mb-2 font-medium">Delay (seconds)</span>
                    <input
                      className="input input-bordered w-full"
                      inputMode="numeric"
                      placeholder={minDelay?.toString() ?? "3600"}
                      value={delayInput}
                      onChange={event => setDelayInput(event.target.value)}
                    />
                  </label>
                  <label className="form-control w-full">
                    <span className="label-text mb-2 font-medium">Salt label</span>
                    <input
                      className="input input-bordered w-full"
                      placeholder="treasury-rotation-1"
                      value={saltLabel}
                      onChange={event => setSaltLabel(event.target.value)}
                    />
                  </label>
                </div>

                <label className="form-control w-full">
                  <span className="label-text mb-2 font-medium">Predecessor operation id</span>
                  <input
                    className="input input-bordered w-full font-mono text-xs md:text-sm"
                    placeholder={zeroHash}
                    value={predecessorInput}
                    onChange={event => setPredecessorInput(event.target.value)}
                  />
                </label>

                <div className="rounded-3xl bg-base-200 p-4 text-sm">
                  <p className="font-semibold">Derived operation payload</p>
                  <p className="mt-3 break-all font-mono text-xs">
                    Target: {adminTargetContract?.address ?? "Not deployed"}
                  </p>
                  <p className="mt-2 font-mono text-xs">Value: 0</p>
                  <p className="mt-2 break-all font-mono text-xs">Salt: {salt}</p>
                  <p className="mt-2 break-all font-mono text-xs">
                    Calldata: {actionData.calldata ?? actionData.validationError ?? "Waiting for inputs"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button className="btn btn-primary" onClick={handleSchedule} disabled={isScheduling}>
                    {isScheduling ? <span className="loading loading-spinner loading-sm" /> : null}
                    Schedule
                  </button>
                  <button className="btn btn-warning" onClick={handleCancel} disabled={isCancelling || !operationId}>
                    {isCancelling ? <span className="loading loading-spinner loading-sm" /> : null}
                    Cancel
                  </button>
                  <button className="btn btn-secondary" onClick={handleExecute} disabled={isExecuting}>
                    {isExecuting ? <span className="loading loading-spinner loading-sm" /> : null}
                    Execute
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Connected Wallet Access</h2>
                <Address address={connectedAddress} chain={targetNetwork} />
                <div className="mt-4 flex flex-wrap gap-2">
                  {roleBadges.map(role => (
                    <span
                      key={role.label}
                      className={`badge badge-lg ${role.active ? "badge-success" : "badge-outline"}`}
                    >
                      {role.label}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-sm text-base-content/60">
                  Target owner: <span className="font-mono">{owner ?? "..."}</span>
                </p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Operation Status</h2>
                <p className="break-all font-mono text-xs">
                  {operationId ?? "Operation hash will appear after the payload is valid."}
                </p>
                <div className="mt-4 grid gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-base-content/50">State</p>
                    <p className="text-2xl font-bold">{renderOperationState(operationState)}</p>
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-base-content/50">Ready timestamp</p>
                    <p className="text-lg font-semibold">{readyTimestamp?.toString() ?? "..."}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Recent Timelock Events</h2>

                <div>
                  <p className="mb-2 font-semibold">Scheduled</p>
                  <div className="space-y-2">
                    {(scheduledEvents ?? []).slice(0, 3).map(event => (
                      <div
                        key={`${event.transactionHash}-${event.logIndex}`}
                        className="rounded-2xl bg-base-200 p-3 text-xs"
                      >
                        <p className="break-all font-mono">{String((event as any).args?.id ?? "")}</p>
                        <p className="mt-1 text-base-content/60">
                          delay {(event as any).args?.delay?.toString?.() ?? "0"}s
                        </p>
                      </div>
                    ))}
                    {!scheduledEvents?.length ? (
                      <p className="text-sm text-base-content/60">No schedule events yet.</p>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4">
                  <p className="mb-2 font-semibold">Executed</p>
                  <div className="space-y-2">
                    {(executedEvents ?? []).slice(0, 3).map(event => (
                      <div
                        key={`${event.transactionHash}-${event.logIndex}`}
                        className="rounded-2xl bg-base-200 p-3 text-xs"
                      >
                        <p className="break-all font-mono">{String((event as any).args?.id ?? "")}</p>
                      </div>
                    ))}
                    {!executedEvents?.length ? (
                      <p className="text-sm text-base-content/60">No execution events yet.</p>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4">
                  <p className="mb-2 font-semibold">Cancelled</p>
                  <div className="space-y-2">
                    {(cancelledEvents ?? []).slice(0, 3).map(event => (
                      <div
                        key={`${event.transactionHash}-${event.logIndex}`}
                        className="rounded-2xl bg-base-200 p-3 text-xs"
                      >
                        <p className="break-all font-mono">{String((event as any).args?.id ?? "")}</p>
                      </div>
                    ))}
                    {!cancelledEvents?.length ? (
                      <p className="text-sm text-base-content/60">No cancel events yet.</p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
