"use client"
import { DollarSign, Users, Briefcase, FileText, ArrowRight } from 'lucide-react'
import MetricCard from '@/components/dashboard/MetricCard'
import Link from 'next/link'

// Mock Data
export const mockClients = [
  { id: 1, name: 'Aura Cafe', business: 'Hospitality', status: 'active', amount: '₹45,000' },
  { id: 2, name: 'Zenith Fitness', business: 'Health', status: 'lead', amount: '₹15,000' },
  { id: 3, name: 'Luxe Real Estate', business: 'Real Estate', status: 'active', amount: '₹80,000' }
]

export const mockProjects = [
  { id: 1, client: 'Aura Cafe', type: 'Multi-Page Website', status: 'In Progress', progress: 65 },
  { id: 2, client: 'Kolkata Legal', type: 'Landing Page', status: 'Completed', progress: 100 },
]

export default function OwnerDashboard() {
  return (
    <div className="space-y-16 animate-in fade-in duration-700 slide-in-from-bottom-4">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-brand-charcoal/10 pb-10">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-gold mb-3">Executive Summary</p>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-brand-charcoal leading-none">
            Owner<br />
            Overview.
          </h1>
        </div>
        <div className="max-w-[200px] text-[11px] text-brand-charcoal/40 font-medium leading-relaxed italic">
          "Performance is the baseline. Excellence is the goal."
        </div>
      </div>

      {/* Metrics Grid - No gaps between cards for editorial grid look */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-l border-t border-brand-charcoal/10">
        <div className="border-r border-b border-brand-charcoal/10">
          <MetricCard title="Total Revenue" value="₹2.45L" trend="+12.5%" trendUp={true} icon={DollarSign} />
        </div>
        <div className="border-r border-b border-brand-charcoal/10">
          <MetricCard title="Active Clients" value={14} trend="+2" trendUp={true} icon={Users} />
        </div>
        <div className="border-r border-b border-brand-charcoal/10">
          <MetricCard title="Open Deals" value={6} trend="-1" trendUp={false} icon={Briefcase} />
        </div>
        <div className="border-r border-b border-brand-charcoal/10">
          <MetricCard title="Active Projects" value={8} trend="+4" trendUp={true} icon={FileText} />
        </div>
      </div>

      {/* Main Tables Grid */}
      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-16 lg:gap-24">
        
        {/* Recent Clients Section */}
        <div className="space-y-10">
          <div className="flex justify-between items-baseline border-b border-brand-charcoal/10 pb-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-brand-charcoal">Recent Leads & Clients</h2>
            <Link href="/dashboard/owner/clients" className="text-[10px] font-bold text-brand-gold hover:text-brand-charcoal uppercase tracking-widest transition-colors flex items-center gap-1">
              View Database <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="space-y-0 border-t border-brand-charcoal/5">
            {mockClients.map((client) => (
              <div key={client.id} className="grid grid-cols-[2fr_1fr_1fr] items-center py-8 border-b border-brand-charcoal/10 group hover:bg-brand-charcoal/[0.02] transition-colors px-4">
                <div className="flex flex-col gap-1">
                  <span className="text-lg font-bold text-brand-charcoal tracking-tight">{client.name}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40">{client.business}</span>
                </div>
                <div className="flex justify-center">
                  <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 border whitespace-nowrap ${
                    client.status === 'active' ? 'border-brand-gold text-brand-gold' : 'border-brand-charcoal/20 text-brand-charcoal/40'
                  }`}>
                    {client.status}
                  </span>
                </div>
                <div className="text-right font-bold text-brand-charcoal">
                  {client.amount}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Project Pipeline Section */}
        <div className="space-y-10">
          <div className="flex justify-between items-baseline border-b border-brand-charcoal/10 pb-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-brand-charcoal">Project Pipeline</h2>
            <Link href="/dashboard/owner/projects" className="text-[10px] font-bold text-brand-gold hover:text-brand-charcoal uppercase tracking-widest transition-colors">
              Timeline
            </Link>
          </div>
          
          <div className="space-y-12">
            {mockProjects.map(project => (
              <div key={project.id} className="space-y-4 group">
                <div className="flex justify-between items-end">
                  <div>
                    <h4 className="text-xl font-bold text-brand-charcoal tracking-tight leading-none mb-2">{project.client}</h4>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40">{project.type}</p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${project.status === 'Completed' ? 'text-brand-sage' : 'text-brand-gold'}`}>
                    {project.status}
                  </span>
                </div>
                {/* Slim Editorial Progress Bar */}
                <div className="relative w-full h-px bg-brand-charcoal/10">
                  <div 
                    className="absolute top-0 left-0 h-px bg-brand-gold transition-all duration-1000" 
                    style={{ width: `${project.progress}%` }}
                  ></div>
                  <div 
                    className="absolute -top-1 w-2 h-2 rounded-full bg-brand-gold transition-all duration-1000 border-2 border-brand-offwhite"
                    style={{ left: `${project.progress}%`, marginLeft: '-4px' }}
                  ></div>
                </div>
                <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-brand-charcoal/30 group-hover:text-brand-charcoal/50 transition-colors">
                    <span>Performance</span>
                    <span>{project.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
