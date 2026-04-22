"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Briefcase, Calendar, DollarSign, Users, Loader2, CheckCircle, Clock, XCircle, MessageSquare, Send, User } from "lucide-react";
import Link from "next/link";

interface GigDetails {
  id: string;
  client_id: string;
  sales_id: string;
  developer_id: string;
  service_type: string;
  total_amount: number;
  status: string;
  deadline: string;
  clients: { name: string; business: string };
  sales?: { name: string; email: string; phone: string };
  developer?: { name: string; email: string; phone: string };
  payments?: { amount_received: number; received_at: string }[];
  payouts?: { amount: number; is_paid: boolean; users: { name: string } }[];
}

interface Comment {
  id: string;
  gig_id: string;
  user_id: string;
  content: string;
  created_at: string;
  users: { name: string };
}

export default function ProjectWorkspacePage() {
  const { id } = useParams();
  const [gig, setGig] = useState<GigDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [newStatus, setNewStatus] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState("");
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function fetchGig() {
      if (!id) return;
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        const { data: profile } = await supabase.from("users").select("name").eq("id", user.id).single();
        if (profile) setCurrentUserName(profile.name);
      }

      const { data, error } = await supabase
        .from("gigs")
        .select(`
          *,
          clients (name, business),
          sales:users!sales_id (name, email, phone),
          developer:users!developer_id (name, email, phone),
          payments (amount_received, received_at),
          payouts (amount, is_paid, users (name))
        `)
        .eq("id", id)
        .single();

      if (error) {
        console.error("Failed to fetch gig:", error);
        router.push("/dashboard/owner/projects");
        return;
      }
       setGig(data as GigDetails);

      const { data: commentsData } = await supabase
        .from("comments")
        .select("*, users (name)")
        .eq("gig_id", id)
        .order("created_at", { ascending: true });
      if (commentsData) setComments(commentsData as Comment[]);
      setCommentsLoading(false);
      setLoading(false);
    }
    fetchGig();
  }, [id, router, supabase]);

  if (loading) {
    return (
      <div className="p-32 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-gold" />
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="p-32 text-center">
        <p className="text-brand-charcoal/40 italic">Project not found.</p>
        <Link href="/dashboard/owner/projects" className="text-brand-gold hover:underline mt-4 inline-block">
          Back to Projects
        </Link>
      </div>
    );
  }

  const totalReceived = gig.payments?.reduce((acc, p) => acc + Number(p.amount_received), 0) || 0;
  const totalPayouts = gig.payouts?.filter(p => p.is_paid).reduce((acc, p) => acc + Number(p.amount), 0) || 0;
  const profit = totalReceived - totalPayouts;

  const refreshGig = async () => {
    if (!id) return;
    const { data, error } = await supabase
      .from("gigs")
      .select(`
        *,
        clients (name, business),
        sales:users!sales_id (name, email, phone),
        developer:users!developer_id (name, email, phone),
        payments (amount_received, received_at),
        payouts (amount, is_paid, users (name))
      `)
      .eq("id", id)
      .single();
    if (!error && data) setGig(data as GigDetails);
  };

  const handleRecordPayment = async () => {
    if (!gig || !paymentAmount) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const { error } = await supabase.from("payments").insert({
        gig_id: gig.id,
        amount_received: paymentAmount,
        received_at: paymentDate,
      });
      if (error) throw error;
      setShowPaymentModal(false);
      setPaymentAmount(0);
      setPaymentDate(new Date().toISOString().slice(0, 10));
      refreshGig();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to record payment");
    }
    setActionLoading(false);
  };

  const handleUpdateStatus = async () => {
    if (!gig || !newStatus) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const { error } = await supabase.from("gigs").update({ status: newStatus }).eq("id", gig.id);
      if (error) throw error;
      setShowStatusModal(false);
      setNewStatus("");
      refreshGig();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to update status");
    }
    setActionLoading(false);
  };

  const handleArchiveProject = async () => {
    if (!gig) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const { error } = await supabase.from("gigs").update({ status: "cancelled" }).eq("id", gig.id);
      if (error) throw error;
      setShowArchiveModal(false);
      refreshGig();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "Failed to archive project");
    }
    setActionLoading(false);
  };

  const handleSendComment = async () => {
    if (!gig || !newComment.trim() || !currentUserId) return;
    setSendingComment(true);
    try {
      const { error } = await supabase.from("comments").insert({
        gig_id: gig.id,
        user_id: currentUserId,
        content: newComment.trim(),
      });
      if (error) throw error;
      setNewComment("");

      const { data: newCommentData } = await supabase
        .from("comments")
        .select("*, users (name)")
        .eq("gig_id", gig.id)
        .order("created_at", { ascending: true });
      if (newCommentData) setComments(newCommentData as Comment[]);

      // Notify other team members via in-app notification
      const otherIds = [gig.sales_id, gig.developer_id].filter(
        (tid) => tid && tid !== currentUserId
      );
      for (const targetId of otherIds) {
        await supabase.from("notifications").insert({
          user_id: targetId,
          type: "comment",
          message: `${currentUserName} commented on ${gig.clients.name}'s project`,
          link: `/dashboard/owner/projects/${gig.id}`,
        });
      }

      // Send email to the other party
      const otherParty = gig.sales?.name !== currentUserName ? gig.sales : gig.developer;
      if (otherParty?.email) {
        fetch("/api/notify/assignment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: otherParty.email,
            name: otherParty.name,
            clientName: gig.clients.name,
            serviceType: `New comment: "${newComment.trim().slice(0, 60)}${newComment.trim().length > 60 ? "..." : ""}"`,
            deadline: "View in workspace",
          }),
        }).catch(() => {});
      }
    } catch (err: unknown) {
      console.error("Failed to send comment:", err);
    }
    setSendingComment(false);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-brand-charcoal/10 pb-10">
        <div>
          <Link
            href="/dashboard/owner/projects"
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40 hover:text-brand-gold mb-4"
          >
            <ArrowLeft className="w-3 h-3" /> Back to Pipeline
          </Link>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-gold mb-3">Workspace</p>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-brand-charcoal leading-none">
            {gig.clients.name}
            <br />
            Project.
          </h1>
        </div>
        <div className="max-w-[200px] text-[11px] text-brand-charcoal/40 font-medium leading-relaxed italic">
          &ldquo;Deep dive into project architecture and financials.&rdquo;
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Left Column - Core Details */}
        <div className="lg:col-span-2 space-y-12">
          {/* Service & Team */}
          <div className="bg-white border border-brand-charcoal/10 p-10">
            <div className="flex items-center gap-4 mb-8">
              <Briefcase className="w-5 h-5 text-brand-gold" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-brand-charcoal">Service & Team</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-10">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40 mb-2">Service Type</p>
                <p className="text-xl font-bold text-brand-charcoal">{gig.service_type}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40 mb-2">Status</p>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 border ${
                  gig.status === "completed" ? "border-brand-sage text-brand-sage" :
                  gig.status === "in_progress" ? "border-brand-gold text-brand-gold" :
                  "border-brand-charcoal/20 text-brand-charcoal/40"
                }`}>
                  {gig.status.replace("_", " ")}
                </span>
              </div>
              {gig.sales && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40 mb-2">Sales Lead</p>
                  <p className="font-bold text-brand-charcoal">{gig.sales.name}</p>
                  <p className="text-[10px] text-brand-charcoal/60">{gig.sales.email}</p>
                </div>
              )}
              {gig.developer && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40 mb-2">Developer</p>
                  <p className="font-bold text-brand-charcoal">{gig.developer.name}</p>
                  <p className="text-[10px] text-brand-charcoal/60">{gig.developer.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="bg-white border border-brand-charcoal/10 p-10">
            <div className="flex items-center gap-4 mb-8">
              <DollarSign className="w-5 h-5 text-brand-gold" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-brand-charcoal">Financial Architecture</h2>
            </div>
            <div className="space-y-8">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="p-6 bg-brand-offwhite border border-brand-charcoal/5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40 mb-2">Total Value</p>
                  <p className="text-2xl font-bold text-brand-charcoal">₹{gig.total_amount.toLocaleString()}</p>
                </div>
                <div className="p-6 bg-brand-offwhite border border-brand-charcoal/5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40 mb-2">Received</p>
                  <p className="text-2xl font-bold text-brand-sage">₹{totalReceived.toLocaleString()}</p>
                </div>
                <div className="p-6 bg-brand-offwhite border border-brand-charcoal/5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40 mb-2">Net Profit</p>
                  <p className="text-2xl font-bold text-brand-gold">₹{profit.toLocaleString()}</p>
                </div>
              </div>
              {gig.payments && gig.payments.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40 mb-4">Payment History</p>
                  <div className="space-y-4">
                    {gig.payments.map((p, idx) => (
                      <div key={idx} className="flex justify-between items-center py-4 border-b border-brand-charcoal/5">
                        <div>
                          <p className="font-bold text-brand-charcoal">Payment #{idx + 1}</p>
                          <p className="text-[10px] text-brand-charcoal/60">{new Date(p.received_at).toLocaleDateString()}</p>
                        </div>
                        <p className="text-lg font-bold text-brand-sage">₹{Number(p.amount_received).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Actions & Timeline */}
        <div className="space-y-12">
          {/* Deadline */}
          <div className="bg-white border border-brand-charcoal/10 p-10">
            <div className="flex items-center gap-4 mb-6">
              <Calendar className="w-5 h-5 text-brand-gold" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-brand-charcoal">Timeline</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40 mb-1">Deadline</p>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-gold" />
                  <p className="font-bold text-brand-charcoal">
                    {gig.deadline ? new Date(gig.deadline).toLocaleDateString("en-IN", { dateStyle: "long" }) : "Flexible"}
                  </p>
                </div>
              </div>
              <div className="pt-6 border-t border-brand-charcoal/5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/40 mb-4">Progress</p>
                <div className="h-2 bg-brand-charcoal/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-gold transition-all duration-1000"
                    style={{ width: gig.status === "completed" ? "100%" : gig.status === "in_progress" ? "60%" : "20%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Payouts */}
          <div className="bg-white border border-brand-charcoal/10 p-10">
            <div className="flex items-center gap-4 mb-6">
              <Users className="w-5 h-5 text-brand-gold" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-brand-charcoal">Payouts</h2>
            </div>
            <div className="space-y-6">
              {gig.payouts && gig.payouts.length > 0 ? (
                gig.payouts.map((p, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-brand-charcoal">{p.users?.name}</p>
                      <p className="text-[10px] text-brand-charcoal/60">{p.is_paid ? "Settled" : "Pending"}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-brand-charcoal">₹{Number(p.amount).toLocaleString()}</p>
                      {p.is_paid && <CheckCircle className="w-4 h-4 text-brand-sage inline-block ml-2" />}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-brand-charcoal/30 italic">No payouts scheduled.</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-brand-charcoal/10 p-10">
            <h2 className="text-sm font-bold uppercase tracking-widest text-brand-charcoal mb-6">Actions</h2>
            {actionError && (
              <div className="text-[10px] text-red-500 font-medium flex items-center gap-1 mb-4 bg-red-50 p-3 border border-red-100">
                <XCircle className="w-3 h-3 shrink-0" />
                {actionError}
              </div>
            )}
            <div className="space-y-4">
              <button
                onClick={() => { setActionError(null); setShowPaymentModal(true); }}
                className="w-full py-3 text-[10px] font-bold uppercase tracking-widest bg-brand-charcoal text-white hover:bg-brand-gold transition-colors"
              >
                Record Payment
              </button>
              <button
                onClick={() => { setActionError(null); setNewStatus(gig.status); setShowStatusModal(true); }}
                className="w-full py-3 text-[10px] font-bold uppercase tracking-widest border border-brand-charcoal/20 text-brand-charcoal hover:border-brand-gold transition-colors"
              >
                Update Status
              </button>
              <button
                onClick={() => { setActionError(null); setShowArchiveModal(true); }}
                className="w-full py-3 text-[10px] font-bold uppercase tracking-widest border border-brand-charcoal/20 text-brand-charcoal hover:border-red-300 hover:text-red-500 transition-colors"
              >
                Archive Project
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Project Notes / Comments */}
      <div className="bg-white border border-brand-charcoal/10 p-10">
        <div className="flex items-center gap-4 mb-8">
          <MessageSquare className="w-5 h-5 text-brand-gold" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-brand-charcoal">Project Notes</h2>
        </div>

        {commentsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-brand-gold" />
          </div>
        ) : (
          <div className="space-y-6">
            {comments.length > 0 ? (
              <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                {comments.map((c) => (
                  <div key={c.id} className="flex gap-4 p-4 bg-brand-offwhite border border-brand-charcoal/5">
                    <div className="w-8 h-8 rounded-full bg-brand-charcoal/10 flex items-center justify-center shrink-0 mt-1">
                      <User className="w-4 h-4 text-brand-charcoal/40" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal">{c.users?.name || "Unknown"}</span>
                        <span className="text-[9px] text-brand-charcoal/30">{new Date(c.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <p className="text-sm text-brand-charcoal/80 leading-relaxed">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center border-2 border-dashed border-brand-charcoal/5">
                <MessageSquare className="w-8 h-8 text-brand-charcoal/5 mx-auto mb-3" />
                <p className="text-sm text-brand-charcoal/30 italic">No notes yet. Start the conversation.</p>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-brand-charcoal/5">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendComment(); } }}
                placeholder="Write a note..."
                className="flex-1 bg-white border border-brand-charcoal/10 px-4 py-3 text-sm focus:border-brand-gold outline-none transition-colors"
              />
              <button
                onClick={handleSendComment}
                disabled={sendingComment || !newComment.trim()}
                className="px-6 py-3 bg-brand-charcoal text-brand-offwhite text-[10px] font-bold uppercase tracking-widest hover:bg-brand-gold transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {sendingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-brand-offwhite p-10 shadow-2xl w-full max-w-md border border-brand-charcoal/10 relative">
            <button
              className="absolute top-4 right-4 text-brand-charcoal/40 hover:text-brand-charcoal"
              onClick={() => { setShowPaymentModal(false); setActionError(null); }}
            >
              <XCircle className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-bold tracking-tighter text-brand-charcoal mb-8">Record Payment.</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/60">Amount (₹)</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full bg-white border border-brand-charcoal/10 px-4 py-3 text-sm focus:border-brand-gold outline-none transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/60">Received Date</label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
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
                  disabled={actionLoading || !paymentAmount}
                  onClick={handleRecordPayment}
                  className="flex-1 py-4 bg-brand-gold text-brand-offwhite text-[11px] font-bold uppercase tracking-widest hover:bg-brand-charcoal transition-all disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Save Payment"}
                </button>
                <button
                  onClick={() => { setShowPaymentModal(false); setActionError(null); }}
                  className="px-8 py-4 border border-brand-charcoal/10 text-[11px] font-bold uppercase tracking-widest text-brand-charcoal/60 hover:text-brand-charcoal transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-brand-offwhite p-10 shadow-2xl w-full max-w-md border border-brand-charcoal/10 relative">
            <button
              className="absolute top-4 right-4 text-brand-charcoal/40 hover:text-brand-charcoal"
              onClick={() => { setShowStatusModal(false); setActionError(null); }}
            >
              <XCircle className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-bold tracking-tighter text-brand-charcoal mb-8">Update Status.</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/60">Current Status</label>
                <p className="text-sm font-bold text-brand-charcoal px-4 py-3 bg-white border border-brand-charcoal/10">{gig.status.replace("_", " ")}</p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand-charcoal/60">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-white border border-brand-charcoal/10 px-4 py-3 text-sm focus:border-brand-gold outline-none transition-colors"
                >
                  <option value="lead">Lead</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              {actionError && (
                <div className="text-xs text-red-500 flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> {actionError}
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  disabled={actionLoading || newStatus === gig.status}
                  onClick={handleUpdateStatus}
                  className="flex-1 py-4 bg-brand-gold text-brand-offwhite text-[11px] font-bold uppercase tracking-widest hover:bg-brand-charcoal transition-all disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Update Status"}
                </button>
                <button
                  onClick={() => { setShowStatusModal(false); setActionError(null); }}
                  className="px-8 py-4 border border-brand-charcoal/10 text-[11px] font-bold uppercase tracking-widest text-brand-charcoal/60 hover:text-brand-charcoal transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Archive Confirmation Modal */}
      {showArchiveModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-brand-offwhite p-10 shadow-2xl w-full max-w-md border border-brand-charcoal/10 relative">
            <button
              className="absolute top-4 right-4 text-brand-charcoal/40 hover:text-brand-charcoal"
              onClick={() => { setShowArchiveModal(false); setActionError(null); }}
            >
              <XCircle className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-bold tracking-tighter text-brand-charcoal mb-4">Archive Project.</h3>
            <p className="text-sm text-brand-charcoal/60 mb-8">
              Are you sure you want to archive <span className="font-bold text-brand-charcoal">{gig.clients.name}</span>&apos;s project?
              Status will be set to <span className="font-bold">cancelled</span>.
            </p>
            {actionError && (
              <div className="text-xs text-red-500 flex items-center gap-1 mb-4">
                <XCircle className="w-3 h-3" /> {actionError}
              </div>
            )}
            <div className="flex gap-3">
              <button
                disabled={actionLoading}
                onClick={handleArchiveProject}
                className="flex-1 py-4 bg-red-500 text-white text-[11px] font-bold uppercase tracking-widest hover:bg-red-600 transition-all disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Archive Project"}
              </button>
              <button
                onClick={() => { setShowArchiveModal(false); setActionError(null); }}
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