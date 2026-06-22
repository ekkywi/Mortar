import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getTelemetryHistoryPage, normalizeHistoryPage, PAGE_SIZE } from '@/lib/telemetry';

type HistoryDataPageProps = {
  searchParams: Promise<{ page?: string | string[] | undefined }>;
};

const dateTimeFormatter = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium',
  timeStyle: 'medium',
});

function formatDateTime(value: Date) {
  return dateTimeFormatter.format(value);
}

function buildPageHref(page: number) {
  return page === 1 ? '/history-data' : `/history-data?page=${page}`;
}

function getVisiblePages(currentPage: number, totalPages: number) {
  if (totalPages <= 1) {
    return [1];
  }

  const candidates = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);

  return [...candidates]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((left, right) => left - right);
}

export default async function HistoryDataPage({ searchParams }: HistoryDataPageProps) {
  const query = await searchParams;
  const requestedPage = normalizeHistoryPage(query.page);
  const history = await getTelemetryHistoryPage(query.page);

  if (history.totalPages > 0 && requestedPage > history.totalPages) {
    redirect(buildPageHref(history.totalPages));
  }

  const visiblePages = getVisiblePages(history.currentPage, history.totalPages);

  return (
    <main className="space-y-6 font-mono text-slate-900">
      <header className="flex flex-col gap-3 border-b border-slate-200 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">History Data</h2>
          <p className="mt-1 text-sm text-slate-500">
            Menampilkan histori telemetry terbaru dari database secara bertahap.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
          <p>Total data: <span className="font-semibold text-slate-900">{history.totalCount}</span></p>
          <p>Ukuran halaman: <span className="font-semibold text-slate-900">{PAGE_SIZE}</span> baris</p>
        </div>
      </header>

      {history.totalCount === 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h3 className="text-lg font-bold text-slate-800">Belum ada data telemetry</h3>
          <p className="mt-2 text-sm text-slate-500">
            Data histori akan muncul di sini setelah perangkat mulai mengirim telemetry ke server.
          </p>
        </section>
      ) : (
        <section className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Device Time</th>
                    <th className="px-4 py-3 font-semibold">Distance Upper</th>
                    <th className="px-4 py-3 font-semibold">Distance Lower</th>
                    <th className="px-4 py-3 font-semibold">Pump</th>
                    <th className="px-4 py-3 font-semibold">Fuzzy Output</th>
                    <th className="px-4 py-3 font-semibold">Latency</th>
                    <th className="px-4 py-3 font-semibold">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.rows.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 text-slate-700">{formatDateTime(item.deviceTime)}</td>
                      <td className="px-4 py-3 text-slate-700">{item.distanceUpper.toFixed(2)} cm</td>
                      <td className="px-4 py-3 text-slate-700">{item.distanceLower.toFixed(2)} cm</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          item.isPumpOn
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {item.isPumpOn ? 'Aktif' : 'Mati'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-amber-600">{item.fuzzyOutput.toFixed(2)}</td>
                      <td className="px-4 py-3 text-slate-700">{item.latencyMs} ms</td>
                      <td className="px-4 py-3 text-slate-500">{formatDateTime(item.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-slate-500">
              Halaman <span className="font-semibold text-slate-900">{history.currentPage}</span> dari{' '}
              <span className="font-semibold text-slate-900">{history.totalPages}</span>
            </p>

            <div className="flex flex-wrap items-center gap-2">
              {history.hasPrev ? (
                <Link
                  href={buildPageHref(history.currentPage - 1)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100"
                >
                  Sebelumnya
                </Link>
              ) : (
                <span className="cursor-not-allowed rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-300">
                  Sebelumnya
                </span>
              )}

              {visiblePages.map((page) => (
                <Link
                  key={page}
                  href={buildPageHref(page)}
                  className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                    page === history.currentPage
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {page}
                </Link>
              ))}

              {history.hasNext ? (
                <Link
                  href={buildPageHref(history.currentPage + 1)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100"
                >
                  Berikutnya
                </Link>
              ) : (
                <span className="cursor-not-allowed rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-300">
                  Berikutnya
                </span>
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
