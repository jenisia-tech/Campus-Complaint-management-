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
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>Academic IA3 SE Project &bull; Next.js 15 &bull; Supabase &bull; Vercel</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-900 dark:text-slate-100 tracking-tight leading-tight">
          Centralized Campus <br />
          <span className="bg-gradient-to-r from-navy-900 via-teal-600 to-teal-400 dark:from-teal-300 dark:via-teal-400 dark:to-cyan-200 bg-clip-text text-transparent">
            Complaint & Facility Management
          </span>
        </h1>

        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Empowering students to voice campus infrastructure grievances and enabling administrators
          to prioritize, assign, and resolve issues with transparent audit timelines.
        </p>

        <div className="flex flex-wrap justify-center items-center gap-4 pt-4">
          <Link href="/register">
            <Button size="lg" className="shadow-md bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-slate-900 font-semibold">
              Student Registration
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="border-notepad-border dark:border-notepad-darkBorder text-slate-800 dark:text-slate-100 hover:bg-teal-50/50 dark:hover:bg-campus-darkSurface">
              Student Sign In
            </Button>
          </Link>
          <Link href="/complaints">
            <Button variant="outline" size="lg" className="border-notepad-border dark:border-notepad-darkBorder text-slate-800 dark:text-slate-100 hover:bg-teal-50/50 dark:hover:bg-campus-darkSurface">
              View Complaints Ledger
            </Button>
          </Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 flex items-center justify-center mb-2 border border-teal-200 dark:border-teal-800">
              <ClipboardList className="w-5 h-5" />
            </div>
            <CardTitle>Deterministic Ticket ID</CardTitle>
          </CardHeader>
          <CardContent className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            Every submission generates a concurrent-safe, formatted reference number (e.g.,{' '}
            <code className="text-xs bg-teal-50 dark:bg-campus-darkSurface text-teal-800 dark:text-teal-300 px-1 py-0.5 rounded font-mono font-semibold border border-teal-200 dark:border-campus-border">
              CMP-2026-0001
            </code>
            ) powered by a PostgreSQL sequence and trigger.
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-2 border border-emerald-200 dark:border-emerald-800">
              <Clock className="w-5 h-5" />
            </div>
            <CardTitle>Strict Status Lifecycle</CardTitle>
          </CardHeader>
          <CardContent className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            Follows a structured state progression: <em>Submitted &rarr; Under Review &rarr; Assigned &rarr; In Progress &rarr; Resolved &rarr; Closed</em>,
            with full chronological audit trail and remarks.
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 flex items-center justify-center mb-2 border border-indigo-200 dark:border-indigo-800">
              <Lock className="w-5 h-5" />
            </div>
            <CardTitle>PostgreSQL Row-Level Security</CardTitle>
          </CardHeader>
          <CardContent className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            Students can only view and manage their own complaints. Administrators gain campus-wide triage, department routing, and statistical report capabilities.
          </CardContent>
        </Card>
      </section>

      {/* Architecture & Evaluation Overview */}
      <section className="bg-white dark:bg-notepad-darkCard border border-notepad-border dark:border-notepad-darkBorder rounded-2xl p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-notepad-border dark:border-notepad-darkBorder pb-4">
          <div>
            <h2 className="text-xl font-bold text-navy-900 dark:text-slate-100">Academic Project Demonstration Matrix</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Mapping Software Engineering Course Outcomes (CO1&ndash;CO5) to Architecture</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-md font-medium">
              Vercel Ready
            </span>
            <span className="text-xs px-2.5 py-1 bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 rounded-md font-medium">
              Supabase SSR
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-campus-darkSurface/50 border border-notepad-border dark:border-notepad-darkBorder space-y-2">
            <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300 font-semibold text-sm">
              <School className="w-4 h-4" />
              <span>CO1: Agile / Scrum</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Iterative 2-week sprints, role-based user stories, and acceptance criteria documented in <code className="font-mono text-xs">docs/CO1_Process_Models.md</code>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-campus-darkSurface/50 border border-notepad-border dark:border-notepad-darkBorder space-y-2">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-semibold text-sm">
              <Database className="w-4 h-4" />
              <span>CO2: UML & DB Design</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Comprehensive Mermaid class diagrams, sequence diagrams, state machines, and relational schema with 4 NF-compliant PostgreSQL tables.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-campus-darkSurface/50 border border-notepad-border dark:border-notepad-darkBorder space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-semibold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>CO3: Testing Rigor</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Automated Vitest unit & integration tests, Zod validation tests, plus Playwright browser-level E2E workflow automation.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-campus-darkSurface/50 border border-notepad-border dark:border-notepad-darkBorder space-y-2">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-semibold text-sm">
              <BarChart3 className="w-4 h-4" />
              <span>CO4 & CO5: SCM & Metrics</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Git flow branching, semantic versioning, COCOMO II effort estimation ($36.8k est), and automated CI/CD deployment pipeline to Vercel.
            </p>
          </div>
        </div>
      </section>

      {/* Practical Evaluation Guide Card */}
      <section className="bg-gradient-to-br from-navy-900 to-slate-900 dark:from-navy-950 dark:to-slate-900 text-white rounded-2xl p-8 shadow-lg space-y-6 border border-notepad-border dark:border-notepad-darkBorder">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/20 border border-teal-400/30 rounded-lg">
            <Server className="w-6 h-6 text-teal-300" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Quick Evaluation &amp; Demonstration Guide</h3>
            <p className="text-sm text-slate-300">Default test credentials and local Supabase instructions for reviewers</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="bg-navy-950/70 border border-navy-800 rounded-xl p-5 space-y-3">
            <h4 className="font-semibold text-teal-300 flex items-center gap-2">
              <Users className="w-4 h-4" /> Student Portal Access
            </h4>
            <p className="text-xs text-slate-300">
              Register a new student account using the <strong className="text-white">Student Registration</strong> form, or sign in with default credentials:
            </p>
            <div className="bg-slate-900/90 p-3 rounded font-mono text-xs text-slate-200 space-y-1 border border-slate-800">
              <div>Email: <span className="text-teal-300">student@campus.edu</span></div>
              <div>Password: <span className="text-teal-300">Student@123456</span></div>
              <div>Account: <span className="text-teal-100">Computer Science Student</span></div>
            </div>
            <p className="text-xs text-slate-400">
              Students can lodge grievances, search and filter complaints, and manage active submissions.
            </p>
          </div>

          <div className="bg-navy-950/70 border border-navy-800 rounded-xl p-5 space-y-3">
            <h4 className="font-semibold text-teal-300 flex items-center gap-2">
              <ClipboardList className="w-4 h-4" /> Complaint Submission &amp; Tracking
            </h4>
            <p className="text-xs text-slate-300">
              Full student lifecycle features ready for immediate demonstration:
            </p>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
              <li>10 Campus Categories (Hostels, Wi-Fi, Water, Labs, Classrooms)</li>
              <li>Deterministic formatted ticket IDs (e.g. <span className="text-teal-300 font-mono">CMP-2026-0001</span>)</li>
              <li>Real-time status tracking &amp; official remarks timeline</li>
              <li>Editing &amp; withdrawal permissions while in <span className="text-amber-300 font-medium">Submitted</span> state</li>
            </ul>
            <p className="text-xs text-slate-400">
              All student actions are recorded with timestamps and audit history.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

