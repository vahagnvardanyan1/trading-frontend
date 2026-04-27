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
  stopLoss: number | null;
  takeProfit: number | null;
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
              <th className="num">Entry</th>
              <th className="num">SL</th>
              <th className="num">TP</th>
              <th>Time</th>
              <th>Book</th>
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
                <td className="num">{p.entryPrice.toFixed(2)}</td>
                <td className="num">{p.stopLoss?.toFixed(2) ?? "--"}</td>
                <td className="num">{p.takeProfit?.toFixed(2) ?? "--"}</td>
                <td className="ds-mono" style={{ fontSize: "var(--ds-fs-xs)" }}>
                  {new Date(p.openedAt).toLocaleString()}
                </td>
                <td>
                  <Pill variant={p.book === "PAPER" ? "paper" : "live"}>
                    {p.book}
                  </Pill>
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
