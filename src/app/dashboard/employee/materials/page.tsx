"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BookOpen, ExternalLink, Loader2, FileText, Download, Search, X } from "lucide-react";

interface Material {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  audience: 'all' | 'sales' | 'developer';
}

const CATEGORIES = [
  "All",
  "Strategy",
  "Design Assets",
  "Legal/Templates",
  "Training",
];

const AUDIENCE_OPTIONS = ['All', 'Sales', 'Developer'];

export default function EmployeeMaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeAudience, setActiveAudience] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = createClient();

  useEffect(() => {
    async function fetchUserAndMaterials() {
      setLoading(true);
      setError(null);
      
      try {
        // Get current user role
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) {
          setError('Failed to get user: ' + userError.message);
          return;
        }
        if (!user) return;
        
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          setError('Failed to load profile: ' + profileError.message);
          return;
        }
        
        if (profile?.role) {

          
          // Fetch materials filtered by audience
          const { data, error } = await supabase
            .from('materials')
            .select('*')
            .or(`audience.eq.all,audience.eq.${profile.role}`)
            .order('created_at', { ascending: false });
          
          if (error) {
            setError('Failed to load materials: ' + error.message);
          } else if (data) {
            setMaterials(data);
          }
        }
      } catch (err: unknown) {
        setError('Unexpected error: ' + (err instanceof Error ? err.message : String(err)));
      } finally {
        setLoading(false);
      }
    }
    fetchUserAndMaterials();
  }, [supabase]);



  const filtered = materials.filter((m) => {
    // Category filter
    if (activeCategory !== "All" && m.category !== activeCategory) return false;
    
    // Audience filter
    if (activeAudience !== "All") {
      const audienceLower = activeAudience.toLowerCase();
      if (m.audience !== audienceLower) return false;
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const inTitle = m.title.toLowerCase().includes(query);
      const inDesc = m.description.toLowerCase().includes(query);
      if (!inTitle && !inDesc) return false;
    }
    
    return true;
  });

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-brand-charcoal/10 pb-10">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-gold mb-3">
            Staff Resources
          </p>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-brand-charcoal leading-none">
            Digital
            <br />
            Toolbox.
          </h1>
        </div>
        <div className="max-w-70 text-[11px] text-brand-charcoal/40 font-medium leading-relaxed italic">
          &quot;The right tools aren&apos;t just an advantage; they are the foundation of
          our studio&apos;s craftsmanship.&quot;
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Search & Filters */}
      <div className="space-y-6">
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-charcoal/30" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search materials by title or description..."
            className="w-full bg-white border border-brand-charcoal/10 pl-10 pr-10 py-3 text-sm text-brand-charcoal placeholder:text-brand-charcoal/30 focus:border-brand-gold outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-3.5 h-3.5 text-brand-charcoal/30 hover:text-brand-charcoal transition-colors" />
            </button>
          )}
        </div>

        {/* Audience Filter */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/60 mb-2">Filter by Role</p>
          <div className="flex flex-wrap gap-2">
            {AUDIENCE_OPTIONS.map((aud) => (
              <button
                key={aud}
                onClick={() => setActiveAudience(aud)}
                className={`px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest transition-all ${
                  activeAudience === aud
                    ? "bg-brand-charcoal text-brand-offwhite"
                    : "bg-white border border-brand-charcoal/5 text-brand-charcoal/60 hover:border-brand-gold hover:text-brand-gold"
                }`}
              >
                {aud}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/60 mb-2">Filter by Category</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest transition-all ${
                  activeCategory === cat
                    ? "bg-brand-charcoal text-brand-offwhite"
                    : "bg-white border border-brand-charcoal/5 text-brand-charcoal/60 hover:border-brand-gold hover:text-brand-gold"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-32">
          <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((m) => {
            const isPdf = m.url && m.url.toLowerCase().endsWith(".pdf");
            return (
              <div
                key={m.id}
                className="group relative bg-white border border-brand-charcoal/10 p-10 flex flex-col justify-between hover:border-brand-gold transition-all"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <BookOpen className="w-12 h-12 text-brand-charcoal" />
                </div>

                <div className="relative space-y-6">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-brand-gold mb-2 block">
                      {m.category}
                    </span>
                    <h3 className="text-2xl font-bold text-brand-charcoal tracking-tight leading-tight flex items-center gap-2">
                      {m.title}
                      {isPdf && (
                         <FileText
                           className="w-5 h-5 text-brand-gold"
                           aria-label="PDF"
                         />
                      )}
                    </h3>
                  </div>

                  <p className="text-xs text-brand-charcoal/60 leading-relaxed italic">
                    &quot;
                    {m.description ||
                      "No description provided for this resource."}
                    &quot;
                  </p>
                </div>

                <div className="mt-12 pt-8 border-t border-brand-charcoal/5 flex flex-col gap-2">
                  {isPdf ? (
                    <>
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={m.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-charcoal text-white text-[10px] font-bold uppercase tracking-widest hover:bg-brand-gold transition-all"
                        >
                          View PDF <ExternalLink className="w-4 h-4" />
                        </a>
                         <a
                           href={m.url}
                            download={m.title.replace(/[^a-zA-Z0-9]/g, '_') + '.pdf'}
                            className="inline-flex flex-1 items-center justify-center gap-2 px-6 py-3 bg-brand-offwhite text-brand-charcoal text-[10px] font-bold uppercase tracking-widest border border-brand-charcoal/10 hover:bg-brand-gold hover:text-white hover:border-brand-gold transition-all"
                         >
                           Download <Download className="w-4 h-4" />
                         </a>
                      </div>
                        <div className="border border-brand-charcoal/10 rounded-lg overflow-hidden mt-2">
                          <iframe
                            src={m.url}
                            title={m.title}
                            className="w-full h-60"
                            style={{ border: "none" }}
                          />
                        </div>
                    </>
                  ) : (
                    <a
                      href={m.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 px-8 py-3 bg-brand-charcoal text-white text-[10px] font-bold uppercase tracking-widest hover:bg-brand-gold transition-all"
                    >
                      Access Tool <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="col-span-full py-24 text-center border-2 border-dashed border-brand-charcoal/5 rounded-2xl">
              <p className="text-sm text-brand-charcoal/30 italic">
                 No resources found in the &quot;{activeCategory}&quot; category.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
