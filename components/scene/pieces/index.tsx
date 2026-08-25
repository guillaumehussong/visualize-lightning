"use client";

import { WalletPiece } from "./WalletPiece";
import { InvoicePiece } from "./InvoicePiece";
import { ChannelPiece } from "./ChannelPiece";
import { LiquidityPiece } from "./LiquidityPiece";
import { HtlcPiece } from "./HtlcPiece";
import { RoutingPiece } from "./RoutingPiece";
import { FeesPiece } from "./FeesPiece";
import { JusticePiece } from "./JusticePiece";
import { NodesPiece } from "./NodesPiece";
import { SettlementPiece } from "./SettlementPiece";

export interface PieceVisualProps {
  active: boolean;
}

export const PIECE_VISUALS: Record<
  string,
  React.ComponentType<PieceVisualProps>
> = {
  wallet: WalletPiece,
  invoice: InvoicePiece,
  channel: ChannelPiece,
  liquidity: LiquidityPiece,
  htlc: HtlcPiece,
  routing: RoutingPiece,
  fees: FeesPiece,
  justice: JusticePiece,
  nodes: NodesPiece,
  settlement: SettlementPiece,
};
