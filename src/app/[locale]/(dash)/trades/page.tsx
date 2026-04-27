"use client";

import { useEffect, useState } from "react";
import { Table } from "@/components/ds/Table";
import { Pill } from "@/components/ds/Pill";
import { api } from "@/lib/api";

interface Trade {
  id: string;
  symbol: string;
  side: string;
  quantity: number;
  entryPrice: number;
  closePrice: number | null;
  realizedPnl: number | null;
  book: string;
  openedAt: string;
  closedAt: string | null;
}

const TradesPage = () => {
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    api
      .get<Trade[]>("/binance-account/trades")
      .then(setTrades)
      .catch(() => {});
  }, []);

  return (
    <>
      <h1 className="ds-h1">Trades</h1>

      {trades.length === 0 ? (
        <div className="ds-empty">
          <span>No closed trades yet.</span>
        </div>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Side</th>
              <th className="num">Qty</th>
              <th className="num">Entry</th>
              <th className="num">Close</th>
              <th className="num">PnL</th>
              <th>Book</th>
              <th>Closed</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((t) => (
              <tr key={t.id}>
                <td style={{ fontWeight: 500 }}>{t.symbol}</td>
                <td>
                  <Pill variant={t.side === "LONG" ? "success" : "danger"}>
                    {t.side === "LONG" ? "L" : "S"}
                  </Pill>
                </td>
                <td className="num">{t.quantity}</td>
                <td className="num">{t.entryPrice.toFixed(2)}</td>
                <td className="num">{t.closePrice?.toFixed(2) ?? "--"}</td>
                <td
                  className="num"
                  style={{
                    color:
                      (t.realizedPnl ?? 0) > 0
                        ? "var(--ds-success)"
                        : (t.realizedPnl ?? 0) < 0
                          ? "var(--ds-danger)"
                          : undefined,
                    fontWeight: 500,
                  }}
                >
                  {t.realizedPnl != null
                    ? `$${t.realizedPnl.toFixed(2)}`
                    : "--"}
                </td>
                <td>
                  <Pill variant={t.book === "PAPER" ? "paper" : "live"}>
                    {t.book}
                  </Pill>
                </td>
                <td className="ds-mono" style={{ fontSize: "var(--ds-fs-xs)" }}>
                  {t.closedAt ? new Date(t.closedAt).toLocaleString() : "--"}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
};

export default TradesPage;
