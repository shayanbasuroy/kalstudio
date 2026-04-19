import { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  trend: string
  trendUp: boolean
  icon: LucideIcon
}

export default function MetricCard({ title, value, trend, trendUp, icon: Icon }: MetricCardProps) {
  return (
    <div className="bg-white p-8 border border-brand-charcoal/10 flex flex-col justify-between group hover:border-brand-gold transition-colors">
      <div className="flex justify-between items-start mb-10">
        <div className="p-3 bg-brand-offwhite border border-brand-charcoal/5">
          <Icon className="w-5 h-5 text-brand-charcoal opacity-70 group-hover:text-brand-gold group-hover:opacity-100 transition-all" />
        </div>
        <div className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 ${
          trendUp ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'
        }`}>
          {trend}
        </div>
      </div>
      
      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-charcoal/40 mb-2">
          {title}
        </h3>
        <p className="text-4xl font-bold text-brand-charcoal tracking-tighter leading-none">
          {value}
        </p>
      </div>
    </div>
  )
}
