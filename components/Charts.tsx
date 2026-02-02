
import React from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, Cell, PieChart, Pie
} from 'recharts';
import { UNIVERSITY_COLORS, COMPETENCY_DEFINITIONS } from '../constants';

const NoData = () => (
  <div className="flex flex-col items-center justify-center h-full text-slate-400 min-h-[200px]">
    <span className="text-4xl mb-2">📊</span>
    <p className="text-sm">분석할 데이터가 없습니다.</p>
  </div>
);

/**
 * 6대 핵심역량 레이더 차트
 * 항목 이름 옆에 (점수)가 자동으로 표시되도록 데이터 매핑 로직 개선
 */
export const CompetencyRadar: React.FC<{ data: Record<string, number>; compareData?: Record<string, number>; name?: string; compareName?: string }> = ({ data, compareData, name = "대상", compareName = "비교" }) => {
  const chartData = COMPETENCY_DEFINITIONS.map(comp => {
    const scoreA = isNaN(data[comp.id]) ? 0 : data[comp.id];
    return {
      // 항목 이름 옆에 점수를 직접 결합하여 표시
      subject: `${comp.name} (${scoreA.toFixed(1)})`,
      originalName: comp.name,
      A: scoreA,
      B: compareData ? (isNaN(compareData[comp.id]) ? 0 : compareData[comp.id]) : undefined,
      fullMark: 100,
    };
  });

  if (chartData.length === 0) return <NoData />;

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fontSize: 13, fontWeight: 700, fill: '#475569' }} 
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]} 
            tick={{ fontSize: 10, fill: '#94a3b8' }} 
            axisLine={false}
          />
          <Radar 
            name={name} 
            dataKey="A" 
            stroke={UNIVERSITY_COLORS.navy} 
            fill={UNIVERSITY_COLORS.navy} 
            fillOpacity={0.5} 
            strokeWidth={3}
          />
          {compareData && (
            <Radar 
              name={compareName} 
              dataKey="B" 
              stroke={UNIVERSITY_COLORS.green} 
              fill={UNIVERSITY_COLORS.green} 
              fillOpacity={0.3} 
              strokeWidth={2}
              strokeDasharray="4 4"
            />
          )}
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
          />
          {compareData && <Legend wrapperStyle={{ paddingTop: '20px' }} />}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const SubCompetencyBar: React.FC<{ data: Record<string, number> }> = ({ data }) => {
  const chartData = COMPETENCY_DEFINITIONS.flatMap(comp => 
    comp.subCompetencies.map(sub => ({
      name: sub.name,
      score: isNaN(data[sub.id]) ? 0 : data[sub.id],
      parent: comp.name
    }))
  ).sort((a, b) => b.score - a.score);

  if (chartData.length === 0) return <NoData />;

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ left: 40, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis type="number" domain={[0, 100]} />
          <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
          <Tooltip cursor={{ fill: '#f1f5f9' }} />
          <Bar dataKey="score" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index < 3 ? UNIVERSITY_COLORS.green : UNIVERSITY_COLORS.navy} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const DistributionChart: React.FC<{ data: Record<string|number, number>, title: string }> = ({ data, title }) => {
  const entries = Object.entries(data);
  const chartData = entries.map(([key, val]) => ({ name: key, value: isNaN(val as number) ? 0 : (val as number) }));

  if (chartData.length === 0) return <NoData />;

  return (
    <div className="w-full h-[250px]">
      <h4 className="text-center font-bold text-slate-500 mb-2 text-xs">{title}</h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill={UNIVERSITY_COLORS.navy} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const GenderPieChart: React.FC<{ data: { male: number; female: number; unknown: number } }> = ({ data }) => {
  const chartData = [
    { name: '남성', value: data.male },
    { name: '여성', value: data.female },
    { name: '기타/미지정', value: data.unknown },
  ].filter(d => d.value > 0);

  if (chartData.length === 0) return <NoData />;

  const COLORS = [UNIVERSITY_COLORS.navy, UNIVERSITY_COLORS.green, '#cbd5e1'];

  return (
    <div className="w-full h-[250px]">
      <h4 className="text-center font-bold text-slate-500 mb-2 text-xs">성별 분포</h4>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
