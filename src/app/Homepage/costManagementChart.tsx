import * as React from 'react';
import { useMemo, useRef } from 'react';
import { useDeferredResizeObserverWidth } from '@app/useDeferredResizeObserver';
import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartStack,
  ChartThemeColor,
  ChartVoronoiContainer
} from '@patternfly/react-charts';

const PLOT_AREA_HEIGHT = 120;
const CHART_TOP_PADDING = 12;
const CHART_BOTTOM_PADDING = 28;
const CHART_HEIGHT = CHART_TOP_PADDING + PLOT_AREA_HEIGHT + CHART_BOTTOM_PADDING;

const CHART_PADDING = {
  bottom: CHART_BOTTOM_PADDING,
  left: 52,
  right: 16,
  top: CHART_TOP_PADDING
};

interface CostPoint {
  name: string;
  x: number;
  y: number;
}

function useChartContainerWidth() {
  const containerRef = useRef<HTMLDivElement>(null);
  const width = useDeferredResizeObserverWidth(() => containerRef.current, []);

  return { containerRef, width };
}

function buildDayLabels(dayCount: number): number[] {
  return Array.from({ length: dayCount }, (_, index) => index + 1);
}

function buildCostSeries(
  name: string,
  dayCount: number,
  base: number,
  amplitude: number
): CostPoint[] {
  return buildDayLabels(dayCount).map((day) => ({
    name,
    x: day,
    y: Math.max(0, Math.round(base + Math.sin(day / 2.8) * amplitude + (day % 5) * 1.5))
  }));
}

export function CostManagementChart({
  dayCount,
  view
}: {
  dayCount: number;
  view: 'openshift' | 'infrastructure';
}) {
  const primaryLabel = view === 'infrastructure' ? 'Infrastructure cost' : 'Cluster cost';
  const secondaryLabel = view === 'infrastructure' ? 'Network cost' : 'Storage cost';
  const primaryBase = view === 'infrastructure' ? 310 : 420;
  const secondaryBase = view === 'infrastructure' ? 140 : 180;

  const primaryData = useMemo(
    () => buildCostSeries(primaryLabel, dayCount, primaryBase, view === 'infrastructure' ? 60 : 85),
    [dayCount, primaryBase, primaryLabel, view]
  );
  const secondaryData = useMemo(
    () => buildCostSeries(secondaryLabel, dayCount, secondaryBase, view === 'infrastructure' ? 35 : 45),
    [dayCount, secondaryBase, secondaryLabel, view]
  );

  const { containerRef, width } = useChartContainerWidth();

  return (
    <div
      ref={containerRef}
      className="cost-management-widget__chart-frame"
      role="img"
      aria-label="OpenShift cost comparison chart"
    >
      {width > 0 ? (
        <Chart
          ariaDesc="OpenShift cost comparison by category over the selected period"
          ariaTitle="OpenShift cost comparison"
          containerComponent={
            <ChartVoronoiContainer
              labels={({ datum }) => `${datum.name}: $${datum.y}`}
              constrainToVisibleArea
            />
          }
          height={CHART_HEIGHT}
          width={width}
          padding={CHART_PADDING}
          themeColor={ChartThemeColor.multiUnordered}
        >
          <ChartAxis tickFormat={(tick) => (Number(tick) % 5 === 1 || tick === dayCount ? tick : '')} />
          <ChartAxis dependentAxis showGrid tickFormat={(tick) => `$${tick}`} />
          <ChartStack>
            <ChartArea data={primaryData} interpolation="monotoneX" />
            <ChartArea data={secondaryData} interpolation="monotoneX" />
          </ChartStack>
        </Chart>
      ) : null}
    </div>
  );
}
