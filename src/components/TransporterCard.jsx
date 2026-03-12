import { ShieldCheck, MapPin, DollarSign, TrendingUp } from 'lucide-react';

export default function TransporterCard({ name, laneExpertise, reliabilityScore, lastOfferedRate }) {
  // Simple logic to add a color code based on reliability score
  const isHighReliability = reliabilityScore >= 95;
  
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden group">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
            {name}
          </h3>
          <div className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-full ${isHighReliability ? 'bg-brand-50 text-brand-700' : 'bg-amber-50 text-amber-700'}`}>
            <ShieldCheck size={16} />
            {reliabilityScore}% Score
          </div>
        </div>
        
        <div className="space-y-3 mt-4 text-slate-600">
          <div className="flex items-center gap-3">
            <div className="bg-slate-50 p-2 rounded-lg text-slate-400">
              <MapPin size={16} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Lane Expertise</p>
              <p className="font-medium text-slate-800">{laneExpertise}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-slate-50 p-2 rounded-lg text-slate-400">
              <TrendingUp size={16} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Historical Performance</p>
              <p className="font-medium text-slate-800">Excellent track record</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-slate-50 border-t border-slate-100 p-4 flex items-center justify-between">
        <div className="flex items-center gap-1 text-brand-600">
          <DollarSign size={20} />
          <span className="font-bold text-lg">{lastOfferedRate}</span>
          <span className="text-sm text-slate-500 font-normal">/ trip</span>
        </div>
        <button className="text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 px-4 py-2 rounded-lg transition-colors shadow-sm shadow-brand-500/20">
          Accept Rate
        </button>
      </div>
    </div>
  );
}
