"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { Packet } from "@/types/types";

interface BaseAgentActionsDropdownProps {
  onRemove: (e?: Event) => void;
  onReassign: (e?: Event) => void;
}

interface ExtendedAgentActionsDropdownProps extends BaseAgentActionsDropdownProps {
  packet?: Packet;
}

export function AgentActionsDropdown({
  onRemove,
  onReassign,
  packet,
}: ExtendedAgentActionsDropdownProps) {
  // If it's a pickup request (no packet prop), use the original behavior
  if (!packet) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={(e: Event) => onReassign(e)}
            className="cursor-pointer"
          >
            Reassign Agent
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(e: Event) => onRemove(e)}
            className="cursor-pointer text-red-600 focus:text-red-600"
          >
            Remove Agent
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // For delivery packets, only show actions if the packet is not delivered
  if (packet.status === "delivered") {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {packet.status !== "delivered" && (
          <>
            <DropdownMenuItem
              onSelect={(e: Event) => onReassign(e)}
              className="cursor-pointer"
            >
              Reassign Agent
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e: Event) => onRemove(e)}
              className="cursor-pointer text-red-600 focus:text-red-600"
            >
              Remove Agent
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}