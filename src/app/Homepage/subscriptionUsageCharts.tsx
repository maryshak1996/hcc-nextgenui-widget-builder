import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Chart,
  ChartArea,
  ChartAxis,
  ChartGroup,
  ChartStack,
  ChartThemeColor,
  ChartThreshold,
  ChartVoronoiContainer
} from '@patternfly/react-charts';

const PLOT_AREA_HEIGHT = 120;
const CHART_TOP_PADDING = 12;
const CHART_BOTTOM_PADDING = 28;
const CHART_HEIGHT = CHART_TOP_PADDING + PLOT_AREA_HEIGHT + CHART_BOTTOM_PADDING;

const CHART_PADDING = {
  bottom: CHART_BOTTOM_PADDING,
  left: 44,
  right: 16,
  top: CHART_TOP_PADDING
};

interface UsagePoint {
  name: string;
  x: number;
  y: number;
}

function useChartContainerWidth() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return undefined;
    }

    const updateWidth = () => {
      setWidth(Math.max(0, Math.floor(element.clientWidth)));
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { containerRef, width };
}

function buildDayLabels(dayCount: number): number[] {
  return Array.from({ length: dayCount }, (_, index) => index + 1);
}

function buildSingleSeries(name: string, dayCount: number, base: number, amplitude: number): UsagePoint[] {
  return buildDayLabels(dayCount).map((day) => ({
    name,
    x: day,
    y: Math.max(0, Math.round(base + Math.sin(day / 3) * amplitude + (day % 4)))
  }));
}

function buildStackedSeries(
  name: string,
  dayCount: number,
  base: number,
  amplitude: number
): UsagePoint[] {
  return buildDayLabels(dayCount).map((day) => ({
    name,
    x: day,
    y: Math.max(1, Math.round(base + Math.cos(day / 2.5) * amplitude + (day % 3)))
  }));
}

function buildThresholdSeries(dayCount: number, value: number): UsagePoint[] {
  return [
    { name: 'Subscription threshold', x: 1, y: value },
    { name: 'Subscription threshold', x: dayCount, y: value }
  ];
}

interface SubscriptionUsageChartFrameProps {
  renderChart: (width: number) => React.ReactNode;
  'aria-label': string;
}

function SubscriptionUsageChartFrame({ renderChart, 'aria-label': ariaLabel }: SubscriptionUsageChartFrameProps) {
  const { containerRef, width } = useChartContainerWidth();

  return (
    <div
      ref={containerRef}
      className="subscription-usage-widget__chart-frame"
      role="img"
      aria-label={ariaLabel}
    >
      {width > 0 ? renderChart(width) : null}
    </div>
  );
}

export function OpenshiftSubscriptionUsageChart({
  seriesLabel,
  dayCount
}: {
  seriesLabel: string;
  dayCount: number;
}) {
  const usageData = useMemo(
    () => buildSingleSeries(seriesLabel, dayCount, 34, 8),
    [dayCount, seriesLabel]
  );
  const thresholdValue = 48;
  const thresholdData = useMemo(
    () => buildThresholdSeries(dayCount, thresholdValue),
    [dayCount, thresholdValue]
  );

  return (
    <SubscriptionUsageChartFrame aria-label={`${seriesLabel} usage chart`} renderChart={(width) => (
        <Chart
          ariaDesc={`${seriesLabel} usage over the selected time frame`}
          ariaTitle={`OpenShift ${seriesLabel.toLowerCase()} usage`}
          containerComponent={
            <ChartVoronoiContainer
              labels={({ datum }) => `${datum.name}: ${datum.y}`}
              constrainToVisibleArea
            />
          }
          height={CHART_HEIGHT}
          width={width}
          maxDomain={{ y: 60 }}
          padding={CHART_PADDING}
          themeColor={ChartThemeColor.blue}
        >
          <ChartAxis tickFormat={(tick) => (Number(tick) % 5 === 1 || tick === dayCount ? tick : '')} />
          <ChartAxis dependentAxis showGrid />
          <ChartGroup>
            <ChartArea data={usageData} interpolation="monotoneX" />
          </ChartGroup>
          <ChartThreshold data={thresholdData} />
        </Chart>
      )} />
  );
}

export function RhelSubscriptionUsageChart({ dayCount }: { dayCount: number }) {
  const physicalData = useMemo(
    () => buildStackedSeries('Physical', dayCount, 8, 2),
    [dayCount]
  );
  const virtualData = useMemo(
    () => buildStackedSeries('Virtual', dayCount, 12, 3),
    [dayCount]
  );
  const publicCloudData = useMemo(
    () => buildStackedSeries('Public cloud', dayCount, 6, 2),
    [dayCount]
  );
  const hypervisorData = useMemo(
    () => buildStackedSeries('Hypervisor', dayCount, 4, 1),
    [dayCount]
  );
  const thresholdValue = 42;
  const thresholdData = useMemo(
    () => buildThresholdSeries(dayCount, thresholdValue),
    [dayCount, thresholdValue]
  );

  return (
    <SubscriptionUsageChartFrame aria-label="RHEL subscription usage chart" renderChart={(width) => (
        <Chart
          ariaDesc="RHEL subscription usage by deployment type over the selected time frame"
          ariaTitle="RHEL subscription usage"
          containerComponent={
            <ChartVoronoiContainer
              labels={({ datum }) => `${datum.name}: ${datum.y}`}
              constrainToVisibleArea
            />
          }
          height={CHART_HEIGHT}
          width={width}
          padding={CHART_PADDING}
          themeColor={ChartThemeColor.multiUnordered}
        >
          <ChartAxis tickFormat={(tick) => (Number(tick) % 5 === 1 || tick === dayCount ? tick : '')} />
          <ChartAxis dependentAxis showGrid />
          <ChartStack>
            <ChartArea data={physicalData} interpolation="monotoneX" />
            <ChartArea data={virtualData} interpolation="monotoneX" />
            <ChartArea data={publicCloudData} interpolation="monotoneX" />
            <ChartArea data={hypervisorData} interpolation="monotoneX" />
          </ChartStack>
          <ChartThreshold data={thresholdData} />
        </Chart>
      )} />
  );
}

export function AnsibleSubscriptionUsageSkeletonChart() {
  const managedNodesData = useMemo(
    () => buildSingleSeries('Managed nodes', 30, 4, 2),
    []
  );
  const infrastructureHoursData = useMemo(
    () => buildSingleSeries('Infrastructure hours', 30, 3, 1),
    []
  );

  return (
    <SubscriptionUsageChartFrame aria-label="Ansible subscription usage chart skeleton" renderChart={(width) => (
        <Chart
          ariaDesc="Ansible subscription usage chart placeholder"
          ariaTitle="Ansible subscription usage"
          height={CHART_HEIGHT}
          width={width}
          maxDomain={{ y: 9 }}
          padding={CHART_PADDING}
          themeColor={ChartThemeColor.gray}
        >
          <ChartAxis />
          <ChartAxis dependentAxis showGrid />
          <ChartGroup>
            <ChartArea data={managedNodesData} interpolation="monotoneX" />
            <ChartArea data={infrastructureHoursData} interpolation="monotoneX" />
          </ChartGroup>
        </Chart>
      )} />
  );
}
