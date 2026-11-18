'use client';

import { useState } from 'react';
import { ClassRibaResult } from '@/lib/riba-scoring';
import { ArrowUpDown, Award } from 'lucide-react';

export default function RibaScoreTable({ result }: { result: ClassRibaResult }) {
  const [sortBy, setSortBy] = useState<'rank' | 'rs'>('rank');
  const isPreschool = result.level === 'okuloncesi';

  if (!result.hasAnyData) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center text-xs text-slate-500">
        Bu sınıf için henüz RİBA anket yanıtı kaydedilmedi. Linkleri paylaştıkça yanıtlar burada anlık hesaplanacaktır.
      </div>
    );
  }

  const sortedRows = [...result.rows].sort((a, b) => {
    if (sortBy === 'rs') return a.targetId - b.targetId;
    if (b.asp !== a.asp) return b.asp - a.asp;
    return a.targetId - b.targetId;
  });

  const top3 = [...result.rows].sort((a, b) => b.asp - a.asp).slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Top 3 Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {top3.map((item, idx) => (
          <div
            key={item.targetId}
            className="rounded-xl bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-200/80 p-3.5"
          >
            <div className="flex items-center justify-between text-xs font-bold text-rose-700 mb-1">
              <span className="inline-flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                {idx + 1}. Öncelikli İhtiyaç
              </span>
              <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white">
                ASP: {item.asp.toFixed(2)}
              </span>
            </div>
            <div className="text-xs font-bold text-slate-900 leading-snug">
              #{item.targetId} {item.title}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">
          Toplam {result.rows.length} rehberlik hedefi — Ağırlıklı Standart Puan (ASP)
        </span>
        <button
          type="button"
          onClick={() => setSortBy((s) => (s === 'rank' ? 'rs' : 'rank'))}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
          {sortBy === 'rank' ? 'ASP Sırasına Göre' : 'Resmi Sıra Numarasına Göre (RS)'}
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
            <tr>
              <th className="px-3 py-2.5 w-12 text-center">RS</th>
              <th className="px-3 py-2.5">Rehberlik Hedef Alanı</th>
              {!isPreschool && <th className="px-3 py-2.5 text-center">Öğr (f / Z)</th>}
              <th className="px-3 py-2.5 text-center">Veli (f / Z)</th>
              <th className="px-3 py-2.5 text-center">Öğrt (f / Z)</th>
              <th className="px-3 py-2.5 text-center">ASP</th>
              <th className="px-3 py-2.5 text-center">Sıra</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedRows.map((row) => {
              const isTop = row.rank > 0 && row.rank <= 3;
              return (
                <tr key={row.targetId} className={isTop ? 'bg-rose-50/70' : 'hover:bg-slate-50'}>
                  <td className="px-3 py-2 text-center font-mono text-slate-500">{row.targetId}</td>
                  <td className="px-3 py-2 font-medium text-slate-900">{row.title}</td>
                  {!isPreschool && (
                    <td className="px-3 py-2 text-center text-slate-600">
                      {row.freqStudent}{' '}
                      <span className="text-[11px] text-slate-400">
                        ({row.zStudent !== null ? row.zStudent.toFixed(1) : '-'})
                      </span>
                    </td>
                  )}
                  <td className="px-3 py-2 text-center text-slate-600">
                    {row.freqParent}{' '}
                    <span className="text-[11px] text-slate-400">
                      ({row.zParent !== null ? row.zParent.toFixed(1) : '-'})
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center text-slate-600">
                    {row.freqTeacher}{' '}
                    <span className="text-[11px] text-slate-400">
                      ({row.zTeacher !== null ? row.zTeacher.toFixed(1) : '-'})
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center font-bold text-slate-900">
                    {row.asp.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {row.rank > 0 ? (
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold ${
                          isTop
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {row.rank}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
