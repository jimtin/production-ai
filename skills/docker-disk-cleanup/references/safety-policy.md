# Docker Disk Cleanup Safety Policy

## Default Boundary

This skill may ask Docker to remove resources Docker already classifies as unused:

- stopped containers
- unused networks
- unused images
- BuildKit cache
- dangling or unused volumes after attachment checks

It must not manually delete project directories, Docker Desktop data directories, named volumes,
database files, repo worktrees, or auth files.

## Active Work

Use active-gate mode when any of these are true:

- the user says a PR gate, validation gate, or build is active
- running container names look gate-related, such as `gate`, `review`, `verify`, `critical`, or
  `test`
- a recent cleanup race suggests another workflow is actively creating/removing Docker resources

Active-gate mode keeps pruning serialized but adds an age filter to image and builder pruning so
fresh gate artifacts are preserved.

## Volume Rule

Before volume pruning, list dangling volumes and check whether any container still references them.
If a referenced dangling volume is found, skip volume pruning and report the volume names. Do not
force-remove those volumes.

## Race Handling

Docker state can change between inspection and cleanup. If a container, image, network, or volume
disappears after it was listed, re-list and continue conservatively. Treat repeated Docker daemon
errors, unavailable Docker, or lock conflicts as blockers.

## Reporting

Reports should include command status and Docker's reclaimed-space output when available, but should
not include environment variables, auth headers, token files, or provider-specific secrets.
