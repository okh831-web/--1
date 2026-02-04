
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
    <p className="text-[10px] mt-1 opacity-60 text-center px-4">엑셀 파일의 관련 컬럼을 확인해주세요.</p>
  </div>
);

export const CompetencyRadar: React.FC<{ data: Record<string, number>; compareData?: Record<string, number>; name?: string; compareName?: string }> = ({ data, compareData, name = "대상", compareName = "비교" }) => {
  if (!data || Object.keys(data).length === 0) return <NoData />;

  const chartData = COMPETENCY_DEFINITIONS.map(comp => ({
    subject: comp.name,
    A: data[comp.id] || 0,
    B: compareData ? (compareData[comp.id] || 0) : undefined,
  }));

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
          <PolarGrid stroke="#f1f5f9" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fontWeight: 700, fill: '#475569' }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} hide />
          {compareData && (
            <Radar name={compareName} dataKey="B" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.1} strokeWidth={1} strokeDasharray="4 4" />
          )}
          <Radar name={name} dataKey="A" stroke="#2563eb" fill="#2563eb" fillOpacity={0.4} strokeWidth={3} />
          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
          <Legend verticalAlign="bottom" align="center" />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const AdmissionScoreChart: React.FC<{ data?: Record<string, Record<string, number>> }> = ({ data }) => {
  if (!data || Object.keys(data).length === 0) return <NoData message="모집전형별 데이터가 없습니다." />;

  const types = Object.keys(data).slice(0, 3); // 상위 3개만 비교
  const COLORS = ['#2563eb', '#10b981', '#f59e0b'];

  const chartData = COMPETENCY_DEFINITIONS.map(comp => {
    const entry: any = { subject: comp.name };
    types.forEach(type => {
      entry[type] = data[type][comp.id] || 0;
    });
    return entry;
  });

  return (
    <div className="w-full h-[320px]">
      <h4 className="text-center font-bold text-slate-500 mb-2 text-xs tracking-widest uppercase">모집전형별 역량 지수</h4>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="45%" outerRadius="60%" data={chartData}>
          <PolarGrid stroke="#f1f5f9" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} />
          <PolarRadiusAxis domain={[0, 100]} hide />
          {types.map((type, idx) => (
            <Radar key={type} name={type} dataKey={type} stroke={COLORS[idx]} fill={COLORS[idx]} fillOpacity={0.2} strokeWidth={2} />
          ))}
          <Tooltip />
          <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: '700' }} />
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
      <h4 className="text-center font-bold text-slate-500 mb-6 text-xs tracking-widest uppercase">성별 역량 격차 분석</h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700 }} axisLine={false} interval={0} height={50} />
          <YAxis domain={[0, 105]} hide />
          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
          <Legend verticalAlign="top" align="right" />
          <Bar dataKey="남성" fill="#1e40af" radius={[4, 4, 0, 0]} barSize={16}>
            <LabelList dataKey="남성" position="top" style={{ fontSize: '9px', fontWeight: '800' }} />
          </Bar>
          <Bar dataKey="여성" fill="#10b981" radius={[4, 4, 0, 0]} barSize={16}>
            <LabelList dataKey="여성" position="top" style={{ fontSize: '9px', fontWeight: '800' }} />
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
      score: data[sub.id] || 0,
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
  const totalValue = Object.values(data).reduce((acc: number, curr: any) => acc + (isNaN(curr) ? 0 : curr), 0);
  if (totalValue === 0) return <NoData message={`${title} 데이터가 없습니다.`} />;

  const chartData = [
    { name: '총계', value: totalValue, isTotal: true },
    ...Object.entries(data).map(([key, val]) => ({ 
      name: isNaN(Number(key)) ? key : `${key}학년`, 
      value: val as number,
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
          <Pie data={chartData} cx="50%" cy="45%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value" stroke="none">
            {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
            <LabelList dataKey="value" position="outside" offset={15} formatter={(val: number) => `${val}명`} style={{ fontSize: '11px', fontWeight: '800' }} />
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
