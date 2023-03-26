import { useLayoutEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  ComposedChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { ScenarioValue } from '../../../data/scenario';
import { CustomTooltip } from '../../CustomTooltip';
import { isFullOpacity, isHovered, isSelected } from '../../chart-utils';
import { CustomLegend } from '../../legend/CustomLegend';
import { DataSeries } from '../../types';

export interface YearScenarioValue {
  Year: number;
  Scenario: string;
  Value: number;
}

export type ScenarioDataSeries = DataSeries<YearScenarioValue>;

function yearScen(yr: number, scen: string) {
  return `${yr}-${scen}`;
}

function processData(
  groups: ScenarioDataSeries[],
  scenarios: ScenarioValue[],
  years: number[]
) {
  const [minYear, ...snapshotYears] = years;
  const firstScenario = scenarios[0];

  const scenarioYears: [number, string][] = [[minYear, firstScenario.NA]];
  for (const scen of scenarios) {
    // push a separator
    // scenarioYears.push([0, '']);

    for (const yr of snapshotYears) {
      scenarioYears.push([yr, scen.NA]);
    }
  }

  const gKeys: string[] = [];
  const gLookups: Record<string, Map<string, number>> = {};

  for (const g of groups) {
    const lookup: Map<string, number> = (gLookups[g.GroupKey] = new Map());
    gKeys.push(g.GroupKey);

    for (const row of g.Rows) {
      const yr = row.Year;
      const scenario = row.Scenario;

      lookup.set(yearScen(yr, scenario), row.Value);
    }
  }

  const data: any[] = [];

  for (const [yr, scen] of scenarioYears) {
    const scenLabel = yr === minYear ? 'Baseline' : scen;
    const obj: any = {
      Year: yr,
      Scenario: scenLabel,
      ScenarioYear: `${scenLabel}-${yr}`,
    };

    for (const key of gKeys) {
      obj[key] = gLookups[key].get(yearScen(yr, scen)) ?? 0;
    }

    data.push(obj);
  }

  return data;
}

export interface ScenarioComparisonChartProps {
  groups: ScenarioDataSeries[];
  groupStyleMapping: (g: ScenarioDataSeries) => any;
  scenarios: ScenarioValue[];
  years: number[];
}

export const ScenarioComparisonChart = ({
  groups,
  groupStyleMapping,
  scenarios,
  years,
}: ScenarioComparisonChartProps) => {
  const legendKeys = useMemo(() => groups.map((x) => x.GroupKey), [groups]);
  const data = useMemo(() => processData(groups, scenarios, years), [groups]);

  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  useLayoutEffect(() => {
    if (selectedKey && !legendKeys.includes(selectedKey)) {
      setSelectedKey(null);
    }
  }, [selectedKey, legendKeys, setSelectedKey]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <XAxis
          type="category"
          dataKey="Year"
          allowDuplicatedCategory={true}
          tickLine={false}
          tickFormatter={(yr) => (yr === 0 ? '' : yr)}
        />
        <XAxis
          type="category"
          dataKey="Scenario"
          axisLine={false}
          tickLine={false}
          allowDuplicatedCategory={true}
          height={20}
          // scale="band"
          xAxisId="scenario"
        />
        <YAxis
          width={120}
          axisLine={false}
          tickFormatter={(x: number) =>
            x.toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })
          }
        />
        <Tooltip content={<CustomTooltip />} cursor={false} />

        {groups.map((group) => {
          const gkey = group.GroupKey;
          const hovered = isHovered(gkey, hoveredKey);
          const selected = isSelected(gkey, selectedKey);

          const isOpaque = isFullOpacity(hovered, selected);

          const fullOpacity = 0.9;
          const inactiveOpacity = 0.3;

          const style = groupStyleMapping(group);

          return (
            <Bar
              key={group.GroupKey}
              dataKey={group.GroupKey}
              stackId="groups"
              name={group.GroupLabel}
              barSize={70}
              fillOpacity={isOpaque ? fullOpacity : inactiveOpacity}
              strokeOpacity={isOpaque ? fullOpacity : 0.5}
              strokeWidth={isOpaque ? 2 : 0}
              isAnimationActive={false}
              legendType="rect"
              {...style}
            />
          );
        })}

        <Legend
          wrapperStyle={{
            width: '250px',
            padding: '1em',
            minHeight: '90%', // magic number - 10% matches 30px x axis height
            maxHeight: '90%',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            justifyContent: 'stretch',
            border: '1px solid #ddd',
          }}
          align="right"
          verticalAlign="top"
          layout="vertical"
          content={
            <CustomLegend
              hoveredKey={hoveredKey}
              setHoveredKey={setHoveredKey}
              selectedKey={selectedKey}
              setSelectedKey={setSelectedKey}
              payload={{} as any}
            />
          }
        />
      </BarChart>
    </ResponsiveContainer>
  );
};