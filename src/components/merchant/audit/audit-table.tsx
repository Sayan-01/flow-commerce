"use client";

import React, { useState } from "react";
import {
  Search,
  Filter,
  ShieldCheck,
  Code,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronUp,
  User,
  Bot,
  Cpu,
  Store,
  Terminal,
} from "lucide-react";
import { AuditLogRow } from "./types";

interface AuditTableProps {
  logs: AuditLogRow[];
  onFilterChange?: (filters: { actor?: string; status?: string; search?: string }) => void;
}

export function AuditTable({ logs, onFilterChange }: AuditTableProps) {
  const [search, setSearch] = useState("");
  const [selectedActor, setSelectedActor] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (onFilterChange) {
      onFilterChange({ actor: selectedActor, status: selectedStatus, search: val });
    }
  };

  const handleActorChange = (act: string) => {
    setSelectedActor(act);
    if (onFilterChange) {
      onFilterChange({ actor: act, status: selectedStatus, search });
    }
  };

  const handleStatusChange = (st: string) => {
    setSelectedStatus(st);
    if (onFilterChange) {
      onFilterChange({ actor: selectedActor, status: st, search });
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (selectedActor !== "ALL" && log.actor !== selectedActor) return false;
    if (selectedStatus !== "ALL" && log.status !== selectedStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchAction = log.action.toLowerCase().includes(q);
      const matchReason = (log.reason || "").toLowerCase().includes(q);
      const matchEntity = (log.entityId || "").toLowerCase().includes(q);
      if (!matchAction && !matchReason && !matchEntity) return false;
    }
    return true;
  });

  const getActorBadge = (actor: string) => {
    switch (actor) {
      case "AGENT":
        return {
          bg: "bg-indigo-500/10 border-indigo-500/20 text-indigo-300",
          icon: Bot,
        };
      case "USER":
        return {
          bg: "bg-blue-500/10 border-blue-500/20 text-blue-300",
          icon: User,
        };
      case "SYSTEM":
        return {
          bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
          icon: Cpu,
        };
      case "MERCHANT":
        return {
          bg: "bg-purple-500/10 border-purple-500/20 text-purple-300",
          icon: Store,
        };
      default:
        return {
          bg: "bg-zinc-800 border-zinc-700 text-zinc-300",
          icon: Cpu,
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Box */}
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search action, reason, entity ID..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {/* Actor Filter */}
          <select
            value={selectedActor}
            onChange={(e) => handleActorChange(e.target.value)}
            className="px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">All Actors</option>
            <option value="AGENT">Agent (AI)</option>
            <option value="USER">User (Customer)</option>
            <option value="SYSTEM">System Guardrail</option>
            <option value="MERCHANT">Merchant</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUCCESS">Success</option>
            <option value="REJECTED">Guardrail Rejected</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/80 border-b border-zinc-800 text-[11px] uppercase font-bold tracking-wider text-zinc-400">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Reason / Details</th>
                <th className="py-3 px-4 text-right">Payload</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const actorMeta = getActorBadge(log.actor);
                  const ActorIcon = actorMeta.icon;
                  const isExpanded = expandedLogId === log.id;
                  const isReject = log.status === "REJECTED";
                  const isSuccess = log.status === "SUCCESS";

                  return (
                    <React.Fragment key={log.id}>
                      <tr className="hover:bg-zinc-900/80 transition-colors">
                        {/* Timestamp */}
                        <td className="py-3 px-4 whitespace-nowrap text-zinc-400 text-[11px]">
                          {new Date(log.createdAt).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </td>

                        {/* Actor */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold ${actorMeta.bg}`}
                          >
                            <ActorIcon className="h-3 w-3" />
                            <span>{log.actor}</span>
                          </span>
                        </td>

                        {/* Action */}
                        <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                          <span
                            className={
                              isReject
                                ? "text-amber-400"
                                : log.action.includes("PAID")
                                ? "text-emerald-400"
                                : "text-zinc-200"
                            }
                          >
                            {log.action}
                          </span>
                        </td>

                        {/* Entity */}
                        <td className="py-3 px-4 whitespace-nowrap text-zinc-400 text-[11px]">
                          {log.entityType ? (
                            <span>
                              {log.entityType}{" "}
                              {log.entityId && (
                                <span className="text-zinc-500">
                                  #{log.entityId.slice(-6)}
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="text-zinc-600">—</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                              isSuccess
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                                : isReject
                                ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
                                : "bg-red-500/10 border-red-500/20 text-red-300"
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>

                        {/* Reason / Summary */}
                        <td className="py-3 px-4 font-sans text-zinc-300 max-w-xs truncate text-[11px]">
                          {log.reason || "—"}
                        </td>

                        {/* Payload expand button */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          {log.payload ? (
                            <button
                              onClick={() =>
                                setExpandedLogId(isExpanded ? null : log.id)
                              }
                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-zinc-950 border border-zinc-800 text-[10px] text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                              <Code className="h-3 w-3" />
                              <span>{isExpanded ? "Hide" : "JSON"}</span>
                            </button>
                          ) : (
                            <span className="text-zinc-600 text-[10px]">None</span>
                          )}
                        </td>
                      </tr>

                      {/* Expandable JSON Payload Drawer */}
                      {isExpanded && log.payload && (
                        <tr className="bg-zinc-950/90 border-b border-zinc-800">
                          <td colSpan={7} className="p-4 font-mono text-[11px]">
                            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-zinc-300 overflow-x-auto">
                              <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800/80 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                                <span>Audit Log Context Payload</span>
                                <span>ID: {log.id}</span>
                              </div>
                              <pre className="text-indigo-300 text-[11px] leading-relaxed">
                                {typeof log.payload === "string"
                                  ? JSON.stringify(JSON.parse(log.payload), null, 2)
                                  : JSON.stringify(log.payload, null, 2)}
                              </pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
