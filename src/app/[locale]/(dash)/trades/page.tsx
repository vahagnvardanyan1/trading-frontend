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
  price: number;
  cost: number;
  fee: number;
  feeCurrency: string;
  takerOrMaker: string;
  orderId: string;
  timestamp: string;
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
          <span>No trades yet.</span>
        </div>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Side</th>
              <th className="num">Qty</th>
              <th className="num">Price</th>
              <th className="num">Cost</th>
              <th className="num">Fee</th>
              <th>Role</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((t) => (
              <tr key={t.id}>
                <td style={{ fontWeight: 500 }}>{t.symbol}</td>
                <td>
                  <Pill variant={t.side === "BUY" ? "success" : "danger"}>
                    {t.side}
                  </Pill>
                </td>
                <td className="num">{t.quantity}</td>
                <td className="num">{t.price.toFixed(2)}</td>
                <td className="num">${t.cost.toFixed(2)}</td>
                <td
                  className="num"
                  style={{ color: "var(--ds-danger)", fontWeight: 500 }}
                >
                  {t.fee > 0
                    ? `${t.fee.toFixed(4)} ${t.feeCurrency}`
                    : "--"}
                </td>
                <td>
                  <Pill
                    variant={t.takerOrMaker === "maker" ? "paper" : "live"}
                  >
                    {t.takerOrMaker.toUpperCase()}
                  </Pill>
                </td>
                <td className="ds-mono" style={{ fontSize: "var(--ds-fs-xs)" }}>
                  {new Date(t.timestamp).toLocaleString()}
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
