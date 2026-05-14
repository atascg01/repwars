# 🏋️ Hevy Social MVP — Design Plan

## "Strava for Lifting"

**Status:** Draft v1.0  
**Author:** Andress (Claw)  
**Date:** 2026-05-14  
**Target:** Solo developer, 4–6 week MVP build

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Market Analysis & Gaps](#2-market-analysis--gaps)
3. [Value Proposition](#3-value-proposition)
4. [MVP Feature Set](#4-mvp-feature-set)
   - [4.1 Onboarding & Data Import](#41-onboarding--data-import)
   - [4.2 Personal Dashboard](#42-personal-dashboard)
   - [4.3 Groups (Crews)](#43-groups-crews)
   - [4.4 Weekly Challenges](#44-weekly-challenges-the-core-feature)
   - [4.5 Global Leaderboards](#45-global-leaderboards)
   - [4.6 Gamification & Badges](#46-gamification--badges)
   - [4.7 Social Feed](#47-social-feed)
5. [Technical Architecture](#5-technical-architecture)
   - [5.1 Tech Stack](#51-tech-stack)
   - [5.2 Database Schema](#52-database-schema)
   - [5.3 API Routes](#53-api-routes)
   - [5.4 Background Jobs](#54-background-jobs)
6. [User Flows](#6-user-flows)
   - [6.1 New User Onboarding Flow](#61-new-user-onboarding-flow)
   - [6.2 Weekly Challenge Flow](#62-weekly-challenge-flow)
   - [6.3 CSV Re-sync Flow](#63-csv-re-sync-flow)
7. [Design Principles & UI Concepts](#7-design-principles--ui-concepts)
8. [Roadmap](#8-roadmap)
9. [Monetization (Post-MVP)](#9-monetization-post-mvp)
10. [Risks & Mitigations](#10-risks--mitigations)

---

## 1. Executive Summary

### The Gap

**Hevy** is the leading workout-tracking app for strength training, with **13 million users**. It has a functional social layer — follow, like, comment on workouts, plus friend-leaderboards on 38 exercises — but that's where it stops. There are:

- ❌ No structured competitions
- ❌ No groups or crews
- ❌ No weekly challenges
- ❌ No global leaderboards (only friends)
- ❌ No streak tracking
- ❌ No badges or gamification
- ❌ No percentile rankings

Meanwhile, **all 26+ third-party Hevy projects on GitHub** are personal analytics dashboards. Every single one. They visualize *your* data to *you*. None add a social or competitive layer on top.

| Category | Examples | Social? |
|----------|---------|---------|
| Web dashboards | LiftShift.app, RepIQ, Hevy Insights | ❌ |
| Data analyzers | Hevy Workout Analyzer, hevy_plus | ❌ |
| SDKs/CLIs | hevy-ts, hevy-py, hevy-cli | ❌ |
| Integrations | Home Assistant, MagicMirror module | ❌ |
| **Social/Competitive** | *Nothing exists* | — |

### The Opportunity

**"Strava for lifting"** — a competitive social layer built on top of existing workout data. Just as Strava unlocked cycling and running as social sports with segments, challenges, clubs, and KOMs, the strength-training world has the same unmet need.

The competitive drive is already there — it just has no platform. Gym-goers already compare lifts, chase PRs, and compete with friends. This platform gives that instinct a home.

**Why now:** Hevy has achieved critical mass (13M users). Its CSV export is free and universal. The community is hungry for social features. No competitor occupies this space. The window is open.

---

## 2. Market Analysis & Gaps

### 2.1 Hevy's Native Social Features

| Feature | Hevy Has It? | Description |
|---------|:---:|-------------|
| Follow/unfollow users | ✅ | Basic social graph |
| Like/comment on workouts | ✅ | Feed interactions |
| Friend leaderboards | ✅ | Per-exercise, 38 exercises only |
| Groups / crews | ❌ | No grouping mechanism |
| Structured challenges | ❌ | No competitive formats |
| Weekly competitions | ❌ | No recurring events |
| Global leaderboards | ❌ | Friends-only scope |
| Streak tracking | ❌ | No consistency metrics |
| Badges / achievements | ❌ | No gamification |
| Percentile rankings | ❌ | No population comparison |
| Privacy controls for sharing | ❌ | All-or-nothing |
| Cross-app support | ❌ | Hevy-only |

### 2.2 Third-Party Hevy Ecosystem (GitHub Analysis)

A survey of all public Hevy-related repositories on GitHub reveals a consistent pattern:

| Project | Type | Purpose |
|---------|------|---------|
| **LiftShift.app** | Web app | Personal analytics dashboard; volume tracking, progression charts |
| **RepIQ** | Web app | Workout analytics, estimated 1RM tracking |
| **Hevy Insights** | Web app | Data visualization, PR tracking |
| **Hevy Workout Analyzer** | Python | Statistical analysis of workout patterns |
| **hevy_plus** | Web app | Extended stats, volume over time |
| **hevy-ts** | SDK | TypeScript wrapper for Hevy API |
| **hevy-py** | SDK | Python wrapper for Hevy API |
| **hevy-cli** | CLI | Command-line workout viewer |
| **Home Assistant Hevy** | Integration | Display workout stats on HA dashboards |
| **MMM-Hevy** | Module | MagicMirror workout display |
| Various forks & derivatives | Mixed | All analytics-focused |

**Finding:** 0 out of 26+ projects address social or competitive features. The entire ecosystem is "look at your own data" — no project helps you compare, compete, or connect with others.

### 2.3 Broader Fitness Market Comparison

| Platform | Domain | Groups | Challenges | Leaderboards | Segments | Badges |
|----------|--------|:---:|:---:|:---:|:---:|:---:|
| **Strava** | Running/Cycling | ✅ Clubs | ✅ Monthly | ✅ Global | ✅ KOM/QOM | ✅ |
| **Garmin Connect** | Multi-sport | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Fitbit** | General fitness | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Whoop** | Recovery/Strain | ✅ Teams | ❌ | ❌ | ❌ | ❌ |
| **MyFitnessPal** | Nutrition | ❌ | ✅ | ❌ | ❌ | ❌ |
| **StrengthLevel** | Lifting | ❌ | ❌ | ✅ Standards | ❌ | ❌ |
| **OpenPowerlifting** | Powerlifting | ❌ | ❌ | ✅ Raw data | ❌ | ❌ |
| **Hevy** | Lifting | ❌ | ❌ | Friends only | ❌ | ❌ |
| **THIS PROJECT** | Lifting | ✅ Crews | ✅ Weekly | ✅ Global | ✅ Exercise | ✅ |

**Key insight:** *StrengthLevel.com* has strength standards comparisons (novice → elite for every lift) but zero social/competitive features. *OpenPowerlifting* is pure data. Neither does what Strava does for cycling. There is no "Strava for lifting." The niche is entirely uncontested.

### 2.4 Why No One Has Built This Yet

1. **Data fragmentation:** Until Hevy's API and CSV export matured, there was no standard way to get workout data out of apps.
2. **Platform lock-in mindset:** Most developers think "build another workout tracker" rather than "build a layer on top of existing trackers."
3. **Hevy's API is young:** The public API launched relatively recently, and the third-party ecosystem is still maturing.
4. **Market education:** The "social layer on top of data" model (Strava's model) is proven in endurance sports but hasn't been applied to lifting.

---

## 3. Value Proposition

### 3.1 Universal (Language & Culture Agnostic)

Strength training metrics — kilograms, pounds, reps, sets — are **universal numbers**. They transcend language barriers. A 100 kg bench press means the same thing whether you're in Tokyo, São Paulo, or Berlin. This makes the platform inherently global from day one.

### 3.2 Platform Agnostic (Any Gym, Any Equipment)

Unlike Strava which requires GPS and outdoor routes, lifting happens anywhere with weights. The platform works with:

- Commercial gyms (Planet Fitness, Gold's Gym, local)
- Home gyms (garage, basement, spare room)
- Calisthenics parks
- Hotel gyms
- Anywhere with a barbell, dumbbell, or body weight

### 3.3 Competitive Drive Is Universal

People already compete in the gym — asking "how much do you bench?", comparing PRs with friends, pushing each other. This platform formalizes and gamifies that existing behavior. It gives structure to the natural human drive to compare and improve.

### 3.4 Low Barrier to Entry

| Method | Cost to User | Effort |
|--------|:---:|--------|
| CSV upload (Hevy free) | $0 | Drag & drop file |
| API key connect (Hevy Pro) | $2.99/mo (Hevy) | Paste key once |
| Manual entry | $0 | Type in data |

CSV export works on Hevy's free tier. Millions of users already have months or years of workout history they can upload in seconds. No paid subscription required to start.

### 3.5 Privacy-First Design

Users choose exactly what to share:

| Visibility Level | What's Shared |
|------------------|---------------|
| **Public** | Profile, stats, badges visible to all |
| **Crew-only** | Workouts visible only to crew members |
| **Private** | Workouts hidden; stats count toward challenges but details aren't visible |

Users can set default visibility and override per-workout. This matters — not everyone wants their training public, but most are happy to share within a trusted crew.

### 3.6 Multi-App Future (Not Locked to Hevy)

While the MVP targets Hevy (largest user base, clean CSV, public API), the architecture is designed to support:

- **Strong** (CSV export available)
- **Lyfta** (growing user base)
- **Manual entry** (no app required)
- **Future:** direct API integrations with any app that opens up

The platform is an aggregation layer, not another tracker. Hevy is the entry point, not the ceiling.

---

## 4. MVP Feature Set

### 4.1 Onboarding & Data Import

#### 4.1.1 CSV Drag & Drop Upload

**Target user:** Free-tier Hevy users (vast majority of the 13M base).

**Flow:**
1. User visits landing page, clicks "Get Started"
2. Auth step (Discord OAuth or email)
3. "Import Your Workouts" screen with:
   - **Primary CTA:** Drag & drop zone for Hevy CSV
   - **Secondary link:** "Connect with Hevy API key" (for Pro users)
   - **Tertiary link:** "Enter manually" (fallback)

**CSV Parsing (Papa Parse):**
- Parse Hevy CSV format: `title, start_time, end_time, exercise, set_type, weight_kg, reps, distance_meters, duration_seconds, rpe`
- Handle edge cases: empty rows, malformed dates, missing optional fields
- Show progress: "Parsing CSV... Found 342 workouts, 1,845 sets across 47 exercises"
- Preview before import: summary stats, sample rows, detected date range
- **Deduplication:** Match existing workouts by Hevy workout ID (CSV has internal IDs) or by date + title + exercise fingerprint to avoid duplicates on re-upload
- Validation: flag suspicious data (e.g., 1000 kg bench press) with a warning

**Technical notes:**
- Parse entirely client-side (Papa Parse runs in browser)
- Send parsed JSON to server via API
- Server-side dedup and insert in transaction
- Return import summary: `{ workoutsImported: 45, workoutsSkipped: 12, setsImported: 203 }`

#### 4.1.2 Hevy API Key Connect

**Target user:** Hevy Pro subscribers ($2.99/mo).

**Flow:**
1. User provides Hevy API key (from Hevy app → Settings → API)
2. System validates key by making a test request to Hevy API
3. On success: full historical sync triggered (fetch all workouts, paginated)
4. Ongoing: daily cron sync for new workouts
5. API key stored encrypted at rest

**Technical notes:**
- Hevy API pagination: 10 workouts per page, handle rate limits
- Store `last_synced_at` per user to only fetch new data
- Sync failures: retry with exponential backoff, notify user after 3 consecutive failures

#### 4.1.3 Manual Workout Entry

**Fallback for users without Hevy:**
- Simple form: date, title, exercises → sets
- Exercise autocomplete from Hevy exercise database
- Weight, reps, set type (warmup/normal/failure/dropset)
- Quick-add for common exercises (bench, squat, deadlift)
- Mobile-optimized input (number pads, quick taps)

#### 4.1.4 Profile Setup

**Fields:**
| Field | Required | Description |
|-------|:---:|-------------|
| Display name | ✅ | Public-facing name |
| Avatar | ❌ | Upload or Discord default |
| Timezone | ✅ | For challenge scheduling |
| Unit preference | ✅ | kg or lbs (all storage in kg, display converted) |
| Bio | ❌ | Short text (max 160 chars) |
| Gender | ❌ | For leaderboard filtering |
| Bodyweight | ❌ | For weight-class leaderboards |
| Default privacy | ✅ | Public / Crew-only / Private |

---

### 4.2 Personal Dashboard

The dashboard is the first thing users see after login. It should answer: "How am I doing?"

#### 4.2.1 Current Streak

```
🔥 47 DAY STREAK
Longest: 89 days | This week: 4/4 days
```

- **Daily streak:** Consecutive days with ≥1 workout
- **Weekly streak:** Consecutive weeks with ≥3 workouts (configurable)
- Visual: flame emoji that "grows" — starts small, gets bigger at milestones (7, 30, 90, 365)
- Shows both current and longest-ever streak
- Calendar heatmap below (GitHub-style) showing workout frequency

#### 4.2.2 Weekly Volume by Muscle Group

```
RADAR CHART                BAR CHART
   Chest                    Chest    ████████████ 12,400 kg
   / \                      Back     ██████████   10,200 kg
  /   \                     Legs     ████████████ 13,800 kg
Back  Shoulders             Shoulder ██████        6,100 kg
  \   /                     Arms     ████          4,200 kg
   \ /                      Core     ██            2,000 kg
   Legs
```

- **Radar chart:** Quick visual of balance across muscle groups
- **Bar chart:** Exact volume numbers
- Toggleable: this week / this month / all time
- Color-coded by muscle group (consistent color scheme across the app)
- "Volume" = sum of (weight × reps) for each exercise in that muscle group

#### 4.2.3 Recent PRs Timeline

```
🏆 PR TIMELINE
May 12 — Bench Press 100 kg × 5 (+2.5 kg from Apr 28)
May 10 — Deadlift 180 kg × 1 (+5 kg from Apr 15)
May 8  — Squat 140 kg × 3 (first time!)
```

- List of recent personal records
- PR detection algorithm: for each exercise, track best weight at each rep range. A new entry is a PR if it's the highest weight ever lifted for that rep count, OR the highest 1RM estimate for that exercise.
- Shows delta from previous best
- Links to the workout where PR was set

#### 4.2.4 Total Volume Stats

```
THIS WEEK          THIS MONTH         ALL TIME
48,520 kg          192,300 kg         2,847,000 kg
(2.6 tons)         (10.5 tons)        (1,423 tons)
```

- Big, bold numbers — the hero metrics
- Animated counters on load
- Comparison to previous period: "↑ 12% vs last week"

#### 4.2.5 Workout Frequency Calendar

GitHub-style contribution heatmap:

```
       Jan  Feb  Mar  Apr  May
Mon    ░░█░█ ░█░██ ██░█░ ░██░░ █░█░░
Tue    ░█░██ ███░█ ░░██░ ██░█░ ░░██░
Wed    ██░█░ ░██░░ █░██░ ░░██░ ██░█░
Thu    ░░██░ █░██░ ░██░░ ███░█ ░░███
Fri    ██░██ ░░█░█ ██░██ ░░██░ ███░░
Sat    ░██░░ ███░░ ░░██░ ███░░ ░░██░
Sun    ████░ ░░██░ ███░░ ░░██░ ████░
       ░ = 0 sets  █ = 10+ sets  (darker = more volume)
```

- Each cell = one day
- Color intensity based on total volume (kg) that day
- Hover: shows date, workout count, total volume
- Click: goes to that day's workout(s)
- Full year view, scrollable

---

### 4.3 Groups (Crews)

Crews are the social container. All competition happens within crews. Think of them as Strava Clubs.

#### 4.3.1 Crew Creation

| Field | Required | Description |
|-------|:---:|-------------|
| Crew name | ✅ | Up to 50 chars |
| Description | ❌ | Up to 300 chars |
| Avatar/emoji | ❌ | Upload or select emoji |
| Privacy | ✅ | Public / Invite-only / Private |
| Invite code | Auto | Generated unique code (e.g., `IRON-ALPHA-7`) |

**Privacy levels:**
| Type | Discoverable? | Join Method | Content Visible To |
|------|:---:|---|---|
| **Public** | ✅ In search/directory | Anyone can join | Anyone |
| **Invite-only** | ✅ In search | Invite link or code | Anyone (content visible, but can't join without invite) |
| **Private** | ❌ Hidden | Invite only | Members only |

#### 4.3.2 Crew Roles

| Role | Permissions |
|------|------------|
| **Owner** | Full control: edit crew, delete crew, manage roles, create challenges, remove members |
| **Admin** | Create challenges, remove members, edit crew details |
| **Member** | View content, participate in challenges, invite others (if allowed) |

#### 4.3.3 Crew Feed

A chronological feed of crew activity:

- New member joined → "💪 Alex joined Iron Legion!"
- Workout logged → "John logged 'Push Day' — 8,400 kg total"
- PR hit → "🏆 Sarah hit a PR: Bench Press 75 kg × 5!"
- Challenge created → "⚔️ New challenge: Iron King — Week 20"
- Challenge ended → "👑 Results are in! Mike won Iron King with 52,000 kg!"
- Comment on workout → "Nice set! 🔥"

Each feed item is tappable → expands or links to detail view.

#### 4.3.4 Crew Roster

| Member | Role | Weekly Volume | Streak | This Week's Challenges |
|--------|------|:---:|:---:|------------------------|
| Mike | Owner | 52,000 kg | 🔥 47d | Iron King (1st), PR Breaker (3rd) |
| Sarah | Admin | 38,000 kg | 🔥 12d | Iron King (2nd) |
| John | Member | 24,000 kg | 🔥 3d | Iron King (5th) |

- Sortable by volume, streak, join date
- Member profile quick-view on click
- Stats are crew-scoped (only workouts shared with the crew count)

---

### 4.4 Weekly Challenges (THE CORE FEATURE)

Challenges are the heart of the platform. They create recurring engagement loops and are the primary reason users come back.

#### 4.4.1 Challenge Types

##### Iron King / Iron Queen 👑
**Metric:** Total volume (kg) lifted during the challenge period.

```
🏆 IRON KING — Week 20
Leader: Mike — 52,400 kg
You:    3rd — 38,200 kg (+1 from yesterday)

1. Mike     52,400 kg  ████████████████████████
2. Sarah    44,100 kg  ██████████████████
3. YOU      38,200 kg  ████████████████
4. John     24,000 kg  ██████████
5. Alex     18,500 kg  ███████
```

- **Scoring:** Sum of `weight_kg × reps` across all exercises in all workouts during the challenge window.
- **Anti-cheat:** Suspicious volume spikes flagged. API-connected users get "verified" badge.
- **Gender split:** Separate Iron King (men's) and Iron Queen (women's) leaderboards within the same challenge, or separate challenges.

##### Consistency King / Consistency Queen 📅
**Metric:** Number of distinct days with workouts during the challenge period.

```
📅 CONSISTENCY KING — Week 20
Leader: Sarah — 6/7 days
You:    2nd — 5/7 days

1. Sarah    6 days  ██████████████████████████████
2. YOU      5 days  ████████████████████████
3. Mike     4 days  ████████████████████
4. John     4 days  ████████████████████
5. Alex     3 days  ████████████████
```

- **Scoring:** Count of unique calendar days with ≥1 workout logged.
- **Tiebreaker:** Total volume.
- Rewards consistency over raw numbers — accessible to beginners and advanced lifters alike.

##### PR Breaker 💥
**Metric:** Number of personal records broken during the challenge period.

```
💥 PR BREAKER — Week 20
Leader: Alex — 4 PRs
You:    2nd — 2 PRs

Alex broke:
  • Bench Press: 90 kg × 8 (+5 kg)
  • Squat: 130 kg × 5 (+2.5 kg)
  • Deadlift: 165 kg × 3 (+5 kg)
  • OHP: 55 kg × 6 (+2.5 kg)
```

- **Scoring:** Count of unique exercise PRs broken. Not just weight PRs — rep PRs at a given weight also count.
- **Tiebreaker:** Total volume increase vs previous PR.
- This challenge rewards pushing limits, not just grinding volume.

##### Grinder 🔨
**Metric:** Highest single-session volume.

```
🔨 GRINDER — Week 20
Leader: Mike — 14,200 kg (Leg Day, May 15)
You:    4th — 9,800 kg (Push Day, May 14)

1. Mike    14,200 kg  ████████████████████████████
2. Sarah   12,100 kg  ██████████████████████
3. John    10,400 kg  ██████████████████
4. YOU      9,800 kg  ████████████████
5. Alex     8,200 kg  █████████████
```

- **Scoring:** Single highest-volume workout during the challenge period.
- Rewards those who have one massive session even if they can't train every day.

##### Flexible (Custom Challenge) 🎯
**Created by crew leader/admin:**

| Parameter | Options |
|-----------|---------|
| Challenge type | Volume / Consistency / PRs / Single-session |
| Exercise filter | Any specific exercise or "All" |
| Duration | 1 day / 3 days / 7 days / 14 days / 30 days |
| Start date | Immediate or scheduled |
| Gender split | Combined / Separate |
| Metric | Volume / Reps / Sets / Max weight |

**Examples:**
- "Bench Press Blitz: Most bench volume in 3 days"
- "Squatober: Most squat sessions in October"
- "Deadlift Max-Out: Heaviest single deadlift this weekend"

#### 4.4.2 Challenge Mechanics (Detailed)

**Creation flow:**
1. Crew owner/admin clicks "Create Challenge"
2. Selects challenge type (or "Custom")
3. Configures parameters (duration, exercise filter, etc.)
4. Sets start date (immediate = now, scheduled = future)
5. Challenge is announced in crew feed

**Active challenge display:**
- Live leaderboard with animated position changes
- "Time remaining" countdown
- Current scores update as members sync data
- Position change indicators: "↑ 2", "↓ 1", "—" since last check
- Personal stats panel: "You need 3,200 kg to take 2nd place"

**Challenge finalization (automatic):**
1. At end time, challenge status → `closed`
2. Final scores calculated and frozen
3. Podium generated: 🥇 🥈 🥉
4. Results posted to crew feed with celebration animation
5. Badges awarded to top 3 (and sometimes all participants)
6. Challenge history page updated

**Challenge history:**
- List of all past challenges in the crew
- Filterable by type
- Shows winners, your rank in each
- Stats: "You've won 3 Iron Kings, placed in 8/12 challenges"

#### 4.4.3 Scoring System (Anti-Cheat)

| Data Source | Trust Level | Badge |
|-------------|:---:|-------|
| Hevy API sync | ⭐⭐⭐ Trusted | ✅ Verified badge |
| CSV upload | ⭐⭐ Standard | No badge |
| Manual entry | ⭐ Basic | 🖊️ Manual badge |

**Suspicious activity flags:**
- Volume spike >3x user's average weekly volume
- Workout logged at impossible times (overlapping sessions)
- PR breakers with suspiciously round numbers
- New account with immediate massive volume claims

**Flagged workouts:**
- Still count toward user's personal stats
- Marked with ⚠️ in challenge leaderboards
- Crew admins can review and dismiss flags
- Repeat flags may result in challenge exclusion

---

### 4.5 Global Leaderboards

While crew challenges are the core loop, global leaderboards provide broader context and aspiration.

#### 4.5.1 Exercise Leaderboards

```
🏋️ BENCH PRESS — Global Leaderboard
Week of May 12-18, 2026

Filter: All | Men | Women | <70kg | 70-85kg | 85-100kg | >100kg
Sort: Max Weight | Est. 1RM | Total Volume

RANK  USER          BEST SET         CREW
🥇     powerjoe      185 kg × 3       Iron Legion
🥈     liftqueen     102 kg × 8       Valkyrie Squad
🥉     benchgod      170 kg × 1       Bench Mob
4      ironmike      160 kg × 3       Iron Legion
...
247    YOU           100 kg × 5       Iron Legion
       (Top 12% for 85-100 kg weight class!)
```

- **Filters:** Weight class, gender, time period (week/month/all time)
- **Metrics:** Best set weight, estimated 1RM (Epley formula), total volume on that exercise
- **Percentile:** Always show user's percentile — "You're in the top 12% for your weight class"
- **Crew affiliation:** Shows which crew each lifter belongs to
- **Verified badge:** API-connected users get verified checkmark

#### 4.5.2 Volume Leaders

```
📊 WEEKLY VOLUME LEADERS
All exercises, May 12-18, 2026

RANK  USER          VOLUME        CREW
🥇     volmonster    142,000 kg    Volume Hogs
🥈     powerjoe      128,500 kg    Iron Legion
🥉     grinddaily    115,200 kg    Daily Grinders
4      liftqueen     108,400 kg    Valkyrie Squad
...
89     YOU            48,520 kg    Iron Legion
       (Top 15% globally!)
```

- Weekly and monthly views
- Total volume across all exercises
- Gender and weight class filters

#### 4.5.3 Streak Leaders

```
🔥 LONGEST ACTIVE STREAK
Consecutive days with at least 1 workout

RANK  USER          STREAK    CREW
🥇     everydayjoe   847 days  Never Miss Monday
🥈     grinddaily    512 days  Daily Grinders
🥉     ironmike      89 days   Iron Legion
...
42     YOU           47 days   Iron Legion
       (Top 8% globally!)
```

- Longest active streak
- All-time longest streak (by user)
- Current week streak leaders

---

### 4.6 Gamification & Badges

Badges provide recognition, reward consistency, and create collection-based engagement.

#### 4.6.1 Badge Categories

##### Streak Badges
| Badge | Icon | Requirement |
|-------|:---:|-------------|
| Kindling | 🔥 | 7-day streak |
| On Fire | 🔥 | 30-day streak |
| Blazing | 🔥 | 90-day streak |
| Inferno | 🔥 | 180-day streak |
| Eternal Flame | 🔥 | 365-day streak |

##### Volume Milestones
| Badge | Icon | Requirement |
|-------|:---:|-------------|
| Ton Up | 🏋️ | 1 ton (1,000 kg) lifetime volume |
| Heavy Mover | 🏋️ | 10 tons lifetime volume |
| Crane | 🏗️ | 100 tons lifetime volume |
| Bulldozer | 🚜 | 500 tons lifetime volume |
| Mountain Mover | ⛰️ | 1,000 tons lifetime volume |
| Legend | 👑 | 10,000 tons lifetime volume |

##### PR Badges
| Badge | Icon | Requirement |
|-------|:---:|-------------|
| First PR | 🏆 | Break your first personal record |
| PR Machine | 🏆 | Break 10 total PRs |
| PR Hunter | 🏆 | Break 50 total PRs |
| PR Legend | 🏆 | Break 100 total PRs |

##### Exercise Mastery (per exercise)
| Badge | Icon | Requirement |
|-------|:---:|-------------|
| Bench Novice | 🏋️ | Bench 60 kg (M) / 30 kg (W) |
| Bench Intermediate | 🏋️ | Bench 100 kg (M) / 50 kg (W) |
| Bench Advanced | 🏋️ | Bench 140 kg (M) / 70 kg (W) |
| Bench Elite | 🏋️ | Bench 180 kg (M) / 90 kg (W) |

(Same structure for Squat, Deadlift, OHP, etc. — aligned with StrengthLevel standards.)

##### Challenge Badges
| Badge | Icon | Requirement |
|-------|:---:|-------------|
| First Victory | 👑 | Win a challenge |
| Hat Trick | 👑 | Win 3 challenges |
| Champion | 👑 | Win 10 challenges |
| Dynasty | 👑 | Win 25 challenges |
| Podium Fixture | 🏅 | Place top 3 in 10 challenges |
| Consistent Competitor | ⚔️ | Participate in 20 challenges |

##### Special Badges
| Badge | Icon | Requirement |
|-------|:---:|-------------|
| Early Adopter | 🥇 | Joined in first 1,000 users |
| Verified Athlete | ✅ | Connected Hevy API |
| Crew Founder | 👥 | Created a crew with 10+ members |
| World Traveler | 🌍 | Logged workouts in 3+ countries |
| Night Owl | 🦉 | 10 workouts starting after 10 PM |
| Early Bird | 🌅 | 10 workouts starting before 6 AM |

#### 4.6.2 Badge Showcase

On user profile:
- **Featured badges (top row):** 3 badges the user chooses to highlight
- **Recently earned:** Last 5 badges, with earn dates
- **Badge grid:** All badges, organized by category. Locked badges shown as greyed-out with requirement tooltip
- **Badge count:** "47/82 badges earned"
- **Rarest badge:** "Your rarest badge: Eternal Flame (held by 0.3% of users)"

---

### 4.7 Social Feed

#### 4.7.1 Global Feed (Landing Page)

- Activity from public profiles and public crews
- Workout cards, PR announcements, challenge results
- Infinite scroll, sorted by recency
- Reactions (🔥💪🏆😂👏) and comment counts

#### 4.7.2 Crew Feed

- All crew activity in one chronological feed
- Filterable by type: All / Workouts / PRs / Challenges / Announcements
- Rich workout cards with exercise summary and volume
- PR cards with delta from previous best and celebration confetti

#### 4.7.3 Workout Card

```
┌─────────────────────────────────────────┐
│ Mike • Iron Legion                       │
│ Push Day • May 14, 2026 • 62 min         │
│                                          │
│ Bench Press    100kg × 5,5,4  4,200 kg  │
│ Incline DB      32kg × 8,8,8  2,304 kg  │
│ OHP             55kg × 5,5,5  1,375 kg  │
│ Lateral Raise   14kg × 12,12  1,008 kg  │
│ Tricep Push     25kg × 10,10  1,250 kg  │
│                                          │
│ Total: 10,137 kg • 17 sets              │
│ 🏆 PR: Bench Press 100kg × 5! (+2.5kg) │
│                                          │
│ 🔥 12  💪 8  🏆 3  💬 5                  │
└─────────────────────────────────────────┘
```

#### 4.7.4 Reactions & Comments

- **Reactions:** Quick-tap emoji reactions (🔥💪🏆😂👏😤🎉👀)
- Shows count per emoji, user can add/remove their reaction
- **Comments:** Threaded under workout cards
- Simple text comments (no rich text for MVP)
- @mentions of crew members
- Comment notifications (in-app, future: email/Discord)

#### 4.7.5 Shareable Workout Cards

- Generate a shareable image (like Strava activity cards)
- Includes: user avatar, workout summary, highlight exercise, total volume
- Perfect for sharing to Instagram stories, Twitter, Discord
- Branded watermark: platform logo + URL
- OG image meta tags for link sharing

---

## 5. Technical Architecture

### 5.1 Tech Stack

#### Frontend

| Technology | Purpose | Why |
|------------|---------|-----|
| **Next.js 15+** | React framework, App Router | Server components, streaming, ISR, API routes in same project |
| **React 19** | UI library | Latest version with server components |
| **Tailwind CSS 4** | Utility-first CSS | Rapid styling, dark mode built-in |
| **shadcn/ui** | Component library | Accessible, customizable, copy-paste components |
| **Recharts** | Charts | Composable React charts (radar, bar, heatmap) |
| **Framer Motion** | Animations | Leaderboard transitions, podium celebrations, badge animations |
| **React Dropzone** | File upload | Drag & drop CSV import |
| **Papa Parse** | CSV parsing | Client-side CSV → JSON |
| **date-fns** | Date handling | Lightweight, tree-shakeable date utils |
| **Lucide React** | Icons | Consistent icon set |

#### Backend

| Technology | Purpose | Why |
|------------|---------|-----|
| **Next.js API Routes** | REST API | Same project, no separate server |
| **Prisma ORM** | Database access | Type-safe queries, migrations, easy schema evolution |
| **PostgreSQL** | Database | Relational, performant, hosted on Supabase |
| **NextAuth.js v5** | Authentication | Discord OAuth + email/password, session management |
| **Supabase** | PostgreSQL + Storage | Free tier to start, scales well, built-in auth optional |

#### Infrastructure

| Technology | Purpose | Why |
|------------|---------|-----|
| **Vercel** | Hosting | Free tier, edge functions, cron jobs, Next.js native |
| **Supabase** | DB + file storage | Generous free tier (500 MB DB, 1 GB storage) |
| **Resend** | Emails | Modern email API, React email templates, free tier (100/day) |
| **Vercel Cron** | Scheduled jobs | Daily API syncs, weekly challenge finalization |

#### Development

| Technology | Purpose |
|------------|---------|
| **TypeScript** | Type safety across full stack |
| **ESLint + Prettier** | Code quality |
| **Vitest** | Unit/integration testing |
| **Playwright** | E2E testing (future) |

### 5.2 Database Schema

```prisma
// ─── Users & Auth ───────────────────────────────────────

model User {
  id                  String    @id @default(cuid())
  email               String?   @unique
  emailVerified        DateTime?
  discordId           String?   @unique
  displayName         String
  avatar              String?
  bio                 String?   @db.VarChar(160)
  unitPreference      Unit      @default(kg)
  timezone            String    @default("UTC")
  gender              Gender?
  bodyweightKg        Float?
  defaultPrivacy      Privacy   @default(crew_only)
  hevyApiKeyEncrypted String?
  hevyLastSyncAt      DateTime?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  // Relations
  workouts          Workout[]
  crewMemberships   CrewMember[]
  createdChallenges Challenge[]
  participants      ChallengeParticipant[]
  badges            UserBadge[]
  comments          WorkoutComment[]
  reactions         WorkoutReaction[]
  ownedCrews        Crew[]           @relation("CrewOwner")
  accounts          Account[]
  sessions          Session[]

  @@map("users")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

// ─── Workout Data ───────────────────────────────────────

model Workout {
  id            String    @id @default(cuid())
  userId        String
  source        Source    @default(csv)       // csv | api | manual
  hevyWorkoutId String?                        // Hevy's internal UUID for dedup
  title         String
  description   String?
  startTime     DateTime
  endTime       DateTime
  isPrivate     Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  user      User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  exercises Exercise[]
  comments  WorkoutComment[]
  reactions WorkoutReaction[]

  @@index([userId, startTime])
  @@index([hevyWorkoutId])
  @@map("workouts")
}

model Exercise {
  id                String  @id @default(cuid())
  workoutId         String
  hevyTemplateId    String
  name              String
  muscleGroup       String?
  notes             String?

  // Relations
  workout Workout @relation(fields: [workoutId], references: [id], onDelete: Cascade)
  sets    Set[]

  @@map("exercises")
}

model Set {
  id              String  @id @default(cuid())
  exerciseId      String
  type            SetType @default(normal)   // warmup | normal | failure | dropset
  weightKg        Float?
  reps            Int?
  distanceMeters  Int?
  durationSeconds Int?
  rpe             Float?

  // Computed
  volumeKg        Float?                      // weightKg * reps (computed on insert)

  // Relations
  exercise Exercise @relation(fields: [exerciseId], references: [id], onDelete: Cascade)

  @@map("sets")
}

// ─── Crews ──────────────────────────────────────────────

model Crew {
  id          String    @id @default(cuid())
  name        String
  description String?   @db.VarChar(300)
  avatar      String?
  privacy     Privacy   @default(invite_only) // public | invite_only | private
  inviteCode  String    @unique               // Auto-generated: "IRON-ALPHA-7"
  ownerId     String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Relations
  owner       User            @relation("CrewOwner", fields: [ownerId], references: [id])
  members     CrewMember[]
  challenges  Challenge[]

  @@index([privacy])
  @@map("crews")
}

model CrewMember {
  id        String   @id @default(cuid())
  crewId    String
  userId    String
  role      CrewRole @default(member)  // owner | admin | member
  joinedAt  DateTime @default(now())

  // Relations
  crew Crew @relation(fields: [crewId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([crewId, userId])
  @@map("crew_members")
}

// ─── Challenges ─────────────────────────────────────────

model Challenge {
  id             String         @id @default(cuid())
  crewId         String
  createdBy      String
  type           ChallengeType                   // volume | consistency | prs | grinder | custom
  title          String
  description    String?
  startDate      DateTime
  endDate        DateTime
  exerciseFilter String?                         // null = all exercises, or specific exercise name
  genderSplit    GenderSplit    @default(combined)
  status         ChallengeStatus @default(upcoming) // upcoming | active | closed
  createdAt      DateTime       @default(now())

  // Relations
  crew         Crew                    @relation(fields: [crewId], references: [id], onDelete: Cascade)
  creator      User                    @relation(fields: [createdBy], references: [id])
  participants ChallengeParticipant[]

  @@index([crewId, status])
  @@map("challenges")
}

model ChallengeParticipant {
  id          String @id @default(cuid())
  challengeId String
  userId      String
  score       Float  @default(0)       // Current score (volume kg, days, PR count, etc.)
  rank        Int?                     // Current rank (updated periodically)
  finalRank   Int?                     // Final rank after challenge closes

  // Relations
  challenge Challenge @relation(fields: [challengeId], references: [id], onDelete: Cascade)
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([challengeId, userId])
  @@map("challenge_participants")
}

// ─── Badges ─────────────────────────────────────────────

model Badge {
  id          String      @id @default(cuid())
  name        String
  description String
  icon        String                       // Emoji
  category    BadgeCategory                // streak | volume | pr | exercise | challenge | special
  requirement String?                      // Human-readable requirement
  createdAt   DateTime    @default(now())

  // Relations
  users UserBadge[]

  @@map("badges")
}

model UserBadge {
  id       String   @id @default(cuid())
  userId   String
  badgeId  String
  earnedAt DateTime @default(now())

  // Relations
  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  badge Badge @relation(fields: [badgeId], references: [id], onDelete: Cascade)

  @@unique([userId, badgeId])
  @@map("user_badges")
}

// ─── Social ─────────────────────────────────────────────

model WorkoutComment {
  id        String   @id @default(cuid())
  workoutId String
  userId    String
  text      String
  createdAt DateTime @default(now())

  // Relations
  workout Workout @relation(fields: [workoutId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([workoutId])
  @@map("workout_comments")
}

model WorkoutReaction {
  id        String   @id @default(cuid())
  workoutId String
  userId    String
  emoji     String                        // 🔥💪🏆😂👏😤🎉👀

  // Relations
  workout Workout @relation(fields: [workoutId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([workoutId, userId, emoji])
  @@map("workout_reactions")
}

// ─── Enums ──────────────────────────────────────────────

enum Unit {
  kg
  lbs
}

enum Gender {
  male
  female
  other
  prefer_not_to_say
}

enum Privacy {
  public
  invite_only
  private
  crew_only
}

enum Source {
  csv
  api
  manual
}

enum SetType {
  warmup
  normal
  failure
  dropset
}

enum CrewRole {
  owner
  admin
  member
}

enum ChallengeType {
  volume        // Iron King/Queen
  consistency   // Consistency King/Queen
  prs           // PR Breaker
  grinder       // Highest single-session
  custom        // Flexible
}

enum ChallengeStatus {
  upcoming
  active
  closed
}

enum GenderSplit {
  combined
  separate
}

enum BadgeCategory {
  streak
  volume
  pr
  exercise
  challenge
  special
}
```

### 5.3 API Routes

```
┌─────────────────────────────────────────────────────────────┐
│                        API STRUCTURE                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  /api/auth/[...nextauth]     NextAuth.js catch-all           │
│                                                              │
│  ─── Import ───                                              │
│  POST   /api/import/csv            Parse & store CSV data    │
│  POST   /api/import/hevy-sync      Trigger Hevy API sync     │
│  GET    /api/import/status         Get sync status           │
│                                                              │
│  ─── Workouts ───                                            │
│  GET    /api/workouts              List user's workouts       │
│  GET    /api/workouts/[id]         Get single workout        │
│  POST   /api/workouts              Create manual workout     │
│  DELETE /api/workouts/[id]         Delete workout            │
│                                                              │
│  ─── Users ───                                               │
│  GET    /api/users/[id]            Get user profile          │
│  GET    /api/users/[id]/stats      Get user dashboard stats  │
│  GET    /api/users/[id]/workouts   Get user's workouts       │
│  GET    /api/users/[id]/badges     Get user's badges         │
│  PATCH  /api/users/me              Update own profile        │
│                                                              │
│  ─── Crews ───                                               │
│  GET    /api/crews                 List/search crews         │
│  POST   /api/crews                 Create crew              │
│  GET    /api/crews/[id]            Get crew details          │
│  PATCH  /api/crews/[id]            Update crew              │
│  POST   /api/crews/[id]/join       Join crew                │
│  POST   /api/crews/[id]/leave      Leave crew               │
│  GET    /api/crews/[id]/feed       Crew activity feed       │
│  GET    /api/crews/[id]/members    Crew roster              │
│  PATCH  /api/crews/[id]/members/[uid]  Update member role   │
│  DELETE /api/crews/[id]/members/[uid]  Remove member        │
│                                                              │
│  ─── Challenges ───                                          │
│  POST   /api/crews/[id]/challenges    Create challenge       │
│  GET    /api/crews/[id]/challenges    List crew challenges   │
│  GET    /api/challenges/[id]          Get challenge details  │
│  POST   /api/challenges/[id]/join     Join challenge         │
│  GET    /api/challenges/[id]/leaderboard  Live leaderboard   │
│  GET    /api/challenges/[id]/results  Final results          │
│                                                              │
│  ─── Leaderboards ───                                        │
│  GET    /api/leaderboards/global      Global volume leaders  │
│  GET    /api/leaderboards/exercises/[name]  Exercise ranks   │
│  GET    /api/leaderboards/streaks     Streak leaders         │
│                                                              │
│  ─── Social ───                                              │
│  GET    /api/feed                    Global/crew feed        │
│  POST   /api/workouts/[id]/comments  Add comment             │
│  DELETE /api/workouts/[id]/comments/[cid] Delete comment     │
│  POST   /api/workouts/[id]/reactions Add/remove reaction     │
│                                                              │
│  ─── Exercises (reference) ───                               │
│  GET    /api/exercises               List exercises          │
│  GET    /api/exercises/search?q=     Search exercises        │
│                                                              │
│  ─── Badges ───                                              │
│  GET    /api/badges                  List all badges         │
│  POST   /api/badges/check            Check & award new badges│
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Authentication:** All routes except public leaderboards and landing page require authentication via NextAuth.js session. Crew-specific routes check membership. Admin-only routes check role.

**Rate Limiting:** Via Vercel Edge config or `upstash-ratelimit`. Import routes: 5/min for CSV, 1/min for API sync. General API: 60/min.

### 5.4 Background Jobs

#### 5.4.1 Hevy API Auto-Sync (Vercel Cron)

```
Schedule: Every 6 hours (0, 6, 12, 18 UTC)
Route:    /api/cron/hevy-sync

Algorithm:
1. Query all users with hevyApiKeyEncrypted NOT NULL
2. For each user:
   a. Decrypt API key
   b. Fetch workout events since user.hevyLastSyncAt (paginated)
   c. Upsert new/changed workouts (match by hevyWorkoutId)
   d. Handle deleted workouts (remove or mark deleted)
   e. Update user.hevyLastSyncAt
   f. On failure: log error, retry next cycle
3. After all users synced:
   a. Recalculate active challenge scores
   b. Check & award new badges
   c. Update global leaderboard cache
```

#### 5.4.2 Weekly Challenge Finalization (Vercel Cron)

```
Schedule: Every Monday at 00:01 UTC
Route:    /api/cron/challenge-finalize

Algorithm:
1. Find all challenges with endDate <= now() AND status = 'active'
2. For each challenge:
   a. Calculate final scores for all participants
   b. Set finalRank for each participant
   c. Update challenge status to 'closed'
   d. Award badges to winners:
      - 🥇 1st: Challenge-type winner badge
      - 🥈 2nd: Podium badge
      - 🥉 3rd: Podium badge
   e. Generate result announcement in crew feed
3. Check if any crews have auto-recurring challenges → create next week's
```

#### 5.4.3 Weekly Reminder Emails (Vercel Cron)

```
Schedule: Every Friday at 18:00 UTC (before weekend workouts)
Route:    /api/cron/weekly-reminders

Algorithm:
1. Find users who haven't synced in 5+ days
2. Find users in active challenges who are behind
3. Send emails via Resend:
   a. "Sync your workouts to stay on the leaderboard!"
   b. "You're 3,200 kg from 2nd place — 2 days left!"
   c. "Don't lose your 47-day streak!"
```

#### 5.4.4 Badge Check Job

```
Schedule: Every hour
Route:    /api/cron/badge-check

Algorithm:
1. For each user active in the last hour:
   a. Check streak milestones (7, 30, 90, 180, 365)
   b. Check volume milestones
   c. Check PR milestones
   d. Check exercise mastery levels
   e. Award any newly earned badges
   f. Generate feed announcement for rare badges
```

---

## 6. User Flows

### 6.1 New User Onboarding Flow

```
STEP 1: LANDING PAGE
┌─────────────────────────────────────────┐
│  🏋️ IRONCREW (working title)            │
│  The competitive layer for strength     │
│  training. Strava for lifting.          │
│                                          │
│  [Join with Discord]  [Sign up with Email]│
│  Already have an account? [Sign In]      │
│                                          │
│  "13M+ Hevy users. No competitions.     │
│   Until now."                            │
└─────────────────────────────────────────┘

STEP 2: IMPORT WORKOUTS
┌─────────────────────────────────────────┐
│  📥 Import Your Workouts                 │
│                                          │
│  ┌─────────────────────────────────┐    │
│  │                                 │    │
│  │   📁 Drop your Hevy CSV here     │    │
│  │   or click to browse            │    │
│  │                                 │    │
│  │   Export from Hevy app:          │    │
│  │   Settings → Export CSV          │    │
│  │                                 │    │
│  └─────────────────────────────────┘    │
│                                          │
│  ── or ──                               │
│                                          │
│  [🔗 Connect Hevy API Key]               │
│  [✏️ Enter Workouts Manually]            │
│  [⏭️ Skip for now]                       │
└─────────────────────────────────────────┘

STEP 2b: CSV PARSED (after upload)
┌─────────────────────────────────────────┐
│  ✅ CSV Parsed Successfully              │
│                                          │
│  📊 Summary:                             │
│  • 342 workouts found                    │
│  • 1,845 sets across 47 exercises        │
│  • Date range: Jan 2025 — May 2026       │
│                                          │
│  Top exercises:                          │
│  • Bench Press: 89 sessions              │
│  • Squat: 76 sessions                    │
│  • Deadlift: 54 sessions                 │
│                                          │
│  [Import All]  [Review & Select]         │
└─────────────────────────────────────────┘

STEP 3: PROFILE SETUP
┌─────────────────────────────────────────┐
│  👤 Set Up Your Profile                  │
│                                          │
│  Display Name: [________________]        │
│  Avatar: [Upload] or use Discord         │
│  Timezone: [America/New_York     ▼]      │
│  Units:    (●) kg  ( ) lbs               │
│  Gender:   [Male ▼] (optional)           │
│  Bodyweight: [__] kg (optional)          │
│  Default Privacy:                        │
│    ( ) Public                            │
│    (●) Crew-only                         │
│    ( ) Private                           │
│                                          │
│  [Continue]                              │
└─────────────────────────────────────────┘

STEP 4: FIND YOUR CREW
┌─────────────────────────────────────────┐
│  👥 Find Your Crew                       │
│                                          │
│  🔍 [Search crews...]                    │
│                                          │
│  Featured Crews:                         │
│  ┌─────────────────────────────────┐    │
│  │ 💀 Iron Legion                  │    │
│  │ 1,247 members • Public          │    │
│  │ "For those who never skip..."   │    │
│  │ [Join]                          │    │
│  ├─────────────────────────────────┤    │
│  │ 🦾 Valkyrie Squad               │    │
│  │ 892 members • Public            │    │
│  │ "Women who lift heavy"          │    │
│  │ [Join]                          │    │
│  └─────────────────────────────────┘    │
│                                          │
│  ── or ──                               │
│                                          │
│  [🏗️ Create Your Own Crew]               │
│  [⏭️ Skip for now]                       │
└─────────────────────────────────────────┘

STEP 5: YOUR FIRST CHALLENGE
┌─────────────────────────────────────────┐
│  ⚔️ Your First Challenge                 │
│                                          │
│  Active in Iron Legion:                  │
│  ┌─────────────────────────────────┐    │
│  │ 👑 IRON KING — Week 20          │    │
│  │ 3 days remaining                │    │
│  │ 48 participants                 │    │
│  │ Current leader: Mike (42,000 kg)│    │
│  │ [Join Challenge]                │    │
│  └─────────────────────────────────┘    │
│                                          │
│  [View All Challenges]                   │
│  [Go to Dashboard →]                     │
└─────────────────────────────────────────┘

STEP 6: DASHBOARD (first visit — empty state)
┌─────────────────────────────────────────┐
│  👋 Welcome, Alex!                       │
│                                          │
│  Your dashboard will light up as you     │
│  log workouts and join challenges.       │
│                                          │
│  🔥 Streak: 1 day (just getting started!)│
│  📊 Volume: 0 kg this week               │
│  🏆 PRs: 0 tracked                       │
│  ⚔️ Active challenges: 1                  │
│                                          │
│  [Sync More Workouts]                    │
│  [Join a Challenge]                      │
│  [Invite Friends]                        │
└─────────────────────────────────────────┘
```

### 6.2 Weekly Challenge Flow (Detailed)

```
MONDAY 00:01 UTC — NEW CHALLENGE CREATED
┌─────────────────────────────────────────┐
│  Auto-post in crew feed:                │
│  ⚔️ "New challenge: IRON KING Week 21!  │
│      7 days. Most volume wins.           │
│      Challenge starts now!"             │
│                                          │
│  All crew members auto-enrolled if       │
│  crew has auto-join enabled.            │
└─────────────────────────────────────────┘

MONDAY — USER OPENS APP
┌─────────────────────────────────────────┐
│  📱 Notification dot on Challenges tab   │
│                                          │
│  ⚔️ Active Challenge: IRON KING W21      │
│  ⏰ 6d 23h remaining                     │
│                                          │
│  Rank  User        Score                 │
│  —     (no scores yet)                   │
│  Everyone starts at 0. Be the first      │
│  to log a workout! 🏋️                    │
└─────────────────────────────────────────┘

MONDAY EVENING — AFTER FIRST WORKOUTS
┌─────────────────────────────────────────┐
│  ⚔️ IRON KING — Week 21                  │
│  ⏰ 6d 05h remaining                     │
│                                          │
│  1. Mike     12,400 kg  ████████████    │
│  2. Sarah     9,800 kg  ██████████      │
│  3. YOU       8,200 kg  ████████        │
│  4. John      7,500 kg  ███████         │
│  5. Alex      5,100 kg  █████           │
│  ...                                     │
│                                          │
│  📈 You're in 3rd! 4,200 kg to #1.      │
└─────────────────────────────────────────┘

WEDNESDAY — MID-WEEK UPDATE
┌─────────────────────────────────────────┐
│  ⚔️ IRON KING — Week 21                  │
│  ⏰ 4d 03h remaining                     │
│                                          │
│  1. Mike     38,200 kg  ██████████ ↑    │
│  2. YOU      35,800 kg  █████████  ↑1   │
│  3. Sarah    32,100 kg  ████████  ↓1    │
│  4. John     22,400 kg  ██████    —     │
│  5. NewGuy   18,900 kg  █████     ↑2    │
│  ...                                     │
│                                          │
│  🔥 You moved up to 2nd!                 │
│  2,400 kg to take the lead.              │
│                                          │
│  💬 Mike: "Not giving up #1 easily 😤"   │
└─────────────────────────────────────────┘

SUNDAY 23:59 — CHALLENGE CLOSES
┌─────────────────────────────────────────┐
│  ⏰ Challenge is now closed!             │
│  Final scores being calculated...        │
└─────────────────────────────────────────┘

MONDAY 00:01 — RESULTS POSTED
┌─────────────────────────────────────────┐
│  🎉 IRON KING WEEK 21 — RESULTS!         │
│                                          │
│        🥇                                │
│    Mike • 62,400 kg                      │
│   🥈          🥉                         │
│  You    Sarah                             │
│ 58,100  54,200                            │
│                                          │
│  🏅 Badges awarded:                      │
│  • Mike earned "Iron King" badge!        │
│  • You earned "Podium Fixture" (10 podiums)!│
│  • Sarah earned "Iron Queen" badge!      │
│                                          │
│  ⚔️ IRON KING Week 22 starts now!        │
│  [Join Week 22]                          │
└─────────────────────────────────────────┘
```

### 6.3 CSV Re-sync Flow

```
TRIGGER: User hasn't synced in 5+ days
AND is in an active challenge
AND has opted into reminders

FRIDAY 18:00 — EMAIL/DISCORD REMINDER
┌─────────────────────────────────────────┐
│  To: user@email.com                      │
│  Subject: ⚔️ 2 days left in Iron King!    │
│                                          │
│  Hey Alex,                               │
│                                          │
│  You're currently in 3rd place in        │
│  Iron King Week 21. But your last sync   │
│  was 5 days ago — you might have         │
│  un-synced workouts!                     │
│                                          │
│  Sarah is only 4,200 kg behind you.      │
│  Sync now to hold your podium spot!      │
│                                          │
│  [Sync Workouts →]                       │
│                                          │
│  - IronCrew                               │
└─────────────────────────────────────────┘

USER RETURNS TO APP
┌─────────────────────────────────────────┐
│  📥 Sync Your Workouts                   │
│                                          │
│  Last synced: May 9 (5 days ago)         │
│                                          │
│  ┌─────────────────────────────────┐    │
│  │   📁 Drop your latest CSV here    │    │
│  │   or click to browse             │    │
│  └─────────────────────────────────┘    │
│                                          │
│  Uploading new CSV...                    │
│  ✅ Found 4 new workouts                 │
│  ⏭️ Skipped 338 duplicates               │
│                                          │
│  Workouts imported:                      │
│  • May 10 — Leg Day (12,400 kg)          │
│  • May 12 — Push Day (10,200 kg)  🏆 PR! │
│  • May 13 — Pull Day (9,800 kg)          │
│  • May 14 — Leg Day (14,100 kg)          │
│                                          │
│  Total new volume: 46,500 kg!            │
│                                          │
│  📈 Challenge update:                     │
│  You moved from 3rd → 2nd! 🎉            │
│  4,300 kg to take #1.                    │
│                                          │
│  [View Challenge]  [Go to Dashboard]     │
└─────────────────────────────────────────┘
```

---

## 7. Design Principles & UI Concepts

### 7.1 Core Design Principles

1. **Mobile-First:** Gym users are on phones — at the gym, between sets, checking stats. Every screen must work perfectly at 375px width. Desktop is the enhancement, not the baseline.

2. **Dark Mode Default:** The gym aesthetic is dark, moody, high-contrast. Think iron, chalk, gym lighting. Dark backgrounds with bright accent colors. Light mode available but not default.

3. **Bold Typography:** Numbers are the hero. Big, aggressive stats. Weight classes and volume totals should be impossible to miss. Use variable fonts for fluid scaling.

4. **Leaderboards as Hero:** The leaderboard isn't a feature — it's THE feature. It should dominate challenge and crew pages. Big, animated, competitive. Position changes should feel dramatic.

5. **Fast Feedback:** Every action should have immediate visual feedback. Sync workouts → numbers animate up. Beat someone → position pops. PR broken → confetti.

6. **Progressive Disclosure:** Don't overwhelm new users. Empty states are welcoming, not barren. Features reveal themselves as users engage more.

### 7.2 Color System

```
Dark Theme (Default)
─────────────────────────────────────────
Background:     #0A0A0B  (near-black)
Surface:         #141416  (card bg)
Surface-Alt:     #1A1A1D  (hover states)
Border:          #2A2A30  (subtle separators)
Text Primary:    #FAFAFA  (white-ish)
Text Secondary:  #A0A0A8  (muted)
Text Muted:      #606068  (disabled hints)

Accent Colors:
Gold (1st):      #FFD700  (podium, winners)
Silver (2nd):    #C0C0C0  (runner-up)
Bronze (3rd):    #CD7F32  (third place)
Red (PRs):       #FF4444  (PR badges, highlights)
Green (volume):  #00C853  (volume bars, increases)
Blue (links):    #3B82F6  (links, interactive)
Orange (fire):   #FF6D00  (streak flame)
Purple (badge):  #9C27B0  (special badges)

Muscle Group Colors (consistent across app):
Chest:           #E91E63  (pink-red)
Back:            #2196F3  (blue)
Legs:            #FF9800  (orange)
Shoulders:       #4CAF50  (green)
Arms:            #9C27B0  (purple)
Core:            #00BCD4  (cyan)
```

### 7.3 Typography

```
Font Stack:
- Display (headings/stats): "Inter" or "Space Grotesk"
- Body: "Inter"
- Mono (numbers in tables): "JetBrains Mono" or "Fira Code"

Scale:
- Hero stats (volume, streak): text-5xl / text-6xl, font-bold
- Leaderboard ranks: text-3xl, font-black
- Section headers: text-2xl, font-bold
- Body: text-base
- Captions: text-sm
- Badging: text-xs, font-semibold, uppercase tracking-wide
```

### 7.4 Key UI Components

#### Podium Animation

```
Challenge results podium:

         🥇
      [avatar]
      Mike
      62,400 kg

  🥈              🥉
[avatar]       [avatar]
 You            Sarah
58,100         54,200

Animation:
- Bars grow from bottom over 1 second (staggered start)
- Confetti burst for top 3
- Badge fly-in for winners
- Position shake for close margins ("You won by 400 kg!")
```

#### Leaderboard Row

```
┌──────────────────────────────────────────────┐
│  1  [AV]  Mike         52,400 kg  ████████  │ ← gold accent left
│  2  [AV]  Sarah     ↑1  44,100 kg  ██████    │ ← silver
│  3  [AV]  YOU           38,200 kg  █████     │ ← highlighted (your row)
│  4  [AV]  John       ↓1  24,000 kg  ████      │ ← muted
│  5  [AV]  Alex           18,500 kg  ███       │
└──────────────────────────────────────────────┘

- Your row: background highlight, subtle glow
- Position changes: green ↑ arrow for up, red ↓ for down, gray — for unchanged
- Progress bars: fill proportionally to leader's score
- Avatars: small circles, 32px
- Verified users: checkmark badge on avatar
```

#### Streak Flame

```
Small streak (1-6 days):
🕯️ 3 DAYS (small candle)

Building streak (7-29 days):
🔥 12 DAYS (small fire)

Strong streak (30-89 days):
🔥 47 DAYS (medium fire with glow)

Impressive streak (90-179 days):
🔥 120 DAYS (large fire, particles)

Legendary streak (180-364 days):
🔥 220 DAYS (inferno, screen shake on milestone)

Eternal (365+ days):
🔥 412 DAYS (custom animation, special badge effect)
```

#### Workout Frequency Heatmap

```
GitHub-style contribution grid.
Each cell = 1 day. Color intensity = total volume.

No workout:      #1A1A1D  (matches surface)
Light volume:    #0E4429  (green scale)
Medium volume:   #006D32
Heavy volume:    #26A641
Extreme volume:  #39D353

Hover tooltip:
"May 14, 2026
 2 workouts
 18,400 kg total volume
 🏆 1 PR broken"

Click → filters workout list to that day
```

#### Badge Card

```
┌──────────────────────┐
│  🏆                  │
│  PR Machine          │  ← Earned: colored, shiny
│  Broke 10 PRs        │
│  Earned May 12, 2026 │
└──────────────────────┘

┌──────────────────────┐
│  🔥                  │
│  Inferno             │  ← Locked: greyed out, opaque
│  180-day streak      │
│  🔒 133 days to go   │
└──────────────────────┘
```

### 7.5 Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | 320–640px | Single column, bottom nav, stacked cards |
| Tablet | 641–1024px | Two column where useful, side nav |
| Desktop | 1025px+ | Full layout, side nav, multi-column dashboards |

**Mobile navigation:**
```
Bottom tab bar:
[🏠 Home] [👥 Crews] [⚔️ Challenges] [🏆 Leaderboards] [👤 Profile]
```

**Desktop navigation:**
```
Left sidebar with all nav items, icons + labels
Main content area
Right sidebar (contextual: challenge leaderboard, upcoming events)
```

### 7.6 Micro-interactions

| Trigger | Animation |
|---------|-----------|
| Upload CSV | File drops → progress ring → checkmark pulse → stats count up |
| Break PR | Confetti burst + badge fly-in + workout card highlight pulse |
| Pass someone on leaderboard | Row slides up with spring physics + "↑" badge pop |
| Win challenge | Full podium animation + celebration overlay + badge award sequence |
| Earn badge | Badge card flies in from bottom with bounce + haptic-style shake |
| Streak milestone | Flame grows with particle effect + number counter ticks up |
| React to workout | Emoji pops with scale bounce + reaction count ticks up |
| Join crew | Welcome animation: crew name types out, member count increments |

---

## 8. Roadmap

### v0.5 — MVP (4–6 weeks, solo developer)

**Goal:** Usable product with core competitive loop.

| Week | Deliverables |
|------|-------------|
| **Week 1** | Project scaffold (Next.js, Prisma, Supabase, NextAuth), database schema, Discord OAuth |
| **Week 2** | CSV import pipeline (Papa Parse + server processing), manual workout entry, profile settings |
| **Week 3** | Personal dashboard (streak, volume, PR detection, heatmap), workout list/detail views |
| **Week 4** | Crews: create, join, feed, roster, roles. Challenge system: create, join, leaderboard, scoring |
| **Week 5** | Challenge types (Iron King, Consistency, PR Breaker, Grinder), podium results, challenge history |
| **Week 6** | Global leaderboards, badges (award logic + showcase), social reactions/comments, polish |

**MVP ships with:**
- ✅ Discord & email auth
- ✅ CSV import & manual entry
- ✅ Personal dashboard (streak, volume, PRs, heatmap)
- ✅ Crews (create, join, feed, roster)
- ✅ 4 challenge types (Iron King, Consistency King, PR Breaker, Grinder)
- ✅ Challenge leaderboards (live scores)
- ✅ Global exercise leaderboards
- ✅ Badge system (streak, volume, PR, challenge badges)
- ✅ Reactions & comments on workouts
- ✅ Dark mode, mobile-first responsive design

### v0.6 — Auto-Sync & Engagement (2–3 weeks)

- Hevy API key connect & auto-sync
- Vercel Cron jobs (sync, challenge finalization)
- Weekly reminder emails via Resend
- Shareable workout cards (OG images)
- Custom (Flexible) challenge type
- Challenge auto-recurrence
- User search & crew discovery improvements
- Notification system (in-app)

### v0.7 — Global Scale (2–3 weeks)

- Global leaderboards with percentile rankings
- Weight class filtering on all leaderboards
- Exercise-specific rankings with depth
- Crew-vs-crew challenge mode
- Advanced PR detection (rep PRs, volume PRs)
- User profile pages with full stats
- Activity feed (global + crew filtered)

### v0.8 — Cross-Platform (2–3 weeks)

- **Strong app** CSV format support
- **Lyfta** CSV format support
- Manual entry improvements (templates, quick-log)
- Bulk import from multiple CSVs
- Data export for users (GDPR compliance)
- Dark/light theme toggle
- Accessibility pass

### v0.9 — Mobile PWA (2–3 weeks)

- PWA setup (service worker, offline support, install prompt)
- Push notifications (challenge updates, PRs from crew, reminders)
- Mobile-optimized manual entry (quick-add sets)
- Camera integration for workout photos
- Share extensions (share directly to crew feed)

### v1.0 — Intelligence (3–4 weeks)

- AI coach insights (GPT-4o integration):
  - "Your bench press is plateauing — try adding close-grip bench as accessory"
  - "You haven't trained legs in 8 days"
  - "Your volume is trending up 12% month-over-month"
- Workout recommendations based on gaps
- Advanced analytics (progressive overload tracking, plateau detection)
- Training age estimation from data

### v1.5 — Real-World (4–6 weeks)

- Gym partnerships (verified gym check-ins)
- Gym-vs-gym competitions
- Local leaderboards ("Strongest in [City]")
- Event organization (meetups, mock meets)
- QR codes for gym leaderboard displays

### v2.0 — Native & Platform (6–8 weeks)

- React Native mobile app (iOS + Android)
- OAuth integration with Hevy (if/when they build it)
- Live workout tracking (start workout in app, real-time leaderboard)
- Video upload for form checks / PR verification
- API for third-party integrations

---

## 9. Monetization (Post-MVP)

Monetization begins at v0.7+ once there's a proven user base. The free tier must remain genuinely useful to maintain the network effect.

### 9.1 Tier Structure

| Feature | Free | Pro ($5/mo) | Crew ($10/mo) |
|---------|:---:|:---:|:---:|
| Crews | 1 crew | Unlimited | Shared crew benefits |
| Challenges | Basic types | All types + custom | Shared crew benefits |
| Data import | CSV + manual | CSV + API auto-sync | — |
| Analytics | Basic dashboard | Advanced (plateau detection, trends) | — |
| Badges | Standard | Custom crew badges | Custom crew badges |
| Leaderboards | Global view | Filtered, percentiles, insights | — |
| Ad-free | ✅ | ✅ | ✅ |
| Crew size | Up to 50 | Up to 50 | Up to 500 |
| API auto-sync | ❌ | ✅ (daily) | — |
| Challenge history | Last 4 weeks | Unlimited | Unlimited |
| Export data | ❌ | ✅ | — |
| Priority support | ❌ | ✅ | ✅ |

### 9.2 Revenue Projections (Illustrative)

```
Conservative scenario (Year 1):
- 10,000 active users
- 3% conversion to Pro ($5/mo) = 300 users × $60/yr = $18,000/yr
- 1% Crew subscriptions ($10/mo) = 100 crews × $120/yr = $12,000/yr
- Total: ~$30,000 ARR

Moderate scenario (Year 1):
- 50,000 active users
- 4% Pro conversion = 2,000 × $60/yr = $120,000/yr
- 2% Crew conversion = 1,000 × $120/yr = $120,000/yr
- Total: ~$240,000 ARR

Optimistic scenario (Year 1):
- 200,000 active users
- 5% Pro conversion = 10,000 × $60/yr = $600,000/yr
- 3% Crew conversion = 6,000 × $120/yr = $720,000/yr
- Total: ~$1,320,000 ARR
```

### 9.3 Costs (MVP / Scaling)

| Phase | Monthly Cost | Services |
|-------|:---:|----------|
| MVP (v0.5–v0.6) | $0–20/mo | Vercel free, Supabase free, Resend free tier |
| Growth (v0.7–v0.9) | $50–200/mo | Vercel Pro ($20), Supabase Pro ($25), Resend, domain |
| Scale (v1.0+) | $500–2,000/mo | Vercel Team, Supabase scaled, monitoring, email volume |
| Enterprise (v2.0+) | TBD | Dedicated infrastructure, team salaries |

---

## 10. Risks & Mitigations

### Risk Matrix

| Risk | Likelihood | Impact | Mitigation | Trigger |
|------|:---:|:---:|---|---|
| **Hevy builds this natively** | Medium | High | Build cross-platform (Strong, Lyfta, manual entry). Move faster than a 13M-user company can ship. Our moat is multi-app aggregation. | Hevy announces groups/challenges features |
| **Low engagement between challenges** | Medium | Medium | Streak tracking, daily feed, PR celebrations, badges create daily hooks. Reactions/comments are lightweight engagement. Heatmap creates "don't break the chain" behavior. | DAU drops outside challenge windows |
| **CSV friction reduces retention** | High | Medium | Make import absurdly easy (drag & drop, one click). Show immediate value after import. Upsell API auto-sync as "set and forget." Email reminders for re-sync. | High drop-off at import step |
| **Cheating via fake CSV uploads** | High | Medium | "Verified" badge for API-connected users. Flag algorithm for suspicious uploads. Crew admins can review. Leaderboards show trust tier. Manual entries don't qualify for global rankings. | Suspicious leaderboard positions |
| **Data privacy concerns** | Medium | High | Clear privacy controls from day one. User chooses public/crew-only/private per workout. No data sold, ever. GDPR-compliant (user can export/delete). Privacy policy is plain language, not legalese. | Privacy complaints or regulatory issues |
| **Hevy changes CSV format** | Low | Medium | CSV parser is version-aware. Parse header row dynamically. Community will flag changes quickly. Fall back to manual entry if parsing fails. | CSV import fails after Hevy update |
| **Hevy API rate limits / changes** | Low | Medium | Respect rate limits, use exponential backoff. Sync is not real-time (every 6 hours is fine). Cache Hevy exercise database locally. | API sync failures increase |
| **Cold start problem (empty crews)** | High | Medium | Seed featured crews. "Solo mode" works without a crew — global leaderboards provide competition. Onboarding suggests popular crews. Invite links make growth viral. | New users join but find empty crews |
| **App store dependency (PWA)** | Low | Low | PWA avoids app store entirely. Push notifications work on Android PWA. iOS PWA support improving. Native app is v2.0 — far future. | PWA limitations block key features |
| **Server costs scaling unexpectedly** | Low | Low | Vercel + Supabase scale with usage. Free tiers are generous. Can optimize queries, add caching. Can introduce ads on free tier if needed. | Monthly bill exceeds projections by 3× |
| **Competitor emerges** | Medium | Medium | First-mover advantage in a niche. Multi-app support is moat. Community loyalty (crews are sticky). Open-source could be a strategy to build trust. | Similar product launches |
| **Discord as primary auth dependency** | Low | Medium | Email/password auth also available. Can add Google OAuth quickly. Discord is reliable and gym community uses it heavily. | Discord OAuth has extended outage |

### 10.1 Detailed Mitigation: Hevy Building This Natively

**Why we survive even if Hevy adds these features:**

1. **Multi-app:** We support Strong, Lyfta, and manual entry. Hevy will only support Hevy. Cross-app crews are our unique value.
2. **Speed:** A solo developer can ship features in days. A 13M-user company with iOS, Android, and backend teams takes months per feature with QA, rollout, and platform review cycles.
3. **Focus:** Hevy's core product is workout tracking. Social/competitive features are a distraction from that. Our entire product is social/competitive.
4. **Niche depth:** We can go deeper on the competitive experience than a general-purpose app ever will (custom challenges, detailed leaderboards, celebration UX).
5. **Community ownership:** Users invest in crews they build. Switching costs are real — losing your crew, challenge history, badges, and stats.

### 10.2 Detailed Mitigation: Cheating Prevention

```
Trust Tier System:

TIER 3 (⭐⭐⭐ Trusted):
- Hevy API connected
- Workouts independently verifiable via Hevy API
- Eligible for all leaderboards
- "Verified Athlete" badge

TIER 2 (⭐⭐ Standard):
- CSV uploaded
- Plausible data patterns
- Eligible for crew challenges
- Eligible for global leaderboards with flag

TIER 1 (⭐ Basic):
- Manual entry
- Crew challenges only (admin discretion)
- Not eligible for global leaderboards

Anti-Cheat Algorithm:
1. Track user's average weekly volume (rolling 4-week window)
2. Flag any week where volume >3σ above mean
3. Flag any single workout >2× previous max session
4. Flag new accounts (<2 weeks) with top-10% numbers
5. Flag PRs with exact round numbers (100.0 kg on the dot, 10.0 reps)
6. Flag overlapping workout timestamps
7. Manual review queue for crew admins
8. Repeat flags → auto-exclusion from global leaderboards for 30 days
```

### 10.3 Detailed Mitigation: Cold Start

```
Week 1–2 (Pre-launch):
- Recruit 20–30 beta testers from Hevy community (Reddit r/hevy, Discord)
- Seed 3–4 crews with active members
- Pre-load with real workout data

Week 3–4 (Soft launch):
- Post on r/hevy: "I built Strava for Hevy"
- Post on r/powerlifting, r/bodybuilding, r/gym
- Discord community server launch
- "Invite your gym buddy" referral system

Week 5+ (Growth):
- Featured crews on landing page (sorted by activity)
- "Crew of the Week" spotlight
- Challenge results are shareable → viral potential
- YouTube/TikTok fitness influencer partnerships
- Hevy app community (Hevy may share user-created tools)
```

---

## Appendix A: Competitive Research References

| Source | URL | Relevance |
|--------|-----|-----------|
| Hevy Official | https://hevy.com | Primary data source, 13M users |
| Hevy API Docs | https://api.hevyapp.com/docs | Integration reference |
| Strava | https://strava.com | Product model reference (clubs, challenges, segments) |
| StrengthLevel | https://strengthlevel.com | Strength standards, no social |
| OpenPowerlifting | https://openpowerlifting.org | Raw powerlifting data, no social |
| LiftShift.app | GitHub | Third-party Hevy analytics |
| RepIQ | GitHub | Third-party Hevy analytics |
| Hevy Reddit | r/hevy | Community pulse, pain points |

## Appendix B: Hevy CSV Format Reference

```
CSV Columns (from Hevy export):
- workout_id: UUID
- title: "Push Day", "Leg Day", etc.
- start_time: ISO 8601
- end_time: ISO 8601
- description: optional text
- exercise_title: "Bench Press (Barbell)"
- exercise_template_id: 8-char hex
- set_type: "normal", "warmup", "failure", "dropset"
- weight_kg: number
- reps: integer
- distance_meters: number or empty
- duration_seconds: number or empty
- rpe: number or empty
- notes: optional text
```

## Appendix C: Hevy API Basics

```
Base URL: https://api.hevyapp.com
Auth: Bearer token (API key from app settings)
Key endpoints:
- GET /v1/workouts?page=1&pageSize=10
- GET /v1/workouts/{id}
- GET /v1/workouts/events?since=2024-01-01T00:00:00Z
- GET /v1/exercise_templates?page=1&pageSize=100
- GET /v1/routines?page=1&pageSize=5

Rate limits: Not documented publicly, assume ~60/min
Pagination: 10 items per page for workouts
```

---

## Appendix D: Working Title Options

| Name | Vibe | Available? |
|------|------|:---:|
| **IronCrew** | Gritty, crew-focused, iron = weights | Check |
| **LiftSquad** | Casual, social, squad = crew | Check |
| **RepWar** | Competitive, aggressive | Check |
| **GymLeague** | Esports-adjacent, structured competition | Check |
| **IronLedger** | Data-focused, ledger = records | Check |
| **PowerCrew** | Powerlifting vibe, crew-centric | Check |
| **SetCount** | Minimalist, data-driven | Check |
| **BarPath** | Technical lifting term, strava-like naming | Check |

*Current working title: **IronCrew*** 🏋️

---

> *"You can't improve what you don't measure. You can't compete if you're measuring alone."*
>
> This document outlines an MVP. It will evolve. Ship fast, learn faster.
