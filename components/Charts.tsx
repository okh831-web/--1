
import React from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, Cell, PieChart, Pie, LabelList
} from 'recharts';
import { UNIVERSITY_COLORS, COMPETENCY_DEFINITIONS } from '../constants';

const NoData = ({ message = "분석할 데이터가 부족합니다." }) => (
  <div className="flex flex-col items-center justify-center h-full text-slate-400 min-h-[250px] bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100">
    <span className="text-4xl mb-3">📊</span>
    <p className="text-sm font-bold">{message}</p>
    <p className="text-[10px] mt-1 opacity-60 text-center px-4">엑셀 파일의 성별/역량 컬럼을 확인해주세요.</p>
  </div>
);

export const CompetencyRadar: React.FC<{ data: Record<string, number>; compareData?: Record<string, number>; name?: string; compareName?: string }> = ({ data, compareData, name = "대상", compareName = "비교" }) => {
  if (!data || Object.keys(data).length === 0) return <NoData />;

  const chartData = COMPETENCY_DEFINITIONS.map(comp => {
    const scoreA = isNaN(data[comp.id]) ? 0 : data[comp.id];
    return {
      subject: `${comp.name}\n(${scoreA.toFixed(1)})`,
      originalName: comp.name,
      A: scoreA,
      B: compareData ? (isNaN(compareData[comp.id]) ? 0 : compareData[comp.id]) : undefined,
    };
  });

  const allScores = [...(Object.values(data) as number[]), ...(compareData ? (Object.values(compareData) as number[]) : [])]
    .filter(v => !isNaN(v) && v > 0);
  const minVal = allScores.length > 0 ? Math.min(...(allScores as number[])) : 0;
  const dynamicDomainMin = Math.max(0, Math.floor(minVal / 10) * 10 - 20);

  return (
    <div className="w-full h-[450px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
          <PolarGrid stroke="#f1f5f9" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fontSize: 13, fontWeight: 800, fill: '#1e293b' }} 
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[dynamicDomainMin, 100]} 
            tick={{ fontSize: 10, fill: '#cbd5e1' }} 
            axisLine={false}
            tickCount={5}
          />
          {compareData && (
            <Radar 
              name={compareName} 
              dataKey="B" 
              stroke="#f97316" 
              fill="#f97316" 
              fillOpacity={0.15} 
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          )}
          <Radar 
            name={name} 
            dataKey="A" 
            stroke="#2563eb" 
            fill="#2563eb" 
            fillOpacity={0.4} 
            strokeWidth={4}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            wrapperStyle={{ paddingTop: '30px' }}
            formatter={(value) => <span className="text-sm font-black text-slate-700">{value}</span>}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const GenderScoreCompareBar: React.FC<{ maleScores: Record<string, number>; femaleScores: Record<string, number> }> = ({ maleScores, femaleScores }) => {
  const isMaleEmpty = !maleScores || Object.values(maleScores).every(v => v === 0);
  const isFemaleEmpty = !femaleScores || Object.values(femaleScores).every(v => v === 0);
  
  if (isMaleEmpty && isFemaleEmpty) return <NoData message="성별 역량 데이터가 없습니다." />;

  const chartData = COMPETENCY_DEFINITIONS.map(comp => ({
    name: comp.name,
    남성: maleScores[comp.id] || 0,
    여성: femaleScores[comp.id] || 0,
  }));

  return (
    <div className="w-full h-[350px]">
      <h4 className="text-center font-bold text-slate-500 mb-4 text-xs tracking-widest uppercase">성별 역량 격차 분석</h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700 }} axisLine={false} />
          <YAxis domain={[0, 100]} hide />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend verticalAlign="top" align="right" />
          <Bar dataKey="남성" fill="#1e40af" radius={[4, 4, 0, 0]} barSize={20}>
            <LabelList dataKey="남성" position="top" style={{ fontSize: '10px', fontWeight: '800' }} />
          </Bar>
          <Bar dataKey="여성" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20}>
            <LabelList dataKey="여성" position="top" style={{ fontSize: '10px', fontWeight: '800' }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const SubCompetencyBar: React.FC<{ data: Record<string, number> }> = ({ data }) => {
  if (!data || Object.keys(data).length === 0) return <NoData />;
  
  const chartData = COMPETENCY_DEFINITIONS.flatMap(comp => 
    comp.subCompetencies.map(sub => ({
      name: sub.name,
      score: isNaN(data[sub.id]) ? 0 : data[sub.id],
      parent: comp.name
    }))
  ).sort((a, b) => b.score - a.score);

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ left: 40, right: 40 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f8fafc" />
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fontWeight: 600 }} axisLine={false} />
          <Tooltip cursor={{ fill: '#f1f5f9' }} />
          <Bar dataKey="score" radius={[0, 10, 10, 0]} barSize={20}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index < 3 ? '#10b981' : '#1e40af'} />
            ))}
            <LabelList dataKey="score" position="right" style={{ fontSize: '11px', fontWeight: '800', fill: '#475569' }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const DistributionChart: React.FC<{ data: Record<string|number, number>, title: string }> = ({ data, title }) => {
  const totalValue = (Object.values(data) as number[]).reduce((acc: number, curr: number) => acc + (isNaN(curr) ? 0 : curr), 0);
  if (totalValue === 0) return <NoData message={`${title} 데이터가 없습니다.`} />;

  const chartData = [
    { name: '총계', value: totalValue, isTotal: true },
    ...Object.entries(data).map(([key, val]) => ({ 
      name: `${key}학년`, 
      value: isNaN(val as number) ? 0 : (val as number),
      isTotal: false
    }))
  ];

  return (
    <div className="w-full h-[250px]">
      <h4 className="text-center font-bold text-slate-500 mb-4 text-xs tracking-widest uppercase">{title}</h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 25, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700 }} axisLine={false} />
          <YAxis hide />
          <Tooltip cursor={{ fill: '#f8fafc' }} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={35}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.isTotal ? '#10b981' : '#1e40af'} />
            ))}
            <LabelList dataKey="value" position="top" formatter={(val: number) => `${val}명`} style={{ fontSize: '10px', fontWeight: '900' }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const GenderPieChart: React.FC<{ data: { male: number; female: number; unknown: number } }> = ({ data }) => {
  const chartData = [
    { name: '남성', value: data.male },
    { name: '여성', value: data.female },
    { name: '미분류', value: data.unknown },
  ].filter(d => d.value > 0);

  if (chartData.length === 0) return <NoData message="성별 통계가 없습니다." />;

  const COLORS = ['#1e40af', '#10b981', '#94a3b8'];

  return (
    <div className="w-full h-[280px]">
      <h4 className="text-center font-bold text-slate-500 mb-2 text-xs tracking-widest uppercase">참여자 성별 구성</h4>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={85}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
            <LabelList dataKey="value" position="outside" offset={15} formatter={(val: number) => `${val}명`} style={{ fontSize: '11px', fontWeight: '800' }} />
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
