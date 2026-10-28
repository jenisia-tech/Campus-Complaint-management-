import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  ClipboardList,
  Clock,
  CheckCircle2,
  Users,
  Lock,
  ArrowRight,
  Sparkles,
  School,
  Database,
  BarChart3,
  Server
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto pt-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-primary-600" />
          <span>Academic IA3 SE Project &bull; Next.js 15 &bull; Supabase &bull; Vercel</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Centralized Campus <br />
          <span className="bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
            Complaint & Facility Management
          </span>
        </h1>

        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Empowering students to voice campus infrastructure grievances and enabling administrators
          to prioritize, assign, and resolve issues with transparent audit timelines.
        </p>

        <div className="flex flex-wrap justify-center items-center gap-4 pt-4">
          <Link href="/register">
            <Button size="lg" className="shadow-md shadow-primary-500/20">
              Student Registration
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg">
              Sign In to Portal
            </Button>
          </Link>
          <Link href="/admin">
            <Button variant="secondary" size="lg">
              Admin Dashboard
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow border-slate-200">
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-primary-700 flex items-center justify-center mb-2">
              <ClipboardList className="w-5 h-5" />
            </div>
            <CardTitle>Deterministic Ticket ID</CardTitle>
          </CardHeader>
          <CardContent className="text-slate-600 text-sm leading-relaxed">
            Every submission generates a concurrent-safe, formatted reference number (e.g.,{' '}
            <code className="text-xs bg-slate-100 px-1 py-0.5 rounded font-mono font-semibold text-slate-800">
              CMP-2026-0001
            </code>
            ) powered by a PostgreSQL sequence and trigger.
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-slate-200">
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
              <Clock className="w-5 h-5" />
            </div>
            <CardTitle>Strict Status Lifecycle</CardTitle>
          </CardHeader>
          <CardContent className="text-slate-600 text-sm leading-relaxed">
            Follows a structured state progression: <em>Submitted &rarr; Under Review &rarr; Assigned &rarr; In Progress &rarr; Resolved &rarr; Closed</em>,
            with full chronological audit trail and remarks.
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-slate-200">
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-2">
              <Lock className="w-5 h-5" />
            </div>
            <CardTitle>PostgreSQL Row-Level Security</CardTitle>
          </CardHeader>
          <CardContent className="text-slate-600 text-sm leading-relaxed">
            Students can only view and manage their own complaints. Administrators gain campus-wide triage, department routing, and statistical report capabilities.
          </CardContent>
        </Card>
      </section>

      {/* Architecture & Evaluation Overview */}
      <section className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Academic Project Demonstration Matrix</h2>
            <p className="text-sm text-slate-500">Mapping Software Engineering Course Outcomes (CO1&ndash;CO5) to Architecture</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-medium">
              Vercel Ready
            </span>
            <span className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-md font-medium">
              Supabase SSR
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-center gap-2 text-primary-700 font-semibold text-sm">
              <School className="w-4 h-4" />
              <span>CO1: Agile / Scrum</span>
            </div>
            <p className="text-xs text-slate-600">
              Iterative 2-week sprints, role-based user stories, and acceptance criteria documented in <code className="font-mono text-xs">docs/CO1_Process_Models.md</code>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-center gap-2 text-indigo-700 font-semibold text-sm">
              <Database className="w-4 h-4" />
              <span>CO2: UML & DB Design</span>
            </div>
            <p className="text-xs text-slate-600">
              Comprehensive Mermaid class diagrams, sequence diagrams, state machines, and relational schema with 4 NF-compliant PostgreSQL tables.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>CO3: Testing Rigor</span>
            </div>
            <p className="text-xs text-slate-600">
              Automated Vitest unit & integration tests, Zod validation tests, plus Playwright browser-level E2E workflow automation.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm">
              <BarChart3 className="w-4 h-4" />
              <span>CO4 & CO5: SCM & Metrics</span>
            </div>
            <p className="text-xs text-slate-600">
              Git flow branching, semantic versioning, COCOMO II effort estimation ($36.8k est), and automated CI/CD deployment pipeline to Vercel.
            </p>
          </div>
        </div>
      </section>

      {/* Practical Evaluation Guide Card */}
      <section className="bg-gradient-to-br from-slate-900 to-primary-950 text-white rounded-2xl p-8 shadow-lg space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-500/20 border border-primary-400/30 rounded-lg">
            <Server className="w-6 h-6 text-primary-300" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Quick Evaluation &amp; Demonstration Guide</h3>
            <p className="text-sm text-slate-300">Default test credentials and local Supabase instructions for reviewers</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 space-y-3">
            <h4 className="font-semibold text-primary-300 flex items-center gap-2">
              <Users className="w-4 h-4" /> Student Portal Testing
            </h4>
            <p className="text-xs text-slate-300">
              Register a new student account using the <strong className="text-white">Student Registration</strong> form, or sign in:
            </p>
            <div className="bg-slate-900/90 p-3 rounded font-mono text-xs text-slate-200 space-y-1">
              <div>Email: <span className="text-emerald-400">student@campus.edu</span></div>
              <div>Password: <span className="text-emerald-400">Student@123456</span></div>
              <div>Role: <span className="text-blue-400">Student (CS Dept)</span></div>
            </div>
            <p className="text-xs text-slate-400">
              Students can lodge complaints, search by status/category, and edit/withdraw only while in <code className="text-slate-300">Submitted</code> state.
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-5 space-y-3">
            <h4 className="font-semibold text-primary-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Admin Portal Testing
            </h4>
            <p className="text-xs text-slate-300">
              Access the administrative triage and real-time analytical reporting dashboard:
            </p>
            <div className="bg-slate-900/90 p-3 rounded font-mono text-xs text-slate-200 space-y-1">
              <div>Email: <span className="text-emerald-400">admin@campus.edu</span></div>
              <div>Password: <span className="text-emerald-400">Admin@123456</span></div>
              <div>Role: <span className="text-rose-400">Administrator (Staff)</span></div>
            </div>
            <p className="text-xs text-slate-400">
              Admins review all complaints across campus, assign technicians, advance status lifecycle, append resolution notes, and export reports.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
