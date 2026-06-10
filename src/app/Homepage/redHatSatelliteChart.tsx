import * as React from 'react';
import { useMemo, useRef } from 'react';
import { useDeferredResizeObserverWidth } from '@app/useDeferredResizeObserver';
import {
  ChartDonutThreshold,
  ChartDonutUtilization
} from '@patternfly/react-charts/dist/esm/components/ChartDonutUtilization';
import { ChartThemeColor } from '@patternfly/react-charts';

const CHART_PADDING = 12;
const CHART_MAX_SIZE = 240;
const CHART_MIN_SIZE = 176;

/** Outer threshold ring segments (three satellite instances). */
const SATELLITE_THRESHOLD_DATA = [
  { x: 'Satellite instance 1', y: 33.33 },
  { x: 'Satellite instance 2', y: 33.33 },
  { x: 'Satellite instance 3', y: 33.34 }
] as const;

function useSatelliteChartSize() {
  const containerRef = useRef<HTMLDivElement>(null);
  const width = useDeferredResizeObserverWidth(() => containerRef.current, []);

  const chartSize = useMemo(() => {
    if (width <= 0) {
      return 0;
    }

    return Math.max(CHART_MIN_SIZE, Math.min(CHART_MAX_SIZE, width));
  }, [width]);

  return { containerRef, chartSize };
}

export function RedHatSatelliteSystemsChart({ connectedPercent }: { connectedPercent: number }) {
  const { containerRef, chartSize } = useSatelliteChartSize();

  return (
    <div ref={containerRef} className="red-hat-satellite-widget__chart-frame">
      {chartSize > 0 ? (
        <div
          className="red-hat-satellite-widget__chart-shell"
          style={{ width: chartSize, height: chartSize }}
          role="img"
          aria-label={`${connectedPercent} percent of systems are connected`}
        >
          <ChartDonutThreshold
            allowTooltip={false}
            ariaDesc={`${connectedPercent} percent of systems are connected to Red Hat Satellite`}
            ariaTitle="Systems connected"
            constrainToVisibleArea
            data={[...SATELLITE_THRESHOLD_DATA]}
            height={chartSize}
            width={chartSize}
            labels={() => null}
            padAngle={1}
            padding={{
              bottom: CHART_PADDING,
              left: CHART_PADDING,
              right: CHART_PADDING,
              top: CHART_PADDING
            }}
            themeColor={ChartThemeColor.multiUnordered}
          >
            <ChartDonutUtilization
              allowTooltip={false}
              data={{ x: 'Connected systems', y: connectedPercent }}
              labels={() => null}
              showStatic
              themeColor={ChartThemeColor.blue}
            />
          </ChartDonutThreshold>

          <div className="red-hat-satellite-widget__chart-center" aria-hidden>
            <span className="red-hat-satellite-widget__chart-percent">{connectedPercent}%</span>
            <span className="red-hat-satellite-widget__chart-caption">of systems are connected</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
