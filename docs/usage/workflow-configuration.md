# Workflow configuration

Explanation about we can be achieved. Manage multiple release line in parallel, distribute releases to a certain group of users, work on large releases outside of of the normal incremental version flow
Goal: move code around in branches with merge => release accordingly
Mention all is done with `branches` config

## `branches` configuration

It's an Array. Order is significant. Each branch is a String or an Object.
Branch type will be determined. Depending on the order, the name of the branch (if String) and the Object props

Branch can be 3 types

Each type has it's own properties and rules


### Branch types

#### Release branches

##### Release branches properties

| Property  | Description                                                             | Default                                                                     |
|-----------|-------------------------------------------------------------------------|-----------------------------------------------------------------------------|
| `name`    | The Git branch holding the commits to analyze and the code to release.  | The value itself if defined as a `String`.                                  |
| `channel` | The distribution channel on which to publish releases from this branch. | `undefined` for the first release branch, `name` value for subsequent ones. |

```js
{
  "branches": ["master", "next"]
}
```
is strictly equivalent to:
```js
{
  "branches": [
    {"name": "master"},
    {"name": "next", "channel": "next"}
  ]
}
```

##### Release branches configuration rules

- At least one Release branch is required.
- A maximum of 3 Release branches can be defined.

##### Release branches workflow rules

###### Commit to a release branch

If multiple release branches are configured, when a commit is added, **semantic-release** will evaluate rules to prevent publishing releases with the same version number but different codebase. If an illegal commit commit is added to a branch, **semantic-release** will not perform the release and will return the `EINVALIDNEXTVERSION` error with explanation on how to move the offending commit to the appropriate branch.

Rule for 2 branches configuration:
- The last release on the first branch must always be at least one `major` version behind the first release of the second branch that is absent from the fist branch.

Rules for a 3 branches configuration:
- The last release on the first branch must always be at least one `minor` version behind the first release of the second branch that is absent from the fist branch.
- The last release on the second branch must always be at least one `major` version behind the first release of the third branch that is absent from the fist branch.

For example with a 3 release branches configuration,

```js
{
  "branches": ["master", "next", "next-major"]
}
```

Only the following commits will trigger a release:
- A `fix` commit on `master`.
- A `feat` commit on `next`, optionally followed by any number of `fix` and `feat` commits.
- A `BREAKING CHANGE` commit on `next-major`, optionally followed by any number of `fix` and `feat` and `BREAKING CHANGE` commits.

###### Merge into a release branch

- TODO Commit merged from another Release branch and associated with a release will trigger addChannel
- TODO Commit merged from another Release branch and not associated with a release or commits from an LTS or Pre-Release branch will be evaluated as above


TODO `merge`, `merge --no-ff` and `rebase` works with the CLI. But GitHub rebase and merge do allow the tag to be preserved.

https://help.github.com/articles/about-pull-request-merges/


#### LTS branches

##### LTS branches properties

| Property  | Description                                                                                                                                                                     | Default                                                                          |
|-----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------|
| `name`    | The Git branch holding the commits to analyze and the code to release.                                                                                                          | The value itself if defined as a `String`.                                       |
| `channel` | The distribution channel on which to publish releases from this branch.                                                                                                         | `name` value.                                                                    |
| `range`   | **Required** unless `name` formatted like `N.N.x` or `N.x` (`N` is a number). The range of [semantic versions](https://semver.org) (or release line) to support on this branch. | `name` value if it's formatted like `N.x`, `N.x.x` or `N.N.x` (`N` is a number). |

```js
{
  "branches": ["1.x", "2.x", "master"]
}
```
is strictly equivalent to:
```js
{
  "branches": [
    {"name": "1.x", "channel": "1.x", "range": "1.x"},
    {"name": "1.x", "channel": "2.x", "range": "2.x"},
    {"name": "master"}
  ]
}
```

##### LTS branches configuration rules

- The LTS branches must be defined before the [Release branches](#release-branches).
- The `range` value must be formatted like `N.x`, `N.x.x` or `N.N.x` (`N` is a number).
- The `range` value must be unique among all the LTS branches (but they can overlap).

##### LTS branches workflow rules

- Commit must trigger only within range and below first release of next branch
- Merge must comply with range
- Explain overlapping ranges
- Commit must trigger only lower that earliest on first release



#### Pre-release branches

##### Pre-release branches properties

| Property     | Description                                                                                                              | Default                                        |
|--------------|--------------------------------------------------------------------------------------------------------------------------|------------------------------------------------|
| `name`       | The Git branch holding the commits to analyze and the code to release.                                                   | -                                              |
| `channel`    | The distribution channel on which to publish releases from this branch.                                                  | `name` value.                                  |
| `prerelease` | **Required**. The pre-release detonation to append to [semantic versions](https://semver.org) released from this branch. | `name` value if `prerelease` is set to `true`. |

```js
{
  "branches": [
    "master",
    {"name": "beta", prerelease: true},
    {"name": "alpha", prerelease: true}
  ]
}
```
is strictly equivalent to:
```js
{
  "branches": [
    {"name": "master"},
    {"name": "beta", "channel": "beta", prerelease: "beta"},
    {"name": "alpha", "channel": "alpha", prerelease: "alpha"}
  ]
}
```

##### Pre-release branches configuration rules

- The Pre-release branches must be defined after the [Release branches](#release-branches).
- The `prerelease` value must be valid per the [Semantic Versioning Specification](https://semver.org/#spec-item-9).
- The `prerelease` value must be unique among all the Pre-release branches.

### Global configuration rules


## Examples
