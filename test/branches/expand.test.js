import test from 'ava';
import expand from '../../lib/branches/expand';
import {gitRepo, gitCommits, gitCheckout} from '../helpers/git-utils';

test('Expand branches defined with regexp', async t => {
  const {cwd} = await gitRepo();
  await gitCommits(['First'], {cwd});
  await gitCheckout('1.1.x', true, {cwd});
  await gitCommits(['Second'], {cwd});
  await gitCheckout('1.x.x', true, {cwd});
  await gitCommits(['Third'], {cwd});
  await gitCheckout('2.x', true, {cwd});
  await gitCommits(['Fourth'], {cwd});
  await gitCheckout('next', true, {cwd});
  await gitCommits(['Fifth'], {cwd});
  await gitCheckout('pre/foo', true, {cwd});
  await gitCommits(['Sixth'], {cwd});
  await gitCheckout('pre/bar', true, {cwd});
  await gitCommits(['Seventh'], {cwd});

  const branches = [
    // Should match all maintenance type branches
    {name: /^\d\.[\dx](?:\.x)?$/},
    {name: 'master', channel: 'latest'},
    {name: /next/, channel: 'next'},
    {name: '/^pre\\/(\\w+)$/gi', channel: '$1', prerelease: 'prerelease-$1'},
    // Should be ignored as there is no matching branches in the repo
    {name: '/^missing\\/(\\w+)$/gi', channel: '$1', prerelease: '$1'},
    // Should be ignored as the matching branch in the repo is already matched by `/^pre\\/(\\w+)$/gi`
    {name: '/^pre\\/foo$/gi', channel: 'foo', prerelease: 'foo'},
  ];

  t.deepEqual(await expand({cwd}, branches), [
    {name: '1.1.x'},
    {name: '1.x.x'},
    {name: '2.x'},
    {name: 'master', channel: 'latest'},
    {name: 'next', channel: 'next'},
    {name: 'pre/bar', channel: 'bar', prerelease: 'prerelease-bar'},
    {name: 'pre/foo', channel: 'foo', prerelease: 'prerelease-foo'},
  ]);
});
