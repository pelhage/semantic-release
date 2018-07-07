const {isRegExp, remove, omit, mapValues} = require('lodash');
const {getBranches} = require('../git');

const STRING_REGEX = /^\/(.*)\/(\w+)?$/;

module.exports = async ({cwd}, branches) => {
  const gitBranches = await getBranches({cwd});

  return branches.reduce((branches, branch) => {
    if (STRING_REGEX.test(branch.name) || isRegExp(branch.name)) {
      const [, pattern, flags] = STRING_REGEX.exec(branch.name);
      // Remove the `g` flags as the RegExp will be called multiple times and the previous match position shouldn't be saved
      const regexp = new RegExp(pattern, flags ? flags.replace(/g/g, '') : undefined);

      return [
        ...branches,
        ...remove(gitBranches, name => regexp.test(name)).map(name => ({
          name,
          ...mapValues(omit(branch, 'name'), value => name.replace(regexp, value)),
        })),
      ];
    }
    return [...branches, branch];
  }, []);
};
