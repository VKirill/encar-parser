---
title: Active Pipeline Tasks
type: reference
created: 2026-04-29
updated: 2026-04-29
status: active
confidence: low
tags: [active-tasks, pipeline, task-board]
sources: []
---

# Active Pipeline Tasks

No active pipeline tasks at snapshot time (`2026-04-29`).

The expected task-board snapshot file was not present in this checkout, so there are no prefetched task records to group by `planning`, `approved`, `in_work`, `questions`, or `blocked`.

## Snapshot scope

This page is intentionally a task-board snapshot, not a code TODO list. It should only report tasks that come from the pipeline task source. Because the snapshot source is absent, this page must not infer tasks from gotchas, code comments, local logs, or wiki gaps.

> [!IMPORTANT]
> Do not convert risks from [gotchas](gotchas.md) or documentation needs from [gaps](gaps.md) into “active tasks” unless they appear in a future task-board snapshot. Those pages describe potential work; this page describes work already accepted by the task pipeline.

## Planning

No tasks in `planning` at snapshot time.

## Approved

No tasks in `approved` at snapshot time.

## In work

No tasks in `in_work` at snapshot time.

## Questions

No tasks in `questions` at snapshot time.

## Blocked

No tasks in `blocked` at snapshot time.

## How to update this page when tasks exist

When the pipeline provides a task snapshot, replace the empty sections above with one table per status. Keep each task entry short and factual:

| Field | Required content |
|---|---|
| Task | Link formatted as `task:<id>` |
| Title | Task title from the snapshot |
| Summary | One sentence about what code or behavior changes |
| Blocker | Only for `blocked`; state the blocker from the snapshot |

Use this shape for each status section:

| Task | Title | Summary | Blocker |
|---|---|---|---|
| `task:<id>` | `<title>` | `<one-line change>` | `<blocked reason or —>` |

## What not to add

- Do not add guessed tasks from known risks.
- Do not add general maintenance ideas.
- Do not add documentation gaps unless the task board contains a matching task.
- Do not add Git commit history as a substitute for active task state.

## See also

- [active areas](active-areas.md) — where current churn appears in commits and operational logs.
- [gaps](gaps.md) — candidate documentation work that is not necessarily active.
- [gotchas](gotchas.md) — risks and failure modes that may become future tasks.