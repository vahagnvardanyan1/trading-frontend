"use client";

import { useEffect, useState } from "react";
import { Table } from "@/components/ds/Table";
import { Pill } from "@/components/ds/Pill";
import { api } from "@/lib/api";

interface Position {
  id: string;
  symbol: string;
  side: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnl: number;
  totalFees: number;
  book: string;
  openedAt: string;
}

const PositionsPage = () => {
  const [positions, setPositions] = useState<Position[]>([]);

  useEffect(() => {
    api
      .get<Position[]>("/binance-account/positions")
      .then(setPositions)
      .catch(() => {});
  }, []);

  return (
    <>
      <h1 className="ds-h1">Positions</h1>

      {positions.length === 0 ? (
        <div className="ds-empty">
          <span>No open positions.</span>
        </div>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Side</th>
              <th className="num">Qty</th>
              <th className="num">Avg Entry</th>
              <th className="num">Current</th>
              <th className="num">Unrealized PnL</th>
              <th className="num">Fees</th>
              <th>Since</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((p) => (
              <tr key={p.id}>
                <td style={{ fontWeight: 500 }}>{p.symbol}</td>
                <td>
                  <Pill variant={p.side === "LONG" ? "success" : "danger"}>
                    {p.side === "LONG" ? "L" : "S"}
                  </Pill>
                </td>
                <td className="num">{p.quantity}</td>
                <td className="num">
                  {p.entryPrice > 0 ? p.entryPrice.toFixed(2) : "--"}
                </td>
                <td className="num">
                  {p.currentPrice > 0 ? p.currentPrice.toFixed(2) : "--"}
                </td>
                <td
                  className="num"
                  style={{
                    color:
                      p.unrealizedPnl > 0
                        ? "var(--ds-success)"
                        : p.unrealizedPnl < 0
                          ? "var(--ds-danger)"
                          : undefined,
                    fontWeight: 500,
                  }}
                >
                  {p.entryPrice > 0
                    ? `$${p.unrealizedPnl.toFixed(2)}`
                    : "--"}
                </td>
                <td
                  className="num"
                  style={{ color: "var(--ds-danger)", fontWeight: 500 }}
                >
                  {p.totalFees > 0 ? `$${p.totalFees.toFixed(4)}` : "--"}
                </td>
                <td className="ds-mono" style={{ fontSize: "var(--ds-fs-xs)" }}>
                  {new Date(p.openedAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
};

export default PositionsPage;
