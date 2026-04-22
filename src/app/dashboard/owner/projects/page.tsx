"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Plus,
  Briefcase,
  CheckSquare,
  Clock,
  ArrowUpRight,
  Loader2,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserProfile {
  name: string;
  phone: string;
  email: string;
}

interface Gig {
  id: string;
  client_id: string;
  service_type: string;
  total_amount: number;
  status: string;
  deadline: string;
  clients: { name: string; business: string };
  sales?: UserProfile;
  developer?: UserProfile;
}

interface Client {
  id: string;
  name: string;
  business: string;
}

const STATUSES = ["lead", "confirmed", "in_progress", "completed"] as const;
const SERVICE_TYPES = ["landing", "multipage", "custom"] as const;

export default function GigsPage() {
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [editGig, setEditGig] = useState<Gig | null>(null);
  const [deleteGig, setDeleteGig] = useState<Gig | null>(null);
  const [statusLoading, setStatusLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({ total_amount: 0, deadline: "", status: "", service_type: "", client_id: "" });
  const supabase = createClient();
  const router = useRouter();

  const fetchGigs = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("gigs")
      .select(
        `*, clients (name, business), sales:users!sales_id (name, phone, email), developer:users!developer_id (name, phone, email)`,
      )
      .order("created_at", { ascending: false });
    if (error) console.error("Fetch gigs error:", error);
    if (data) setGigs(data as Gig[]);
    setLoading(false);
  }, [supabase]);

  const fetchClients = useCallback(async () => {
    const { data } = await supabase
      .from("clients")
      .select("id, name, business")
      .in("status", ["active", "lead"]);
    if (data) setClients(data);
  }, [supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchGigs();
    fetchClients();
  }, [fetchGigs, fetchClients]);

  const filteredGigs =
    filter === "all" ? gigs : gigs.filter((g) => g.status === filter);

  const openEditModal = (gig: Gig) => {
    setEditForm({
      total_amount: gig.total_amount,
      deadline: gig.deadline?.slice(0, 10) || "",
      status: gig.status,
      service_type: gig.service_type,
      client_id: gig.client_id,
    });
    setEditGig(gig);
    setActionError(null);
  };

  const handleEditGig = async () => {
    if (!editGig) return;
    setSaving(true);
    setActionError(null);
    try {
      const { error } = await supabase
        .from("gigs")
        .update({
          total_amount: editForm.total_amount,
          deadline: editForm.deadline || null,
          status: editForm.status,
          service_type: editForm.service_type,
          client_id: editForm.client_id,
        })
        .eq("id", editGig.id);
      if (error) throw error;
      setEditGig(null);
      fetchGigs();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to update gig");
    }
    setSaving(false);
  };

  const handleDeleteGig = async () => {
    if (!deleteGig) return;
    setSaving(true);
    setActionError(null);
    try {
      const { error } = await supabase
        .from("gigs")
        .delete()
        .eq("id", deleteGig.id);
      if (error) throw error;
      setDeleteGig(null);
      fetchGigs();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to delete gig");
    }
    setSaving(false);
  };

  const handleStatusUpdate = async (gig: Gig, newStatus: string) => {
    setStatusLoading(gig.id);
    setActionError(null);
    try {
      const { error } = await supabase
        .from("gigs")
        .update({ status: newStatus })
        .eq("id", gig.id);
      if (error) throw error;
      fetchGigs();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to update status");
    }
    setStatusLoading(null);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-brand-charcoal/10 pb-10">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-gold mb-3">
            Operations
          </p>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-brand-charcoal leading-none">
            Gig
            <br />
            Manager.
          </h1>
        </div>
        <Link
          href="/dashboard/owner/projects/new"
          className="w-full md:w-auto text-center flex items-center justify-center gap-3 bg-brand-charcoal text-brand-offwhite px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-brand-gold transition-all shadow-xl shadow-brand-charcoal/10"
        >
          <Plus className="w-4 h-4" /> Initialize New Gig
        </Link>
      </div>

      {/* Grid Tabs */}
      <div className="flex gap-1 border-b border-brand-charcoal/10 pb-px overflow-x-auto no-scrollbar">
        {["all", ...STATUSES].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-4 text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
              filter === f
                ? "bg-brand-charcoal text-brand-offwhite"
                : "text-brand-charcoal/40 hover:text-brand-charcoal"
            }`}
          >
            {f.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Main List */}
      <div className="grid gap-6 bg-transparent">
        {loading ? (
          <div className="p-20 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
          </div>
        ) : filteredGigs.length > 0 ? (
          <div className="grid gap-8">
            {filteredGigs.map((gig) => (
              <div
                key={gig.id}
                className="bg-white border border-brand-charcoal/10 p-6 md:p-10 group hover:border-brand-gold transition-all relative"
              >
                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                  <button
                    title="Edit"
                    onClick={() => openEditModal(gig)}
                    className="p-2 rounded-full hover:bg-brand-gold/10"
                  >
                    <Edit className="w-4 h-4 text-brand-charcoal" />
                  </button>
                  <button
                    title="Delete"
                    onClick={() => setDeleteGig(gig)}
                    className="p-2 rounded-full hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
                <div className="grid lg:grid-cols-[1.5fr_1fr_1fr_1fr] gap-10 items-start">
                  {/* Service & Client */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-brand-gold">
                      <Briefcase className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.3em]">
                        {gig.service_type}
                      </span>
                    </div>
                    <h3 className="text-3xl font-bold tracking-tighter text-brand-charcoal group-hover:text-brand-gold transition-colors leading-tight">
                      {gig.clients.name}
                    </h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/30">
                      {gig.clients.business}
                    </p>
                  </div>
                  {/* Team Squad */}
                  <div className="space-y-4 border-l border-brand-charcoal/5 pl-6 lg:pl-10">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-brand-charcoal/30 block mb-4">
                      Project Squad
                    </span>
                    <div className="space-y-6">
                      {gig.sales && (
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-brand-charcoal">
                            {gig.sales.name}{" "}
                            <span className="text-brand-gold font-medium ml-1">
                              (Sales)
                            </span>
                          </p>
                          <div className="flex gap-3 mt-2">
                            <a
                              href={`tel:${gig.sales.phone}`}
                              className="text-[9px] font-bold uppercase tracking-widest text-brand-charcoal/40 hover:text-brand-gold"
                            >
                              Call
                            </a>
                            <a
                              href={`mailto:${gig.sales.email}`}
                              className="text-[9px] font-bold uppercase tracking-widest text-brand-charcoal/40 hover:text-brand-gold"
                            >
                              Email
                            </a>
                          </div>
                        </div>
                      )}
                      {gig.developer && (
                        <div className="space-y-1 pt-2 border-t border-brand-charcoal/5">
                          <p className="text-[10px] font-bold text-brand-charcoal">
                            {gig.developer.name}{" "}
                            <span className="text-brand-gold font-medium ml-1">
                              (Dev)
                            </span>
                          </p>
                          <div className="flex gap-3 mt-2">
                            <a
                              href={`tel:${gig.developer.phone}`}
                              className="text-[9px] font-bold uppercase tracking-widest text-brand-charcoal/40 hover:text-brand-gold"
                            >
                              Call
                            </a>
                            <a
                              href={`mailto:${gig.developer.email}`}
                              className="text-[9px] font-bold uppercase tracking-widest text-brand-charcoal/40 hover:text-brand-gold"
                            >
                              Email
                            </a>
                          </div>
                        </div>
                      )}
                      {!gig.sales && !gig.developer && (
                        <p className="text-[10px] italic text-brand-charcoal/30 uppercase tracking-widest">
                          Team not assigned
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Finance & Deadline */}
                  <div className="space-y-6 lg:border-l border-brand-charcoal/5 lg:pl-10">
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-brand-charcoal/30 mb-2 block">
                        Deal Value
                      </span>
                      <p className="text-xl font-bold text-brand-charcoal tabular-nums">
                        ₹{gig.total_amount.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/60">
                      <Clock className="w-3.5 h-3.5 text-brand-gold" />
                      {gig.deadline
                        ? new Date(gig.deadline).toLocaleDateString("en-IN", {
                            month: "short",
                            year: "numeric",
                          })
                        : "Flexible"}
                    </div>
                  </div>
                  {/* Status & Action */}
                  <div className="flex flex-col gap-8 justify-between lg:items-end">
                    <div className="flex flex-col gap-3">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-brand-charcoal/30 mb-2 block">
                        Current Phase
                      </span>
                      <div
                        className={`text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-2 border w-fit ${
                          gig.status === "completed"
                            ? "bg-brand-sage/10 border-brand-sage text-brand-sage"
                            : gig.status === "in_progress"
                              ? "bg-brand-gold/5 border-brand-gold text-brand-gold"
                              : gig.status === "confirmed"
                                ? "bg-blue-50 border-blue-300 text-blue-600"
                                : "border-brand-charcoal/20 text-brand-charcoal/30"
                        }`}
                      >
                        {gig.status.replace("_", " ")}
                      </div>

                      {/* Status update actions */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {statusLoading === gig.id ? (
                          <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-brand-gold px-3 py-1">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Updating...
                          </div>
                        ) : gig.status === "completed" ? (
                          <button
                            onClick={() => handleStatusUpdate(gig, "in_progress")}
                            className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 transition-colors flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" /> Reopen
                          </button>
                        ) : (
                          <>
                            {gig.status !== "in_progress" && (
                              <button
                                onClick={() => handleStatusUpdate(gig, "in_progress")}
                                className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 bg-brand-gold/10 text-brand-gold border border-brand-gold/30 hover:bg-brand-gold/20 transition-colors flex items-center gap-1"
                              >
                                <ArrowUpRight className="w-3 h-3" /> In Progress
                              </button>
                            )}
                            <button
                              onClick={() => handleStatusUpdate(gig, "completed")}
                              className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 bg-brand-sage/10 text-brand-sage border border-brand-sage/30 hover:bg-brand-sage/20 transition-colors flex items-center gap-1"
                            >
                              <CheckCircle className="w-3 h-3" /> Mark Complete
                            </button>
                          </>
                        )}
                      </div>

                      {actionError && (
                        <div className="text-[9px] text-red-500 font-medium mt-1 flex items-center gap-1">
                          <XCircle className="w-3 h-3 shrink-0" />
                          {actionError}
                        </div>
                      )}
                    </div>
                    <button
                      className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-charcoal hover:text-brand-gold transition-colors"
                      onClick={() =>
                        router.push(`/dashboard/owner/projects/${gig.id}`)
                      }
                    >
                      Project Workspace <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-40 border-2 border-dashed border-brand-charcoal/5">
            <CheckSquare className="w-12 h-12 text-brand-charcoal/5 mx-auto mb-6" />
            <p className="text-sm text-brand-charcoal/30 italic">
              No active gigs in this category.
            </p>
            <Link
              href="/dashboard/owner/projects/new"
              className="text-xs font-bold uppercase tracking-widest text-brand-gold hover:underline mt-4 inline-block"
            >
              Create First Gig
            </Link>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editGig && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-brand-offwhite p-10 shadow-2xl w-full max-w-lg border border-brand-charcoal/10 relative">
            <button
              className="absolute top-4 right-4 text-brand-charcoal/40 hover:text-brand-charcoal"
              onClick={() => setEditGig(null)}
            >
              <XCircle className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-bold tracking-tighter text-brand-charcoal mb-8">
              Edit Gig.
            </h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/60">
                  Client
                </label>
                <select
                  value={editForm.client_id}
                  onChange={(e) => setEditForm({...editForm, client_id: e.target.value})}
                  className="w-full bg-white border border-brand-charcoal/10 px-4 py-3 text-sm focus:border-brand-gold outline-none transition-colors"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} — {c.business}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/60">
                  Service Type
                </label>
                <select
                  value={editForm.service_type}
                  onChange={(e) => setEditForm({...editForm, service_type: e.target.value})}
                  className="w-full bg-white border border-brand-charcoal/10 px-4 py-3 text-sm focus:border-brand-gold outline-none transition-colors"
                >
                  {SERVICE_TYPES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/60">
                  Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                  className="w-full bg-white border border-brand-charcoal/10 px-4 py-3 text-sm focus:border-brand-gold outline-none transition-colors"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s.replace("_", " ")}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/60">
                  Deal Value (₹)
                </label>
                <input
                  type="number"
                  value={editForm.total_amount}
                  onChange={(e) => setEditForm({...editForm, total_amount: Number(e.target.value)})}
                  className="w-full bg-white border border-brand-charcoal/10 px-4 py-3 text-sm focus:border-brand-gold outline-none transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/60">
                  Deadline
                </label>
                <input
                  type="date"
                  value={editForm.deadline}
                  onChange={(e) => setEditForm({...editForm, deadline: e.target.value})}
                  className="w-full bg-white border border-brand-charcoal/10 px-4 py-3 text-sm focus:border-brand-gold outline-none transition-colors"
                />
              </div>

              {actionError && (
                <div className="text-xs text-red-500 flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> {actionError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  disabled={saving}
                  onClick={handleEditGig}
                  className="flex-1 py-4 bg-brand-gold text-brand-offwhite text-[11px] font-bold uppercase tracking-widest hover:bg-brand-charcoal transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Save Changes"}
                </button>
                <button
                  onClick={() => setEditGig(null)}
                  className="px-8 py-4 border border-brand-charcoal/10 text-[11px] font-bold uppercase tracking-widest text-brand-charcoal/60 hover:text-brand-charcoal transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteGig && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-brand-offwhite p-10 shadow-2xl w-full max-w-md border border-brand-charcoal/10 relative">
            <button
              className="absolute top-4 right-4 text-brand-charcoal/40 hover:text-brand-charcoal"
              onClick={() => setDeleteGig(null)}
            >
              <XCircle className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-bold tracking-tighter text-brand-charcoal mb-4">
              Delete Gig.
            </h3>
            <p className="text-sm text-brand-charcoal/60 mb-8">
              Are you sure you want to delete{" "}
              <span className="font-bold text-brand-charcoal">{deleteGig.clients.name}</span>&apos;s gig?
              This action cannot be undone.
            </p>
            {actionError && (
              <div className="text-xs text-red-500 flex items-center gap-1 mb-4">
                <XCircle className="w-3 h-3" /> {actionError}
              </div>
            )}
            <div className="flex gap-3">
              <button
                disabled={saving}
                onClick={handleDeleteGig}
                className="flex-1 py-4 bg-red-500 text-white text-[11px] font-bold uppercase tracking-widest hover:bg-red-600 transition-all disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Delete"}
              </button>
              <button
                onClick={() => setDeleteGig(null)}
                className="px-8 py-4 border border-brand-charcoal/10 text-[11px] font-bold uppercase tracking-widest text-brand-charcoal/60 hover:text-brand-charcoal transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
