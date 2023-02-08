#!/usr/bin/env node

import { Octokit } from 'octokit'
import dotenv from 'dotenv'

dotenv.config()

const octokit = new Octokit({
  auth: process.env.TOKEN,
  Accept: 'application/vnd.github.full+json',
})

async function getFollowers(): Promise<Array<string>> {
  const { data: followers } = await octokit.request('GET /user/followers', {})
  return followers.map((follower) => follower.login)
}

async function getFollowing(): Promise<Array<string>> {
  const { data: following } = await octokit.request('GET /user/following', {})
  return following.map((user) => user.login)
}

async function main(): Promise<void> {
  const followers = await getFollowers()
  const following = await getFollowing()

  const notFollowingBack = followers.filter(
    (follower) => !following.includes(follower),
  )
  const notFollowedBackBy = following.filter(
    (person) => !followers.includes(person),
  )

  if (notFollowingBack.length > 0)
    console.log(`Not following back: ${notFollowingBack.join(', ')}`)
  else console.log('Following all followers.')

  if (notFollowedBackBy.length > 0)
    console.log(`Not followed back by: ${notFollowedBackBy.join(', ')}`)
  else console.log('No user has unfollowed you.')

  notFollowedBackBy.forEach((unfollowed) => {
    console.log('Unfollowed: ' + unfollowed)
    octokit.request('DELETE /user/following/' + unfollowed, {})
  })

  notFollowingBack.forEach((followed) => {
    console.log('Now following: ' + followed)
    octokit.request('PUT /user/following/' + followed, {})
  })
}

console.log('Fetching following and followers...')
await main()
console.log('Done.')
