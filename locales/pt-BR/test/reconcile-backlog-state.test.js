import { describe, expect, test } from "@jest/globals";
import { reconcileBacklog } from "../scripts/reconcile-backlog-state.mjs";

describe("reconcileBacklog", () => {
  test("marks merge-pr task as done when PR is merged", () => {
    const backlog = {
      tasks: [
        {
          id: "merge-pr-24",
          title: "Review and merge PR #24",
          status: "in_progress",
        },
      ],
    };

    const { changes } = reconcileBacklog(
      backlog,
      {
        isPrMerged: (pr) => pr === 24,
        hasReleaseTag: () => false,
      },
      1775199807000,
    );

    expect(backlog.tasks[0].status).toBe("done");
    expect(backlog.tasks[0].completedAt).toBe(1775199807000);
    expect(changes).toHaveLength(1);
  });

  test("marks release task as done when tag exists", () => {
    const backlog = {
      tasks: [
        {
          id: "release-v0-11",
          title: "Release v0.11.0 after PR #24 merge",
          status: "blocked",
        },
      ],
    };

    const { changes } = reconcileBacklog(
      backlog,
      {
        isPrMerged: () => false,
        hasReleaseTag: (tag) => tag === "v0.11.0",
      },
      1775220968000,
    );

    expect(backlog.tasks[0].status).toBe("done");
    expect(backlog.tasks[0].completedAt).toBe(1775220968000);
    expect(changes).toHaveLength(1);
  });

  test("keeps tasks unchanged when no PR/tag evidence exists", () => {
    const backlog = {
      tasks: [
        {
          id: "hooks-manifest",
          title: "Portable hook manifest",
          status: "ready",
        },
      ],
    };

    const { changes } = reconcileBacklog(
      backlog,
      {
        isPrMerged: () => false,
        hasReleaseTag: () => false,
      },
      1775220968000,
    );

    expect(backlog.tasks[0].status).toBe("ready");
    expect(backlog.tasks[0].completedAt).toBeUndefined();
    expect(changes).toEqual([]);
  });

  test("does not overwrite existing done tasks", () => {
    const backlog = {
      tasks: [
        {
          id: "merge-pr-24",
          title: "Review and merge PR #24",
          status: "done",
          completedAt: 111,
        },
      ],
    };

    const { changes } = reconcileBacklog(
      backlog,
      {
        isPrMerged: (pr) => pr === 24,
        hasReleaseTag: () => false,
      },
      1775220968000,
    );

    expect(backlog.tasks[0].completedAt).toBe(111);
    expect(changes).toEqual([]);
  });
});
