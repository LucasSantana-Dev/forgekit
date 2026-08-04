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

  test("ignores malformed merge-pr ids", () => {
    const backlog = {
      tasks: [
        { id: "merge-pr-abc", title: "Merge the thing", status: "ready" },
        { id: "xmerge-pr-12", title: "Not really a PR task", status: "ready" },
      ],
    };

    const { changes } = reconcileBacklog(
      backlog,
      {
        isPrMerged: () => true,
        hasReleaseTag: () => false,
      },
      1775220968000,
    );

    expect(backlog.tasks[0].status).toBe("ready");
    expect(backlog.tasks[1].status).toBe("ready");
    expect(changes).toEqual([]);
  });

  test("handles tasks with undefined id and title", () => {
    const backlog = {
      tasks: [{ status: "ready" }],
    };

    const { changes } = reconcileBacklog(
      backlog,
      {
        isPrMerged: () => true,
        hasReleaseTag: () => true,
      },
      1775220968000,
    );

    expect(backlog.tasks[0].status).toBe("ready");
    expect(backlog.tasks[0].completedAt).toBeUndefined();
    expect(changes).toEqual([]);
  });

  test("ignores non-semver release titles and malformed release ids", () => {
    const backlog = {
      tasks: [
        { id: "release-vnext", title: "Ship vNext soon", status: "blocked" },
        { id: "release-v0-11-x", title: "Ship v0.11 soon", status: "blocked" },
      ],
    };

    const { changes } = reconcileBacklog(
      backlog,
      {
        isPrMerged: () => false,
        hasReleaseTag: () => true,
      },
      1775220968000,
    );

    expect(backlog.tasks[0].status).toBe("blocked");
    expect(backlog.tasks[1].status).toBe("blocked");
    expect(changes).toEqual([]);
  });

  test("does not mark task done from isPrMerged when no PR reference exists", () => {
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
        isPrMerged: () => true,
        hasReleaseTag: () => false,
      },
      1775220968000,
    );

    expect(backlog.tasks[0].status).toBe("ready");
    expect(changes).toEqual([]);
  });

  test("does not mark task done from hasReleaseTag when no tag reference exists", () => {
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
        hasReleaseTag: () => true,
      },
      1775220968000,
    );

    expect(backlog.tasks[0].status).toBe("ready");
    expect(changes).toEqual([]);
  });

  test("infers PR number from id alone when title has no PR reference", () => {
    const backlog = {
      tasks: [
        {
          id: "merge-pr-24",
          title: "Merge the feature branch",
          status: "ready",
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

    expect(backlog.tasks[0].status).toBe("done");
    expect(changes[0]).toContain("PR #24 merged");
  });

  test("rejects merge-pr ids with trailing junk after the number", () => {
    const backlog = {
      tasks: [
        { id: "merge-pr-24-beta", title: "Merge something", status: "ready" },
      ],
    };

    const { changes } = reconcileBacklog(
      backlog,
      {
        isPrMerged: () => true,
        hasReleaseTag: () => false,
      },
      1775220968000,
    );

    expect(backlog.tasks[0].status).toBe("ready");
    expect(changes).toEqual([]);
  });

  test("infers PR number from title alone, tolerating spacing variants", () => {
    const backlog = {
      tasks: [
        { id: "review-followup", title: "Review PR #24", status: "ready" },
        { id: "review-followup-2", title: "Review PR  #25", status: "ready" },
      ],
    };

    const { changes } = reconcileBacklog(
      backlog,
      {
        isPrMerged: (pr) => pr >= 24,
        hasReleaseTag: () => false,
      },
      1775220968000,
    );

    expect(backlog.tasks[0].status).toBe("done");
    expect(backlog.tasks[1].status).toBe("done");
    expect(changes).toHaveLength(2);
  });

  test("infers multi-digit release tag from title alone", () => {
    const backlog = {
      tasks: [
        {
          id: "ship-notes",
          title: "Publish release notes for v10.11.12",
          status: "blocked",
        },
      ],
    };

    const { changes } = reconcileBacklog(
      backlog,
      {
        isPrMerged: () => false,
        hasReleaseTag: (tag) => tag === "v10.11.12",
      },
      1775220968000,
    );

    expect(backlog.tasks[0].status).toBe("done");
    expect(changes[0]).toContain("v10.11.12");
  });

  test("infers release tag from id alone and rejects prefixed ids", () => {
    const backlog = {
      tasks: [
        { id: "release-v10-11-12", title: "Ship the release", status: "blocked" },
        { id: "release-v0-11", title: "Ship the other release", status: "blocked" },
        { id: "xrelease-v10-11", title: "Not a release task", status: "ready" },
      ],
    };

    const { changes } = reconcileBacklog(
      backlog,
      {
        isPrMerged: () => false,
        hasReleaseTag: () => true,
      },
      1775220968000,
    );

    expect(backlog.tasks[0].status).toBe("done");
    expect(backlog.tasks[1].status).toBe("done");
    expect(backlog.tasks[2].status).toBe("ready");
    expect(changes).toHaveLength(2);
    expect(changes[0]).toContain("v10.11.12");
    expect(changes[1]).toContain("v0.11.0");
  });
});
