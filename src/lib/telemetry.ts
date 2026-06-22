import type { TankTelemetry } from '@prisma/client';
import { prisma } from '@/lib/prisma';

const PAGE_SIZE = 50;

export interface TelemetryHistoryPage {
  currentPage: number;
  hasNext: boolean;
  hasPrev: boolean;
  rows: TankTelemetry[];
  totalCount: number;
  totalPages: number;
}

export function normalizeHistoryPage(pageParam: string | string[] | undefined) {
  const rawPage = Array.isArray(pageParam) ? pageParam[0] : pageParam;
  const parsedPage = Number.parseInt(rawPage ?? '1', 10);

  if (!Number.isFinite(parsedPage) || parsedPage < 1) {
    return 1;
  }

  return parsedPage;
}

export async function getTelemetryHistoryPage(pageParam: string | string[] | undefined): Promise<TelemetryHistoryPage> {
  const requestedPage = normalizeHistoryPage(pageParam);
  const totalCount = await prisma.tankTelemetry.count();
  const totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / PAGE_SIZE);
  const currentPage = totalPages === 0 ? 1 : Math.min(requestedPage, totalPages);
  const skip = (currentPage - 1) * PAGE_SIZE;

  const rows = totalCount === 0
    ? []
    : await prisma.tankTelemetry.findMany({
        orderBy: {
          deviceTime: 'desc',
        },
        skip,
        take: PAGE_SIZE,
      });

  return {
    currentPage,
    hasNext: totalPages > 0 && currentPage < totalPages,
    hasPrev: currentPage > 1,
    rows,
    totalCount,
    totalPages,
  };
}

export { PAGE_SIZE };
